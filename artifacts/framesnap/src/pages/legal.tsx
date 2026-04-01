import { Header } from "@/components/layout-header";
import { Footer } from "@/components/landing-sections";
import { SeoHead } from "@/components/seo-head";
import { ShieldCheck, Clock, UserX, Lock, HardDrive, Zap, ArrowUp } from "lucide-react";
import { useState, useEffect } from "react";

type LegalVariant = "privacy" | "terms" | "cookies";

const LEGAL_CONTENT: Record<LegalVariant, { eyebrow: string; title: string; subtitle?: string; intro: string; sections: Array<{ heading: string; body: string; icon?: string }> }> = {
  privacy: {
    eyebrow: "Privacy by Design",
    title: "TimexFrame Privacy & Data Handling",
    subtitle: "We believe your media belongs to you.",
    intro:
      "TimexFrame is built to be a transient utility, meaning we process what you need and forget the rest. No tracking. No accounts. No long-term storage.",
    sections: [
      {
        heading: "No Accounts, No Tracking",
        body: "We do not require registration, email addresses, or any personal identification to use TimexFrame. We do not use tracking cookies to build profiles or serve targeted advertisements. Your visit is anonymous.",
        icon: "UserX",
      },
      {
        heading: "Ephemeral Media Processing",
        body: "When you upload a video, it is stored in a secured, temporary directory on our server. Processing is strictly limited to frame extraction and preview generation. All uploaded videos and extracted frames are automatically and permanently deleted from our disks exactly 60 minutes after upload. No human at TimexFrame ever views your uploaded content.",
        icon: "Clock",
      },
      {
        heading: "Data Security",
        body: "While your media is on our servers, it is protected by industry-standard encryption. However, because TimexFrame is a public utility, we advise against uploading highly sensitive, confidential, or illegal material.",
        icon: "Lock",
      },
      {
        heading: "Local Storage",
        body: "We use a unique session ID (UUID) stored in your browser's local storage to ensure that only you can see the frames you've extracted during your current session. This ID is not linked to your identity.",
        icon: "HardDrive",
      },
      {
        heading: "Third-Party Services",
        body: "TimexFrame does not sell or share your media with third parties. We use standard server infrastructure to host our backend, and all processing (FFmpeg/Sharp) happens within our own controlled environment. We may use third-party service providers, such as Google AdSense, to serve advertisements. These providers may use cookies to serve ads based on your visit to this and other websites. You may opt out of personalized advertising by visiting Google's Ads Settings.",
        icon: "ShieldCheck",
      },
    ],
  },
  terms: {
    eyebrow: "Terms of Use",
    title: "Terms of Use for TimexFrame",
    intro:
      "This document governs your relationship with TimexFrame. By accessing or using our video frame extraction services, you agree to be bound by these Terms of Use.",
    sections: [
      {
        heading: "Introduction and Agreement to Terms",
        body: "This document governs your relationship with TimexFrame. By accessing or using our video frame extraction services, you agree to be bound by these Terms of Use. If you disagree with any part of these terms, you must immediately discontinue use of the website. TimexFrame provides a browser-based interface for processing video files via our proprietary backend logic. These terms apply to all visitors, users, and others who wish to access or use the Service. Your agreement with us includes these Terms and our Privacy Policy. We reserve the right to update these terms at any time. Changes will be effective immediately upon posting to this page, noted by the 'Last Updated' date. It is your responsibility to review these terms periodically. Continued use after changes constitutes acceptance.",
      },
      {
        heading: "Nature of the Service",
        body: "TimexFrame is an ephemeral utility tool. It is designed to allow users to upload video files (MP4, MOV, WEBM) for the purpose of extracting individual still images (frames). No Persistence: We do not provide video hosting, cloud storage, or long-term asset management. The 'As-Is' Clause: The service is provided 'as-is' and 'as available.' We do not guarantee that the frame extraction will be frame-accurate for every single proprietary codec or that the service will be available 100% of the time. Technical Constraints: Users acknowledge that processing happens on our servers using FFmpeg and Sharp. These processes are resource-intensive. We reserve the right to limit file sizes (currently 100MB), resolution, or the number of extractions per session to ensure server stability for all users.",
      },
      {
        heading: "Intellectual Property Rights",
        body: "Your Content: You retain all ownership rights to the videos you upload. TimexFrame does not claim any license or copyright over your original media or the frames extracted from it. However, by uploading, you grant us a temporary, technical license to process the file on our hardware solely to fulfill your request. Our Content: The TimexFrame name, logo, UI design, custom code (React/TypeScript), and branding are the exclusive property of TimexFrame. You may not clone, 'scrape,' or reverse-engineer our backend API or frontend logic without express written consent. Copyright Compliance: You represent and warrant that you own or have the necessary licenses to process the content you upload. TimexFrame is not responsible for copyright infringement committed by users.",
      },
      {
        heading: "Acceptable Use Policy (AUP)",
        body: "To maintain a safe and efficient environment, you agree not to: System Abuse: Attempt to bypass the 100MB limit, or use automated scripts (bots) to spam our Fastify API. Illegal Material: Upload content that is unlawful, harmful, threatening, abusive, or contains child-safety violations. Reverse Engineering: Attempt to extract the source code of our Sharp-based image analysis or FFmpeg configurations. Malware: Upload files containing viruses, corrupted data, or malicious code designed to exploit our Node.js environment. Commercial Resale: You may not 're-package' TimexFrame as a paid service of your own by proxying our API.",
      },
      {
        heading: "Limitation of Liability",
        body: "To the maximum extent permitted by law, TimexFrame and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages. This includes, but is not limited to: Loss of data (since we delete files after 60 minutes, we are not responsible for files you forgot to download). Server downtime or extraction errors. Any bugs, viruses, or trojan horses that may be transmitted through our service by third parties (though we maintain strict security protocols). The quality of the output frames. Sharpness and brightness scoring are algorithmic and may not always meet professional artistic standards.",
      },
      {
        heading: "User-Generated Content Disclaimer",
        body: "You are solely responsible for the media you process. Because TimexFrame does not require a login, we do not pre-screen content. We act as a 'passive conduit' for your processing needs. If we find that our infrastructure is being used to process illegal or harmful material, we reserve the right to terminate the session, block the IP address, and cooperate with legal authorities if necessary. You agree to indemnify and hold TimexFrame harmless from any claims resulting from your use of the service.",
      },
      {
        heading: "Data Retention and Automatic Deletion",
        body: "As stated in our Privacy Policy, TimexFrame operates on an ephemeral basis. The 60-Minute Rule: All temporary files (uploads and extracted JPG/PNG/WebP files) are scheduled for a 'Hard Delete' from our server storage exactly one hour after the upload timestamp. No Recovery: Once data is deleted, it is unrecoverable. We do not keep backups of user-processed media. Users are encouraged to download their ZIP files immediately upon extraction. We are not a storage provider.",
      },
      {
        heading: "Termination of Access",
        body: "We reserve the right to terminate or suspend your access to TimexFrame immediately, without prior notice or liability, for any reason, including without limitation if you breach the Terms. All provisions of the Terms which by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, indemnity, and limitations of liability.",
      },
      {
        heading: "Governing Law",
        body: "These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which the operator of TimexFrame resides, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.",
      },
    ],
  },
  cookies: {
    eyebrow: "Cookie Policy",
    title: "What browser storage TimexFrame uses.",
    intro:
      "TimexFrame keeps browser-side state only as needed.",
    sections: [
      {
        heading: "Essential storage",
        body: "The app may use temporary browser storage.",
      },
    ],
  },
};

export default function LegalPage({ variant }: { variant: LegalVariant }) {
  const content = LEGAL_CONTENT[variant];
  const canonicalPath = variant === "privacy" ? "/privacy" : variant === "terms" ? "/terms" : "/cookies";
  const isPrivacy = variant === "privacy";

  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case "UserX":
        return <UserX className="w-6 h-6" />;
      case "Clock":
        return <Clock className="w-6 h-6" />;
      case "Lock":
        return <Lock className="w-6 h-6" />;
      case "HardDrive":
        return <HardDrive className="w-6 h-6" />;
      case "ShieldCheck":
        return <ShieldCheck className="w-6 h-6" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/10">
      <SeoHead
        title={content.eyebrow}
        description={content.intro}
        canonicalPath={canonicalPath}
        keywords={["TimexFrame legal", content.eyebrow, "video frame extractor policy"]}
      />
      <Header />

      <main className="bg-white">
        {isPrivacy && (
          <div className="bg-gradient-to-b from-zinc-50 to-white border-b border-zinc-200">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200 mb-6">
                <Zap className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">Server Status: All temporary data older than 60m has been purged</span>
              </div>
            </div>
          </div>
        )}

        <section className={isPrivacy ? "bg-gradient-to-b from-zinc-50 to-white border-b border-zinc-100" : "border-b border-zinc-100"}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
            <p className="text-sm font-semibold uppercase tracking-widest text-zinc-400 mb-3">{content.eyebrow}</p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 mb-3">
              {content.title}
            </h1>
            {content.subtitle && <p className="text-xl text-zinc-600 mb-5">{content.subtitle}</p>}
            <p className="text-lg text-zinc-600 leading-relaxed max-w-2xl">{content.intro}</p>
            <p className="mt-4 text-sm text-zinc-400">Last updated: April 1, 2026</p>
          </div>
        </section>

        <section className={isPrivacy ? "py-20" : "py-16 bg-zinc-50"}>
          <div className={isPrivacy ? "max-w-5xl mx-auto px-4 sm:px-6 lg:px-8" : "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"}>
            {isPrivacy ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {content.sections.map((section, i) => (
                  <div
                    key={section.heading}
                    className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-zinc-300 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-blue-50 p-3 text-blue-600 flex-shrink-0">
                        {getIcon(section.icon)}
                      </div>
                      <div className="flex-1">
                        <h2 className="text-lg font-semibold text-zinc-900 mb-2">{section.heading}</h2>
                        <p className="text-sm text-zinc-600 leading-relaxed">{section.body}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {content.sections.map((section) => (
                  <article key={section.heading} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-zinc-900 mb-2">{section.heading}</h2>
                    <p className="text-sm text-zinc-500 leading-relaxed">{section.body}</p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          aria-label="Back to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
