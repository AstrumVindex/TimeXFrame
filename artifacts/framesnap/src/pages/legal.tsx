import { Header } from "@/components/layout-header";
import { Footer } from "@/components/landing-sections";
import { SeoHead } from "@/components/seo-head";
import { ArrowUp } from "lucide-react";
import { useState, useEffect } from "react";

type LegalVariant = "privacy" | "terms" | "cookies";

const LEGAL_CONTENT: Record<LegalVariant, { eyebrow: string; title: string; subtitle?: string; intro: string; sections: Array<{ heading: string; body: string; icon?: string }> }> = {
  privacy: {
    eyebrow: "Privacy by Design",
    title: "TimexFrame Privacy & Terms",
    subtitle: "Your use of TimexFrame is governed by this agreement.",
    intro:
      "Welcome to TimexFrame. By accessing our website, you are entering into a legally binding agreement with TimexFrame. Please read the following terms carefully.",
    sections: [
      {
        heading: "1. Agreement to Terms & Scope of Service",
        body: "Welcome to TimexFrame. By accessing our website, located at [Your Domain], you are entering into a legally binding agreement with TimexFrame (\"we,\" \"us,\" or \"our\"). These Terms of Use govern your access to and use of our web-based video frame extraction utility. Whether you are a casual user, a student, a professional designer, or a YouTube creator, your use of this service is conditioned upon your acceptance of and compliance with these Terms.\n\nOur service is designed to provide a no-registration interface for extracting high-quality still images from video files. Processing performance depends on your browser, hardware, and source media. By clicking \"Upload,\" \"Start Extraction,\" or otherwise interacting with the platform, you represent that you are at least 13 years of age (or the minimum age of digital consent in your jurisdiction) and that you have the legal capacity to enter into this agreement. If you are using the service on behalf of a company or organization, you represent that you have the authority to bind that entity to these terms.",
      },
      {
        heading: "2. Description of the 'Ephemeral' Service Model",
        body: "TimexFrame operates on a \"Privacy-First, Local-Processing\" model. It is important for users to understand the technical nature of how our service functions: \n\nNon-Account Based: We do not provide user accounts. Your session is identified locally in your browser via a UUID. This means we do not store your name, email, or identity.\n\nProcessing vs. Storage: TimexFrame is a processing utility, not a storage provider. Core frame extraction runs in your browser using local device resources.\n\nData Lifecycle: Source video files remain on your device during extraction. Generated frame files remain in your browser session until you download or close/clear the session.",
      },
      {
        heading: "3. Intellectual Property: Yours & Ours",
        body: "Your Media: You remain the sole owner of any video you process with TimexFrame. We do not claim any ownership, copyright, or intellectual property rights over your original files or the frames extracted from them.\n\nOur Platform: All aspects of the TimexFrame platform, including the brand name, logo, \"Extract perfection from motion\" slogan, UI components (based on shadcn/ui), custom TypeScript logic, and analysis logic, are the intellectual property of TimexFrame. You may not scrape, crawl, or frame the website for commercial purposes without our express written consent.",
      },
      {
        heading: "4. Acceptable Use & Prohibited Conduct",
        body: "To ensure the service remains available and free for everyone, you agree to use TimexFrame only for lawful purposes. Prohibited conduct includes, but is not limited to: \n\nInfrastructure Abuse: You may not attempt to overload or abuse the service with automated scripts or malformed requests.\n\nIllegal Content: You are strictly prohibited from processing media that contains child sexual abuse material (CSAM), promotes terrorism, or depicts illegal acts of violence. We have a zero-tolerance policy for such content and will cooperate with law enforcement when legally required.\n\nHarassment & Rights Violation: You may not use this tool to extract frames from media that you do not have the rights to, or to create deepfakes or other content intended to harass or defame individuals.\n\nSecurity Interference: You may not attempt to gain unauthorized access to application infrastructure, other users' sessions, or protected resources.",
      },
      {
        heading: "5. Technical Disclaimers (FFmpeg & Sharp)",
        body: "TimexFrame relies on open-source and browser-provided decoding capabilities for frame extraction and image generation.\n\nExtraction Accuracy: While we strive for millisecond precision, frame extraction can vary based on video encoding and browser decoding behavior. We do not guarantee that the extracted frame will perfectly match previews across every browser and device.\n\nQuality Variations: The Smart Suggestions feature uses algorithmic scoring (such as sharpness and brightness heuristics). This is a mathematical approximation. We are not liable if the algorithm selects a frame that does not meet your subjective artistic standards.\n\nCodec Support: While we support MP4, MOV, and WEBM, we cannot guarantee support for every proprietary or legacy codec.",
      },
      {
        heading: "6. Limitation of Liability",
        body: "In no event shall TimexFrame, its developers, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from: \n\n- Your access to or use of (or inability to access or use) the service.\n- Any conduct or content of any third party on the service.\n- Any content obtained from the service.\n- Unauthorized access, use, or alteration of your transmissions or content.\n\nAs a free utility, TimexFrame is provided AS IS and AS AVAILABLE without warranties of any kind, whether express or implied. We do not warrant that the service will be uninterrupted, secure, or free of bugs or viruses.",
      },
      {
        heading: "7. Third-Party Links & Advertising",
        body: "TimexFrame may contain links to third-party websites or services that are not owned or controlled by us. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites. Furthermore, we may display advertisements via the Google AdSense network. These advertisers may use cookies to track your visits to this and other sites to provide personalized ads. Your interactions with these advertisers are governed by their respective terms and policies.",
      },
      {
        heading: "8. Indemnification",
        body: "You agree to defend, indemnify, and hold harmless TimexFrame and its operators from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney's fees), resulting from or arising out of: \n\n- Your use and access of the Service;\n- A breach of these Terms;\n- Any infringement by you (or any third party using your session) of any intellectual property or other right of any person or entity.",
      },
      {
        heading: "9. Service Modifications & Termination",
        body: "We reserve the right to modify, suspend, or discontinue any part of TimexFrame at any time without notice. We may update these Terms of Use to reflect changes in our technology or legal requirements. The Last Updated date at the top of the page will indicate when the most recent changes were made. Since we do not have your email, it is your responsibility to check this page for updates. We reserve the right to block specific IP addresses that violate our Acceptable Use Policy.",
      },
      {
        heading: "10. Governing Law & Jurisdiction",
        body: "These Terms shall be governed and construed in accordance with the laws of [Your Country/State], without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect. These Terms constitute the entire agreement between us regarding our Service and supersede any prior agreements we might have had.",
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
            <p className="mt-4 text-sm text-zinc-400">Last updated: April 1, 2026</p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            {content.sections.map((section) => (
              <article key={section.heading} className="space-y-3">
                <h2 className="text-xl font-semibold text-zinc-900">{section.heading}</h2>
                <p className="text-base text-zinc-700 leading-relaxed">{section.body}</p>
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
