import { Link } from "wouter";
import { Clock3, ShieldCheck, WandSparkles } from "lucide-react";
import { Header } from "@/components/layout-header";
import { Footer } from "@/components/landing-sections";
import { Button } from "@/components/ui/button";
import { SeoHead } from "@/components/seo-head";

const HIGHLIGHTS = [
  {
    icon: WandSparkles,
    title: "Built for instant frame extraction",
    description:
      "TimexFrame helps creators, teams, and students turn short or long videos into clean still frames in seconds.",
  },
  {
    icon: Clock3,
    title: "Fast and simple workflow",
    description:
      "Choose a video, pick how many frames you need, and review results without installing any extra software.",
  },
  {
    icon: ShieldCheck,
    title: "Privacy-first processing",
    description:
      "Video processing happens locally in your browser, so your source file stays on your device.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/10">
      <SeoHead
        title="About TimexFrame"
        description="Learn what TimexFrame does and how it helps creators and teams extract high-quality frames from video with a simple workflow."
        canonicalPath="/about"
        keywords={["about TimexFrame", "video frame extractor company", "frame extraction tool"]}
      />
      <Header />

      <main className="bg-white">
        <section className="border-b border-zinc-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
            <p className="text-sm font-semibold uppercase tracking-widest text-zinc-400 mb-3">About Us</p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 mb-5">
              A simpler way to turn video into perfect still frames.
            </h1>
            <p className="text-lg text-zinc-500 max-w-3xl leading-relaxed">
              TimexFrame was designed for fast, high-quality frame extraction with a clean workflow.
              Whether you are choosing a thumbnail, building a storyboard, or saving references,
              the goal is to help you get the exact frame you need without friction.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/">
                <Button className="bg-zinc-900 hover:bg-zinc-700 text-white rounded-lg font-semibold">
                  Try TimexFrame
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" className="rounded-lg font-semibold">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 bg-zinc-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-6 md:grid-cols-3">
            {HIGHLIGHTS.map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-semibold text-zinc-900 mb-2">{title}</h2>
                <p className="text-sm text-zinc-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
