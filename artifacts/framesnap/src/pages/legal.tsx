import { Header } from "@/components/layout-header";
import { Footer } from "@/components/landing-sections";
import { SeoHead } from "@/components/seo-head";
import { ArrowUp } from "lucide-react";
import { useState, useEffect } from "react";

type LegalVariant = "privacy" | "terms" | "cookies" | "disclaimer" | "dmca";
type LegalSection = { heading: string; body: string; icon?: string; linkHref?: string; linkLabel?: string };

const LEGAL_CONTENT: Record<LegalVariant, { eyebrow: string; title: string; subtitle?: string; intro: string; sections: LegalSection[] }> = {
  privacy: {
    eyebrow: "Privacy Policy",
    title: "TimexFrame Privacy Policy",
    intro:
      "Welcome to TimexFrame. Your privacy is important to us. This Privacy Policy explains how we handle your information when you use our website and services.",
    sections: [
      {
        heading: "1. Information We Collect",
        body: "TimexFrame is designed with a privacy-first approach. We do not collect personal information such as your name, email address, or uploaded files.\n\nAll videos and media files are processed locally in your browser. We do not upload, store, or access your media files on our servers.\n\nWe may collect limited non-personal usage data such as browser type, device information, pages visited, and time spent on the website to improve performance and user experience.",
      },
      {
        heading: "2. Cookies and Tracking Technologies",
        body: "We use cookies to support basic site functionality and optional analytics features (if enabled).\n\nWe may display ads using Google AdSense in the future. Ad services can use cookies to show relevant ads and measure ad performance. Google may use the DoubleClick cookie based on visits to this and other websites.\n\nLearn more: https://policies.google.com/technologies/ads",
      },
      {
        heading: "3. How We Use Your Information",
        body: "We use limited collected data to improve website performance, analyze user behavior, provide better user experience, and support relevant advertising where applicable.",
      },
      {
        heading: "4. Data Security",
        body: "We prioritize privacy and security with local browser-based processing, no file uploads to servers, and no account system.\n\nNo system is 100% secure, so users should also take necessary precautions on their own devices.",
      },
      {
        heading: "5. Third-Party Services",
        body: "TimexFrame does not currently display advertisements.\n\nIn the future, we may use advertising services such as Google AdSense. If enabled, third-party vendors may use cookies to serve ads based on your visits to this and other websites.\n\nThis Privacy Policy will be updated accordingly if ads are introduced.",
      },
      {
        heading: "6. Your Rights",
        body: "Depending on your location, you may have rights to access data, request deletion, or restrict processing.\n\nSince we do not store personal data from uploaded media, most user data remains under your control.",
      },
      {
        heading: "7. Children's Privacy",
        body: "TimexFrame is not intended for children under 13. We do not knowingly collect personal data from children.",
      },
      {
        heading: "8. Changes to This Policy",
        body: "We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated date.",
      },
      {
        heading: "9. Contact Us",
        body: "If you have any questions about this Privacy Policy, please contact us through our contact page.",
        linkHref: "/contact",
        linkLabel: "Go to Contact Page",
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
        body: "This document governs your relationship with TimexFrame. By accessing or using our video frame extraction services, you agree to be bound by these Terms of Use. If you disagree with any part of these terms, you must immediately discontinue use of the website. TimexFrame provides a browser-based interface for processing video files primarily in your local browser session. These terms apply to all visitors, users, and others who wish to access or use the Service. Your agreement with us includes these Terms and our Privacy Policy. We reserve the right to update these terms at any time. Changes will be effective immediately upon posting to this page, noted by the 'Last Updated' date. It is your responsibility to review these terms periodically. Continued use after changes constitutes acceptance.",
      },
      {
        heading: "Nature of the Service",
        body: "TimexFrame is an ephemeral utility tool. It is designed to allow users to select video files (MP4, MOV, WEBM) for extracting individual still images (frames). No Persistence: We do not provide video hosting, cloud storage, or long-term asset management. The 'As-Is' Clause: The service is provided 'as-is' and 'as available.' We do not guarantee that frame extraction will be perfectly frame-accurate for every proprietary codec or that the service will be available 100% of the time. Technical Constraints: Users acknowledge that processing is device-dependent and browser-dependent, and performance may vary across hardware.",
      },
      {
        heading: "Intellectual Property Rights",
        body: "Your Content: You retain all ownership rights to the videos you process. TimexFrame does not claim any license or copyright over your original media or the frames extracted from it. Our Content: The TimexFrame name, logo, UI design, custom code (React/TypeScript), and branding are the exclusive property of TimexFrame. You may not clone, 'scrape,' or reverse-engineer protected service logic without express written consent. Copyright Compliance: You represent and warrant that you own or have the necessary licenses to process the content you use. TimexFrame is not responsible for copyright infringement committed by users.",
      },
      {
        heading: "Acceptable Use Policy (AUP)",
        body: "To maintain a safe and efficient environment, you agree not to: System Abuse: Attempt to bypass usage limits, or use automated scripts (bots) to spam the service. Illegal Material: Process content that is unlawful, harmful, threatening, abusive, or contains child-safety violations. Reverse Engineering: Attempt to extract protected service code or proprietary analysis configurations. Malware: Use files containing viruses, corrupted data, or malicious code designed to exploit application environments. Commercial Resale: You may not 're-package' TimexFrame as a paid service of your own by proxying our service.",
      },
      {
        heading: "Limitation of Liability",
        body: "To the maximum extent permitted by law, TimexFrame and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages. This includes, but is not limited to: Loss of data in your local browser session if you close, clear, or reset it before saving results; service interruptions or extraction errors; any bugs, viruses, or trojan horses that may be transmitted through our service by third parties (though we maintain strict security protocols); and the quality of output frames. Smart scoring is algorithmic and may not always meet professional artistic standards.",
      },
      {
        heading: "User-Generated Content Disclaimer",
        body: "You are solely responsible for the media you process. Because TimexFrame does not require a login, we do not pre-screen content. We act as a 'passive conduit' for your processing needs. If we find that our infrastructure is being used to process illegal or harmful material, we reserve the right to terminate the session, block the IP address, and cooperate with legal authorities if necessary. You agree to indemnify and hold TimexFrame harmless from any claims resulting from your use of the service.",
      },
      {
        heading: "Data Retention and Automatic Deletion",
        body: "As stated in our Privacy Policy, TimexFrame operates on an ephemeral basis. Source videos are processed locally in your browser and are not stored by us as part of standard extraction. Generated results remain available in your active browser session until you clear session data, navigate away, or close the session context. We are not a storage provider.",
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
    eyebrow: "Cookie & Browser Storage Policy",
    title: "Cookie & Browser Storage Policy",
    intro:
      "Effective Date: April 2, 2026. This document explains how TimexFrame uses browser-side storage to deliver a functional and secure frame extraction service.",
    sections: [
      {
        heading: "1. Scope of Policy",
        body: "This policy describes how TimexFrame uses browser-side storage to provide its video frame extraction services. We do not use traditional HTTP cookies for tracking or advertising. Instead, we utilize browser Local Storage to maintain functional sessions.",
      },
      {
        heading: "2. Essential Technical Storage",
        body: "TimexFrame uses a single piece of browser-side data to operate:\n\nIdentifier: session_uuid\nTechnology: Web Storage API (Local Storage)\nNature: Strictly Necessary / Functional\nDescription: A randomly generated Universally Unique Identifier (UUID) assigned to your browser session when you start processing.",
      },
      {
        heading: "3. Purpose of Storage",
        body: "The session_uuid is used exclusively for the following technical purposes:\n\n- Session Continuity: To keep extraction and gallery state consistent during your active browser session.\n- Security: To maintain session isolation for temporary in-browser results.\n- Access Control: To reduce unauthorized access to session-scoped processing flows.",
      },
      {
        heading: "4. Anonymity and Data Linking",
        body: "No PII: The UUID is an anonymous string of characters. It is not linked to your name, email address, IP address, or any other Personally Identifiable Information (PII).\n\nNo Cross-Site Tracking: This identifier is restricted to the timexframe.com domain. It cannot be used to track your activity on other websites.",
      },
      {
        heading: "5. Data Retention and Deletion",
        body: "TimexFrame operates on an ephemeral infrastructure:\n\nClient-Side Media: Source media and extracted images are processed and retained within your browser session context.\n\nClient-Side Identifier: The session_uuid remains in your browser's Local Storage. You may manually clear this data at any time via your browser settings, though doing so may terminate your ability to access current extraction results.",
      },
      {
        heading: "6. Third-Party Cookies",
        body: "Zero Third-Party Tracking: TimexFrame does not deploy third-party cookies.\n\nNo Advertising: We do not use advertising networks, retargeting pixels, or social media tracking scripts.\n\nNo Analytics: We do not use third-party analytics platforms that require persistent user-tracking cookies.",
      },
      {
        heading: "7. Compliance and User Control",
        body: "By using TimexFrame, you acknowledge the use of the essential Local Storage described above. If you wish to opt out, you must disable Local Storage in your browser settings; however, the Service will be unable to process or return video frames without this functional identifier.",
      },
    ],
  },
  disclaimer: {
    eyebrow: "Disclaimer",
    title: "TimexFrame Disclaimer",
    intro:
      "The information provided on this website is for general informational and utility purposes only. By using this website, you agree to the terms outlined in this disclaimer.",
    sections: [
      {
        heading: "General Information",
        body: "TimexFrame is an online tool designed to help users extract frames from video files directly in their browser. While we aim to provide accurate and reliable functionality, we make no guarantees regarding the completeness, accuracy, or reliability of the results.",
      },
      {
        heading: "No Professional Advice",
        body: "The content and tools available on this website are not intended to replace professional advice of any kind. Users should use the tool at their own discretion.",
      },
      {
        heading: "Use at Your Own Risk",
        body: "All actions taken using this website are strictly at your own risk. TimexFrame will not be liable for any losses, damages, or issues resulting from the use of the tool or reliance on its output.",
      },
      {
        heading: "No File Upload / Local Processing",
        body: "TimexFrame processes files locally in your browser. We do not upload, store, or access your video files on any server. However, users are responsible for ensuring their own device security and data safety.",
      },
      {
        heading: "External Links",
        body: "This website may contain links to third-party websites. We do not control or guarantee the accuracy or safety of external content and are not responsible for any issues arising from their use.",
      },
      {
        heading: "Limitation of Liability",
        body: "Under no circumstances shall TimexFrame be held liable for any direct, indirect, incidental, or consequential damages arising from the use or inability to use the website or its services.",
      },
      {
        heading: "Changes to This Disclaimer",
        body: "We may update this Disclaimer from time to time. Any changes will be posted on this page with an updated date.",
      },
      {
        heading: "Contact Us",
        body: "If you have any questions about this Disclaimer, please reach out through our contact page.",
        linkHref: "/contact",
        linkLabel: "Go to Contact Page",
      },
    ],
  },
  dmca: {
    eyebrow: "DMCA Policy",
    title: "TimexFrame DMCA Policy",
    intro:
      "TimexFrame respects the intellectual property rights of others and expects users of this website to do the same.",
    sections: [
      {
        heading: "No Content Hosting",
        body: "TimexFrame does not host, upload, or store user videos or media files. All video processing is done locally within the user's browser. Because of this, we do not have access to or control over user-submitted content.",
      },
      {
        heading: "Copyright Responsibility",
        body: "Users are solely responsible for the content they use with TimexFrame. By using this tool, you agree that you own the content you are processing, or you have the legal right or permission to use it. TimexFrame is not responsible for any misuse of copyrighted material by users.",
      },
      {
        heading: "Reporting Copyright Infringement",
        body: "If you believe that any content related to this website violates your copyright, you may submit a DMCA notice with the following details: your name and contact information (email), description of the copyrighted work, description of the issue, a statement that you believe the use is unauthorized, a statement that the information is accurate, and your electronic or physical signature.",
      },
      {
        heading: "Submit a DMCA Notice",
        body: "You can submit your DMCA request through our contact page. We will review your request and take appropriate action when necessary.",
        linkHref: "/contact",
        linkLabel: "Submit via Contact Page",
      },
    ],
  },
};

export default function LegalPage({ variant }: { variant: LegalVariant }) {
  const content = LEGAL_CONTENT[variant];
  const canonicalPath =
    variant === "privacy"
      ? "/privacy"
      : variant === "terms"
        ? "/terms"
        : variant === "cookies"
          ? "/cookies"
          : variant === "disclaimer"
            ? "/disclaimer"
            : "/dmca";

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
        <section className="border-b border-zinc-100">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-zinc-400 mb-3">{content.eyebrow}</p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 mb-3">
              {content.title}
            </h1>
            {content.subtitle && <p className="text-xl text-zinc-600 mb-5">{content.subtitle}</p>}
            <p className="text-lg text-zinc-600 leading-relaxed max-w-2xl">{content.intro}</p>
            <p className="mt-4 text-sm text-zinc-400">Last updated: April 19, 2026</p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            {content.sections.map((section) => (
              <article key={section.heading} className="space-y-3">
                <h2 className="text-xl font-semibold text-zinc-900">{section.heading}</h2>
                <p className="text-base text-zinc-700 leading-relaxed">{section.body}</p>
                {section.linkHref && section.linkLabel && (
                  <a
                    href={section.linkHref}
                    className="inline-flex items-center rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 transition-colors"
                  >
                    {section.linkLabel}
                  </a>
                )}
              </article>
            ))}
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
