import { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="text-center max-w-md px-4">
            <h1 className="mb-4 text-6xl font-bold text-accent">Napaka</h1>
            <p className="mb-6 text-xl text-muted-foreground">
              Nekaj je šlo narobe. Prosimo, poskusite znova.
            </p>
            {this.state.error && (
              <p className="mb-6 text-sm text-muted-foreground font-mono bg-card p-4 rounded-lg border border-border">
                {this.state.error.message}
              </p>
            )}
            <Button
              onClick={this.handleReset}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Nazaj na domačo stran
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
