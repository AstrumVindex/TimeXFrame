import { Link, useLocation } from "wouter";
import { Frame, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onExtractClick?: () => void;
  isWorkspace?: boolean;
  onNewUpload?: () => void;
}

export function Header({ onExtractClick, isWorkspace, onNewUpload }: HeaderProps) {
  const [location] = useLocation();
  const baseUrl = import.meta.env.BASE_URL || "/";

  const scrollTo = (id: string) => {
    if (location !== "/") {
      window.location.assign(`${baseUrl}#${id}`);
      return;
    }

    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    else if (onExtractClick && id === "upload") onExtractClick();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/90 backdrop-blur-xl">
      <div className="relative flex h-16 w-full items-center justify-between px-4 md:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 font-bold text-xl tracking-tight hover:opacity-80 transition-opacity"
        >
          <div className="bg-zinc-900 text-white p-1.5 rounded-lg shadow-sm">
            <Frame className="w-5 h-5" />
          </div>
          TimexFrame
        </Link>

        {/* Landing nav links — hidden in workspace mode */}
        {!isWorkspace && (
          <nav className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
            <Link
              href="/blog"
              className="text-sm font-medium text-zinc-700 hover:text-zinc-900 transition-colors"
            >
              Blog
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-zinc-700 hover:text-zinc-900 transition-colors"
            >
              About Us
            </Link>
            <Link
              href="/contact"
              className="text-sm font-medium text-zinc-700 hover:text-zinc-900 transition-colors"
            >
              Contact
            </Link>
          </nav>
        )}

        {/* CTA — "Choose New Video" in workspace, "Extract Frames" on landing */}
        {isWorkspace ? (
          <Button
            size="sm"
            variant="outline"
            className="border-zinc-300 text-zinc-700 hover:bg-zinc-50 rounded-lg font-semibold"
            onClick={onNewUpload}
          >
            <UploadCloud className="w-4 h-4 mr-2" />
            Choose New Video
          </Button>
        ) : (
          <Button
            size="sm"
            className="bg-zinc-900 hover:bg-zinc-700 text-white rounded-lg font-semibold shadow-sm"
            onClick={() => scrollTo("upload")}
          >
            Extract Frames
          </Button>
        )}
      </div>
    </header>
  );
}
