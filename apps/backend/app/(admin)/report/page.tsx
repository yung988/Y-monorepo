import { promises as fs } from "fs";
import path from "path";
import { AdminHeader } from "@/components/admin-header";

export const dynamic = "force-static";

export default async function AdminReportPage() {
  const reportPath = path.join(process.cwd(), "docs", "admin-report.md");
  let content = "Soubor dokumentace nenalezen.";

  try {
    content = await fs.readFile(reportPath, "utf-8");
  } catch (e) {
    console.error("Cannot read admin report:", e);
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <AdminHeader
        title="Admin Report"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Report" }]}
      />
      <article className="prose prose-invert max-w-none">
        <pre className="whitespace-pre-wrap break-words text-sm p-4 bg-muted rounded border">
          {content}
        </pre>
      </article>
    </div>
  );
}
