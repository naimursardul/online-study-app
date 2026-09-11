import { Component, type ErrorInfo, type ReactNode } from "react";

// The only error boundary in the app: without it, a render-time throw (e.g.
// an undefined deref in an analytics panel) blanks the whole page, because
// main.tsx wraps <App /> in providers and nothing else. App.tsx uses
// declarative <BrowserRouter>, so react-router's errorElement is not
// available — a class boundary is the mechanism React offers for this.
export default class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Not toast.error: toasts live inside the tree that just threw.
    console.error("Uncaught render error:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
          <h1 className="text-xl font-semibold">Something went wrong</h1>
          <p className="text-sm text-muted-foreground max-w-md">
            The page hit an unexpected error and could not be shown. Reloading
            usually fixes it.
          </p>
          <button
            className="cursor-pointer rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-sidebar"
            onClick={() => window.location.reload()}
          >
            Reload the page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
