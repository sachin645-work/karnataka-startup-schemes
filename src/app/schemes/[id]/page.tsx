import Link from "next/link";
import { notFound } from "next/navigation";
import { SCHEMES, getSchemeById, CATEGORY_LABELS } from "@/lib/schemes";

export function generateStaticParams() {
  return SCHEMES.map((s) => ({ id: s.id }));
}

export default async function SchemeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const scheme = getSchemeById(id);
  if (!scheme) notFound();

  return (
    <main className="min-h-screen bg-white">
      <div className="bg-white border-b border-govgray-300">
        <div className="mx-auto max-w-4xl px-4 py-10">
          <Link href="/schemes" className="text-sm text-govblue-700 hover:underline">
            ← Back to all schemes
          </Link>
          <span className="mt-4 inline-block rounded-full bg-govorange-500 text-white px-3 py-1 text-xs font-semibold">
            {CATEGORY_LABELS[scheme.category]}
          </span>
          <h1 className="mt-3 text-2xl md:text-3xl font-bold text-govblue-900">{scheme.name}</h1>
          <p className="mt-2 text-govgray-700">{scheme.tagline}</p>
          <div className="mt-6 flex gap-3 flex-wrap">
            <a
              href={scheme.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded bg-govorange-500 hover:bg-govorange-600 text-white px-5 py-2.5 font-semibold transition-colors"
            >
              {scheme.isExternal ? "Visit Official Site" : "Visit Official Portal"} →
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-10 space-y-10">
        <Section title="Overview">
          <p className="text-govgray-700 leading-relaxed">{scheme.overview}</p>
        </Section>

        {scheme.objectives && (
          <Section title="Objectives">
            <BulletList items={scheme.objectives} />
          </Section>
        )}

        {scheme.eligibility && (
          <Section title={scheme.eligibilityLabel ?? "Eligibility Criteria"}>
            <ul className="space-y-2">
              {scheme.eligibility.map((item, i) => (
                <li key={i} className="flex gap-2 rounded bg-govgray-50 border border-govgray-300 px-3 py-2 text-sm text-govgray-700">
                  <span className="text-govblue-700 font-bold" aria-hidden="true">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {scheme.programStructure && (
          <Section title="Program Structure & Budget">
            <BulletList items={scheme.programStructure} />
          </Section>
        )}

        {(scheme.evaluationSteps || scheme.evaluationCriteria) && (
          <Section title="Evaluation / Selection Process">
            {scheme.evaluationSteps && (
              <ol className="list-decimal list-inside space-y-1 text-govgray-700 mb-4">
                {scheme.evaluationSteps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            )}
            {scheme.evaluationCriteria && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-govgray-300">
                  <thead>
                    <tr className="bg-govgray-50 text-left">
                      <th className="px-3 py-2 border-b border-govgray-300 text-govblue-900">Criterion</th>
                      <th className="px-3 py-2 border-b border-govgray-300 text-govblue-900 text-right">Weight</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scheme.evaluationCriteria.map((c, i) => (
                      <tr key={i} className="border-b border-govgray-300">
                        <td className="px-3 py-2 text-govgray-700">{c.criterion}</td>
                        <td className="px-3 py-2 text-govgray-700 text-right">{c.weight}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>
        )}

        {scheme.benefits && (
          <Section title="Benefits">
            <BulletList items={scheme.benefits} />
          </Section>
        )}

        {(scheme.applicationProcess || scheme.deadlineNote) && (
          <Section title="Application Process & Important Dates">
            {scheme.applicationProcess && <p className="text-govgray-700">{scheme.applicationProcess}</p>}
            {scheme.deadlineNote && (
              <p className="mt-2 flex items-start gap-1 text-sm text-govorange-600">
                <span aria-hidden="true">ⓘ</span>
                <span>{scheme.deadlineNote}</span>
              </p>
            )}
          </Section>
        )}

        {scheme.documentsRequired && (
          <Section title="Documents Required">
            <BulletList items={scheme.documentsRequired} />
          </Section>
        )}

        {scheme.downloads && (
          <Section title="Downloads / Resources">
            <div className="flex flex-wrap gap-3">
              {scheme.downloads.map((d, i) => (
                <span
                  key={i}
                  className="rounded border border-govgray-300 px-4 py-2 text-sm text-govgray-700 bg-govgray-50"
                  title="Placeholder — not a real file"
                >
                  📄 {d} (sample)
                </span>
              ))}
            </div>
          </Section>
        )}

        {scheme.contact && (
          <Section title="Contact">
            <p className="text-sm text-govgray-700">{scheme.contact}</p>
          </Section>
        )}

        {scheme.unverifiedNote && (
          <p className="flex items-start gap-1 text-xs text-govorange-600 border-t border-govgray-300 pt-4">
            <span aria-hidden="true">⚠</span>
            <span>{scheme.unverifiedNote}</span>
          </p>
        )}

        <p className="text-xs text-govgray-700/60 border-t border-govgray-300 pt-4">
          This is an independent, unofficial summary. Always verify current eligibility, deadlines,
          and figures on the{" "}
          <a href={scheme.officialUrl} target="_blank" rel="noopener noreferrer" className="text-govblue-700 hover:underline">
            official page
          </a>{" "}
          before relying on it. This tool never accepts or processes applications.
        </p>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-bold text-govblue-900 mb-3 border-l-4 border-govorange-500 pl-3">{title}</h2>
      {children}
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc list-inside space-y-1.5 text-govgray-700">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}
