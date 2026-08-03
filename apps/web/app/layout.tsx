import type { Metadata } from "next";
import "@fontsource/inter/latin.css";
import "@fontsource/space-grotesk/latin.css";
import "@fontsource/jetbrains-mono/latin.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "OpenIngest | Configuration-driven Data Ingestion Framework",
  description:
    "OpenIngest is an open-source Python data ingestion framework with 21 connectors. Automatic dataset discovery, schema validation, data quality, YAML transformations, incremental loading, Airflow orchestration, and metadata tracking.",
  keywords: [
    "OpenIngest", "data engineering", "ETL", "ELT", "Apache Airflow", "Python",
    "PostgreSQL", "data pipeline", "open source", "schema validation", "incremental loading",
    "Salesforce connector", "Stripe connector", "MySQL connector", "MongoDB connector",
  ],
  openGraph: {
    title: "OpenIngest | Configuration-driven Data Ingestion Framework",
    description: "Open-source Python ETL framework. 21 connectors. YAML transforms. Airflow-native. Zero boilerplate.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-full flex flex-col antialiased bg-[#04060d] text-[#F1F5F9]">
        {children}
      </body>
    </html>
  );
}
