import { Link } from "wouter";
import { ShieldCheck, Zap, SlidersHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { Header } from "@/components/layout-header";
import { Footer } from "@/components/landing-sections";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SeoHead } from "@/components/seo-head";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const CORE_VALUES = [
  {
    icon: ShieldCheck,
    title: "Privacy by Design",
    description:
      "Video processing happens entirely inside your browser using the Web Canvas API and Blob-based object URLs. Your source files never touch our servers — they never leave your device.",
  },
  {
    icon: Zap,
    title: "Reliable Processing",
    description:
      "TimexFrame leverages hardware-accelerated canvas rendering to decode and snapshot frames directly on your GPU. Performance depends on your device, browser, and video format.",
  },
  {
    icon: SlidersHorizontal,
    title: "Precision Control",
    description:
      "Choose exactly how you extract: Interval mode for regular snapshots, Timestamp mode for frame-perfect moments, or Smart mode that automatically selects the sharpest and best-lit frames.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/10">
      <SeoHead
        title="About TimexFrame"
        description="Learn what TimexFrame does and how it helps creators and teams extract high-quality frames from video in the browser."
        canonicalPath="/about"
        keywords={[
          "about TimexFrame",
          "video frame extractor",
          "client-side frame extraction",
          "privacy-first video tool",
        ]}
      />
      <Header />

      <main className="bg-white">
        {/* ── Section 1: Mission ──────────────────────────────────────────── */}
        <section className="border-b border-zinc-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.55, ease: "easeOut" }}
            >
              <p className="text-sm font-semibold uppercase tracking-widest text-zinc-400 mb-4">
                About Us
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-900 mb-6 leading-tight">
                Our mission is to make video data{" "}
                <span className="text-zinc-500">accessible and dependable.</span>
              </h1>
              <p className="text-lg text-zinc-500 max-w-3xl leading-relaxed mb-4">
                TimexFrame was built to eliminate the bottleneck between video content and
                actionable still frames. Traditional tools demand large uploads, cloud queues,
                and less control over media — we decided that was unacceptable.
              </p>
              <p className="text-lg text-zinc-500 max-w-3xl leading-relaxed mb-4">
                By moving extraction entirely to the client, we unlocked local client-side
                extraction: frames are decoded, rendered, and available to download inside your
                browser without a single byte leaving your machine.
              </p>
              <p className="text-lg text-zinc-500 max-w-3xl leading-relaxed">
                The result is a tool that is private, precise, and built for creators,
                researchers, and teams who value control and quality.
              </p>

              <div className="mt-10 flex flex-wrap gap-3">
                <Link href="/">
                  <Button className="bg-zinc-900 hover:bg-zinc-700 text-white rounded-lg font-semibold px-6">
                    Try TimexFrame
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" className="rounded-lg font-semibold px-6">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Section 2: Core Values ──────────────────────────────────────── */}
        <section className="py-20 bg-zinc-50 border-b border-zinc-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="mb-12"
            >
              <p className="text-sm font-semibold uppercase tracking-widest text-zinc-400 mb-3">
                What We Stand For
              </p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900">
                Core Values
              </h2>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-3">
              {CORE_VALUES.map(({ icon: Icon, title, description }, i) => (
                <motion.div
                  key={title}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.1 }}
                >
                  <Card className="h-full rounded-2xl border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white">
                        <Icon className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-lg font-semibold text-zinc-900">
                        {title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-zinc-500 leading-relaxed">{description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>


      </main>

      <Footer />
    </div>
  );
}
