import { Mail, MessageSquare, ShieldAlert } from "lucide-react";
import { Header } from "@/components/layout-header";
import { Footer } from "@/components/landing-sections";
import { SeoHead } from "@/components/seo-head";

const CONTACT_OPTIONS = [
  {
    icon: Mail,
    title: "General inquiries",
    detail: "Questions about TimexFrame features, usage, or feedback.",
    action: "mailto:support@timexframe.app",
    label: "support@timexframe.app",
  },
  {
    icon: MessageSquare,
    title: "Product support",
    detail: "Need help with uploads, extraction settings, or downloads.",
    action: "mailto:help@timexframe.app",
    label: "help@timexframe.app",
  },
  {
    icon: ShieldAlert,
    title: "Privacy and legal",
    detail: "Questions related to privacy, data handling, or policy requests.",
    action: "mailto:privacy@timexframe.app",
    label: "privacy@timexframe.app",
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/10">
      <SeoHead
        title="Contact TimexFrame"
        description="Contact TimexFrame for product feedback, support questions, or privacy and legal requests related to video frame extraction."
        canonicalPath="/contact"
        keywords={["contact TimexFrame", "video tool support", "privacy contact"]}
      />
      <Header />

      <main className="bg-white">
        <section className="border-b border-zinc-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
            <p className="text-sm font-semibold uppercase tracking-widest text-zinc-400 mb-3">Contact</p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 mb-5">
              Get in touch with the TimexFrame team.
            </h1>
            <p className="text-lg text-zinc-500 max-w-3xl leading-relaxed">
              If you need support, have product feedback, or want to ask a privacy-related question,
              use one of the contact options below and we will point you in the right direction.
            </p>
          </div>
        </section>

        <section className="py-16 bg-zinc-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-6 md:grid-cols-3">
            {CONTACT_OPTIONS.map(({ icon: Icon, title, detail, action, label }) => (
              <a
                key={title}
                href={action}
                className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-semibold text-zinc-900 mb-2">{title}</h2>
                <p className="text-sm text-zinc-500 leading-relaxed mb-4">{detail}</p>
                <span className="text-sm font-medium text-zinc-900">{label}</span>
              </a>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
