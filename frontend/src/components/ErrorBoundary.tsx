import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="bg-slate-900/90 border border-rose-900/60 rounded-3xl p-8 text-center max-w-2xl mx-auto my-8 space-y-6 shadow-2xl backdrop-blur-md">
          <div className="w-14 h-14 rounded-2xl bg-rose-950/80 border border-rose-800/60 flex items-center justify-center text-rose-400 mx-auto">
            <AlertOctagon className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white tracking-tight">
              {this.props.fallbackTitle || 'Component Rendering Exception'}
            </h3>
            <p className="text-xs text-slate-300 font-mono leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800 text-left overflow-x-auto">
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>
          </div>
          <div>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-semibold transition-colors inline-flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-cyan-400" />
              <span>Retry Rendering</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
