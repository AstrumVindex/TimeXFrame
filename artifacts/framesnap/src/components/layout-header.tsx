import { Frame } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onExtractClick?: () => void;
}

export function Header({ onExtractClick }: HeaderProps) {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    else if (onExtractClick && id === "upload") onExtractClick();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/90 backdrop-blur-xl">
      <div className="flex h-16 items-center px-4 md:px-6 max-w-7xl mx-auto justify-between">
        {/* Logo */}
        <a
          href="/"
          className="flex items-center gap-2.5 font-bold text-xl tracking-tight hover:opacity-80 transition-opacity"
        >
          <div className="bg-zinc-900 text-white p-1.5 rounded-lg shadow-sm">
            <Frame className="w-5 h-5" />
          </div>
          TimexFrame
        </a>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-6">
          <a
            href="#features"
            onClick={(e) => { e.preventDefault(); scrollTo("features"); }}
            className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            onClick={(e) => { e.preventDefault(); scrollTo("how-it-works"); }}
            className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            How It Works
          </a>
          <a
            href="#faq"
            onClick={(e) => { e.preventDefault(); scrollTo("faq"); }}
            className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            FAQ
          </a>
        </nav>

        {/* CTA */}
        <Button
          size="sm"
          className="bg-zinc-900 hover:bg-zinc-700 text-white rounded-lg font-semibold shadow-sm"
          onClick={() => scrollTo("upload")}
        >
          Extract Frames
        </Button>
      </div>
    </header>
  );
}
