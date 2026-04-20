import { Suspense, lazy, useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";

const NotFound = lazy(() => import("@/pages/not-found"));
const Home = lazy(() => import("@/pages/home"));
const AboutPage = lazy(() => import("@/pages/about"));
const ContactPage = lazy(() => import("@/pages/contact"));
const LegalPage = lazy(() => import("@/pages/legal"));
const BlogPage = lazy(() => import("@/pages/blog"));
const BlogPostPage = lazy(() =>
  import("@/pages/blog").then((module) => ({ default: module.BlogPostPage })),
);

function ScrollManager() {
  const [location] = useLocation();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    // Preserve hash navigation for in-page anchors (e.g., table of contents links).
    if (window.location.hash) {
      const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location]);

  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/blog" component={BlogPage} />
      <Route path="/blog/:slug">{(params) => <BlogPostPage slug={params.slug} />}</Route>
      <Route path="/about" component={AboutPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/privacy">{() => <LegalPage variant="privacy" />}</Route>
      <Route path="/terms">{() => <LegalPage variant="terms" />}</Route>
      <Route path="/cookies">{() => <LegalPage variant="cookies" />}</Route>
      <Route path="/disclaimer">{() => <LegalPage variant="disclaimer" />}</Route>
      <Route path="/dmca">{() => <LegalPage variant="dmca" />}</Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <ScrollManager />
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <Router />
      </Suspense>
    </WouterRouter>
  );
}

export default App;
