"""
OpenIngest Data Lineage tracker (v3.0).

Tracks how data flows through the pipeline:
  source file → discovery → schema validation → quality checks → staging table → warehouse

Exposes:
  LineageGraph   — builds and stores the DAG of nodes and edges
  LineageNode    — a single step in the pipeline
  lineage_report — prints an ASCII lineage graph per dataset

Usage
-----
    from core.lineage import LineageGraph

    graph = LineageGraph()
    graph.add_dataset_lineage(dataset)    # called per dataset by pipeline

    graph.print_ascii()                   # terminal view
    graph.to_dict()                       # JSON-serialisable dict for web UI
    graph.to_mermaid()                    # Mermaid diagram syntax
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional


@dataclass
class LineageNode:
    """A single node in the lineage graph."""

    id: str                          # unique ID: "dataset:step"
    label: str                       # display name
    node_type: str                   # source | validation | quality | load | staging | warehouse
    dataset: str                     # parent dataset name
    source_file: Optional[str] = None   # file path (for source nodes)
    target_table: Optional[str] = None  # staging or warehouse table
    status: Optional[str] = None        # PASS | FAIL | SKIP
    rows: Optional[int] = None
    score: Optional[float] = None       # quality score 0–100


@dataclass
class LineageEdge:
    """A directed edge between two lineage nodes."""
    from_id: str
    to_id: str
    label: str = ""


@dataclass
class LineageGraph:
    """
    Directed acyclic graph (DAG) of pipeline lineage.

    Nodes represent pipeline stages; edges represent data flow.
    One graph instance is shared across the full pipeline run.
    """

    nodes: List[LineageNode] = field(default_factory=list)
    edges: List[LineageEdge] = field(default_factory=list)

    _node_index: Dict[str, LineageNode] = field(default_factory=dict, repr=False)

    def add_node(self, node: LineageNode) -> None:
        self._node_index[node.id] = node
        self.nodes.append(node)

    def add_edge(self, from_id: str, to_id: str, label: str = "") -> None:
        self.edges.append(LineageEdge(from_id=from_id, to_id=to_id, label=label))

    def add_dataset_lineage(self, dataset: Any) -> None:
        """
        Build the full lineage chain for a single dataset and add it to this graph.

        Produces nodes:
            source → discovery → schema_validation → quality_check → ingest → staging
        """
        name = dataset.name
        file_path = str(getattr(dataset, "file", "?"))
        table = getattr(dataset, "table", None) or f"stg_{name}"
        strategy = getattr(dataset, "load_strategy", "replace")
        rows = getattr(dataset, "rows_loaded", None)
        quality_score = getattr(dataset, "quality_score", None)
        quality_status = getattr(dataset, "quality_status", None)

        # 1. Source file
        src_id = f"{name}:source"
        self.add_node(LineageNode(
            id=src_id,
            label=file_path.split("/")[-1] if "/" in file_path else file_path,
            node_type="source",
            dataset=name,
            source_file=file_path,
        ))

        # 2. Discovery
        disc_id = f"{name}:discovery"
        self.add_node(LineageNode(
            id=disc_id,
            label="Dataset Discovery",
            node_type="discovery",
            dataset=name,
        ))
        self.add_edge(src_id, disc_id)

        # 3. Schema validation
        schema_id = f"{name}:schema_validation"
        schema_status = "PASS" if getattr(dataset, "schema_valid", False) else "FAIL"
        self.add_node(LineageNode(
            id=schema_id,
            label="Schema Validation",
            node_type="validation",
            dataset=name,
            status=schema_status,
        ))
        self.add_edge(disc_id, schema_id)

        # 4. Quality check
        quality_id = f"{name}:quality_check"
        self.add_node(LineageNode(
            id=quality_id,
            label="Quality Engine",
            node_type="quality",
            dataset=name,
            status=quality_status,
            score=quality_score,
        ))
        self.add_edge(schema_id, quality_id)

        # 5. Ingestion
        ingest_id = f"{name}:ingest"
        self.add_node(LineageNode(
            id=ingest_id,
            label=f"Ingest ({strategy})",
            node_type="load",
            dataset=name,
            rows=rows,
        ))
        self.add_edge(quality_id, ingest_id)

        # 6. Staging table
        staging_id = f"{name}:staging"
        self.add_node(LineageNode(
            id=staging_id,
            label=table,
            node_type="staging",
            dataset=name,
            target_table=table,
            rows=rows,
        ))
        self.add_edge(ingest_id, staging_id)

    def get_dataset_chain(self, dataset_name: str) -> List[LineageNode]:
        """Return ordered list of nodes for a single dataset."""
        return [n for n in self.nodes if n.dataset == dataset_name]

    def to_dict(self) -> Dict[str, Any]:
        """Return JSON-serialisable representation for web UI or API."""
        return {
            "nodes": [
                {
                    "id": n.id,
                    "label": n.label,
                    "type": n.node_type,
                    "dataset": n.dataset,
                    "source_file": n.source_file,
                    "target_table": n.target_table,
                    "status": n.status,
                    "rows": n.rows,
                    "score": n.score,
                }
                for n in self.nodes
            ],
            "edges": [
                {"from": e.from_id, "to": e.to_id, "label": e.label}
                for e in self.edges
            ],
        }

    def print_ascii(self) -> None:
        """Print a per-dataset ASCII lineage tree to stdout."""
        datasets: Dict[str, List[LineageNode]] = {}
        for node in self.nodes:
            datasets.setdefault(node.dataset, []).append(node)

        print()
        print("=" * 60)
        print("DATA LINEAGE")
        print("=" * 60)

        for ds_name, nodes in datasets.items():
            print(f"\n  {ds_name}")
            for i, node in enumerate(nodes):
                connector = "└─" if i == len(nodes) - 1 else "├─"
                status_str = f"  [{node.status}]" if node.status else ""
                score_str = f"  {node.score:.1f}%" if node.score is not None else ""
                rows_str = f"  {node.rows:,} rows" if node.rows else ""
                print(f"  {connector} {node.label}{status_str}{score_str}{rows_str}")
                if i < len(nodes) - 1:
                    print("  │")

        print()

    def to_mermaid(self) -> str:
        """
        Export lineage graph as a Mermaid diagram.
        Paste output into a Mermaid-compatible renderer.
        """
        lines = ["flowchart TD"]

        for node in self.nodes:
            safe_id = node.id.replace(":", "_").replace("-", "_")
            label = node.label.replace('"', "'")
            shape_open = "[["
            shape_close = "]]"
            if node.node_type == "source":
                shape_open, shape_close = "[(", ")]"
            elif node.node_type in ("staging", "warehouse"):
                shape_open, shape_close = "[(", ")]"
            elif node.node_type == "quality":
                shape_open, shape_close = "{", "}"

            lines.append(f'    {safe_id}{shape_open}"{label}"{shape_close}')

        for edge in self.edges:
            from_id = edge.from_id.replace(":", "_").replace("-", "_")
            to_id = edge.to_id.replace(":", "_").replace("-", "_")
            arrow = f" -->|{edge.label}|" if edge.label else " -->"
            lines.append(f"    {from_id}{arrow}{to_id}")

        return "\n".join(lines)
