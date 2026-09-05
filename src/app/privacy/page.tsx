import type { Metadata } from "next";
import Link from "next/link";
import { SOURCE_URL } from "@/lib/schemes";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "What this tool collects when you use the Scheme Assistant, why, and how it is stored.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="bg-white border-b border-govgray-300">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <h1 className="text-3xl font-bold text-govblue-900">Privacy</h1>
          <p className="mt-2 text-govgray-700">
            A short, plain note on what happens to what you type here.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10 space-y-8 text-govgray-700">
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-govblue-900">What this tool collects</h2>
          <p>
            When you use the Scheme Assistant, we record the answers you give it, such as your
            stage, your status, and your sector, along with a first name if you choose to share one.
            We also record anonymous usage events, like which pages you open and which steps of the
            assistant you reach. All of this is tied to a random device identifier created in your
            browser, not to your real identity. We do not ask for and do not want sensitive personal
            details, and this tool never accepts or submits an application on your behalf.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-govblue-900">Why we collect it</h2>
          <p>
            The only purpose is to make the tool better, to see which schemes are useful and where
            people get stuck, so the matching and the questions can improve. We do not sell this
            information, and we do not use it to advertise to you.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-govblue-900">Where it is stored</h2>
          <p>
            Usage events are processed by Mixpanel, a product analytics service. Completed assistant
            sessions are stored in Supabase, a hosted database. Both are standard third party tools
            used only to run and improve this site.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-govblue-900">Before you apply</h2>
          <p>
            This is a discovery aid. Always confirm eligibility, deadlines, and funding details on
            the scheme&apos;s{" "}
            <a
              href={SOURCE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-govorange-600 hover:underline"
            >
              official page
            </a>{" "}
            before applying.
          </p>
        </section>

        <div className="pt-4">
          <Link href="/" className="text-govorange-600 hover:underline">
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
