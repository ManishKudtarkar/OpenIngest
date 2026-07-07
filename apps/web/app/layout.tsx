import type { Metadata } from "next";
import "@fontsource/inter/latin.css";
import "@fontsource/space-grotesk/latin.css";
import "@fontsource/jetbrains-mono/latin.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "OpenIngest | Configuration-driven Data Ingestion Framework",
  description:
    "OpenIngest is an open-source Python data ingestion framework. Automatic dataset discovery, schema validation, data quality, incremental loading, Airflow orchestration, and metadata tracking, all driven by YAML configuration.",
  keywords: [
    "OpenIngest", "data engineering", "ETL", "ELT", "Apache Airflow", "Python",
    "PostgreSQL", "data pipeline", "open source", "schema validation", "incremental loading",
  ],
  openGraph: {
    title: "OpenIngest | Configuration-driven Data Ingestion Framework",
    description: "Open-source Python ETL framework. YAML-driven. Airflow-native. Zero boilerplate.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-full flex flex-col antialiased bg-[#0F172A] text-[#F8FAFC]">
        {children}
      </body>
    </html>
  );
}
