import { Frame } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl">
      <div className="flex h-16 items-center px-4 md:px-6 max-w-7xl mx-auto justify-between">
        <a href="/" className="flex items-center gap-2.5 font-display font-bold text-xl tracking-tight hover:opacity-80 transition-opacity">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-lg shadow-sm">
            <Frame className="w-5 h-5" />
          </div>
          FrameSnap
        </a>
        <nav className="flex items-center gap-4">
          <a href="https://github.com" target="_blank" rel="noreferrer" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Documentation
          </a>
        </nav>
      </div>
    </header>
  );
}
