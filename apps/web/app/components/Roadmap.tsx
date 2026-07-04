import { CheckCircle2, Circle } from "lucide-react";

const MILESTONES = [
  { id: "M1", label: "Milestone 1", done: ["Dataset discovery", "Config loader", "Schema validation", "PostgreSQL loader"] },
  { id: "M2", label: "Milestone 2", done: ["Metadata logging", "Pipeline history", "Reporting engine"] },
  { id: "M3", label: "Milestone 3", done: ["Docker support", "Apache Airflow 2.9", "Dynamic DAG generation", "Airflow task factory"] },
  { id: "M4", label: "Milestone 4", done: ["Auto schema inference", "Datatype inference", "Zero-SQL onboarding"] },
  { id: "M5", label: "Milestone 5", done: ["Data quality engine", "Incremental loading", "Full CLI", "GitHub Actions CI/CD"] },
];

const UPCOMING = [
  "S3 / Azure Blob / GCS connectors",
  "Excel, JSON, Parquet support",
  "REST API source connectors",
  "Cron mode (run without Airflow)",
  "Data lineage visualization",
  "Slack / Email notifications",
  "Plugin architecture for custom connectors",
  "Streamlit web dashboard",
  "AI-assisted pipeline generation",
  "PyPI public release",
];

export default function Roadmap() {
  return (
    <section className="relative py-28 overflow-hidden">
      <div className="absolute inset-0 bg-[#04060d]" />
      <div className="absolute inset-0 grid-fine opacity-25" />

      <div className="relative max-w-[1380px] mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 tag text-indigo-400 border-indigo-500/25 bg-indigo-500/8 mb-5">
            5 milestones · all shipped
          </div>
          <h2 className="f-head text-[42px] md:text-[52px] font-bold text-white leading-[1.1] tracking-[-0.025em] mb-4">
            Roadmap.
          </h2>
          <p className="text-[#94A3B8] text-[16px]">
            v1.0.0 is complete. More connectors and targets coming.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Completed */}
          <div className="panel rounded-2xl p-7 border-emerald-500/12 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/25 to-transparent" />
            <div className="flex items-center gap-3 mb-7">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 size={15} className="text-emerald-400" />
              </div>
              <div>
                <h3 className="f-head font-semibold text-white">Completed — v1.0.0</h3>
                <p className="text-[11px] text-[#334155]">All 5 milestones shipped</p>
              </div>
            </div>
            <div className="space-y-5">
              {MILESTONES.map(m => (
                <div key={m.id}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="tag text-emerald-400 border-emerald-500/20 bg-emerald-500/8 text-[10px]">{m.id}</span>
                    <span className="text-[13px] font-semibold text-[#CBD5E1] f-head">{m.label}</span>
                  </div>
                  <div className="ml-8 flex flex-wrap gap-x-4 gap-y-1.5">
                    {m.done.map(d => (
                      <div key={d} className="flex items-center gap-1.5 text-[12px] text-[#475569]">
                        <CheckCircle2 size={10} className="text-emerald-500/50" />
                        {d}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming */}
          <div className="panel rounded-2xl p-7 border-indigo-500/12 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/25 to-transparent" />
            <div className="flex items-center gap-3 mb-7">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Circle size={15} className="text-indigo-400" />
              </div>
              <div>
                <h3 className="f-head font-semibold text-white">Upcoming</h3>
                <p className="text-[11px] text-[#334155]">Contributions welcome</p>
              </div>
            </div>
            <div className="space-y-3">
              {UPCOMING.map(item => (
                <div key={item} className="flex items-center gap-3 text-[13px] text-[#475569]">
                  <Circle size={11} className="text-[#1E293B] shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
