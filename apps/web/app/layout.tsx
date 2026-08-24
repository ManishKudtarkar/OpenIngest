import type { Metadata } from "next";
import "@fontsource/inter/latin.css";
import "@fontsource/space-grotesk/latin.css";
import "@fontsource/jetbrains-mono/latin.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "OpenIngest — Data Ingestion. Zero Boilerplate.",
  description:
    "OpenIngest is an open-source Python data ingestion framework with 17 connectors. YAML config, automatic schema validation, data quality engine, incremental loading, YAML transforms, Airflow DAG generation, and metadata tracking.",
  keywords: [
    "OpenIngest", "data engineering", "ETL", "ELT", "Apache Airflow", "Python",
    "PostgreSQL", "data pipeline", "open source", "schema validation", "incremental loading",
    "Salesforce connector", "Stripe connector", "MySQL connector", "MongoDB connector",
    "YAML transforms", "data quality",
  ],
  openGraph: {
    title: "OpenIngest — Data Ingestion. Zero Boilerplate.",
    description: "Open-source Python ETL framework. 17 connectors. YAML transforms. Airflow-native. Zero boilerplate.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-full flex flex-col antialiased bg-[#030507] text-[#F8FAFC]">
        {children}
      </body>
    </html>
  );
}
