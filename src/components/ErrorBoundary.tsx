import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  fallbackTitle?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[FinTrack ErrorBoundary] Uncaught exception:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  private handleNavigateHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.hash = '#/';
    window.location.reload();
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Compact inline card when used inside widgets/panels with fallbackTitle
      if (this.props.fallbackTitle) {
        return (
          <div className="w-full h-full min-h-[220px] rounded-2xl border border-slate-200 bg-white p-6 flex flex-col items-center justify-center text-center space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-slate-800">
                {this.props.fallbackTitle}
              </h4>
              <p className="text-xs text-slate-500 max-w-xs">
                {this.state.error?.message || 'Component failed to render.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => this.setState({ hasError: false, error: null })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry Component
            </button>
          </div>
        );
      }

      // Full page fallback for root boundary
      return (
        <div className="min-h-screen w-full bg-white flex items-center justify-center p-6 text-slate-900 select-none">
          <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8 text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center border border-rose-100 text-rose-500">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Application Exception Detected
              </h1>
              <p className="text-sm text-slate-500 leading-relaxed">
                FinTrack encountered an unexpected state in the trading telemetry pipeline. The application has safely halted this view to prevent memory corruption.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-left overflow-hidden">
                <p className="text-xs font-mono font-semibold text-rose-600 truncate">
                  {this.state.error.name}: {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Reload View
              </button>
              <button
                type="button"
                onClick={this.handleNavigateHome}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                <Home className="w-4 h-4" />
                Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
