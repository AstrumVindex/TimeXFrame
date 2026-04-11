import { useState } from "react";
import { Send } from "lucide-react";
import { Header } from "@/components/layout-header";
import { Footer } from "@/components/landing-sections";
import { SeoHead } from "@/components/seo-head";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MAX_MESSAGE_CHARACTERS = 1000;

export default function ContactPage() {
  const [messageType, setMessageType] = useState("question");
  const [message, setMessage] = useState("");
  const messageCharacterCount = message.length;

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
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-zinc-900 mb-2">Send us a message</h2>
              <p className="text-sm text-zinc-500 mb-6">
                Fill out the form below. Your message will be sent to timexframe4all@gmail.com.
              </p>

              <form
                action="https://formspree.io/f/mpqovkyk"
                method="POST"
                className="space-y-5"
              >

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contact-name">Name</Label>
                    <Input
                      id="contact-name"
                      name="name"
                      placeholder="Your full name"
                      autoComplete="name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-email">Email</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Message Type</Label>
                  <input type="hidden" name="messageType" value={messageType} />
                  <Select value={messageType} onValueChange={setMessageType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="question">Question</SelectItem>
                      <SelectItem value="feedback">Feedback</SelectItem>
                      <SelectItem value="feature-request">New Feature Request</SelectItem>
                      <SelectItem value="bug-error">Bug / Error Report</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-message">Message</Label>
                  <Textarea
                    id="contact-message"
                    name="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value.slice(0, MAX_MESSAGE_CHARACTERS))}
                    placeholder="Write your message here..."
                    className="h-64 resize-none overflow-y-auto"
                    maxLength={MAX_MESSAGE_CHARACTERS}
                    required
                  />
                  <p className="text-xs text-zinc-500">
                    {messageCharacterCount}/{MAX_MESSAGE_CHARACTERS} characters
                  </p>
                </div>

                <Button
                  type="submit"
                  className="bg-zinc-900 hover:bg-zinc-700 text-white rounded-lg font-semibold"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
