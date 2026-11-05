import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('TAP COIN Runtime Error:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.clear();
      window.location.reload();
    } catch {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#080B10] text-slate-100 flex items-center justify-center p-6 text-center">
          <div className="max-w-sm w-full p-6 rounded-3xl bg-[#0F141E] border border-amber-500/40 shadow-2xl">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-2xl mb-3">
              ⚠️
            </div>
            <h2 className="text-lg font-bold text-slate-100">خطا در اجرای بازی</h2>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              {this.state.error?.message || 'مشکلی در بارگذاری داده‌ها رخ داده است.'}
            </p>
            <div className="space-y-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase transition-all"
              >
                تلاش مجدد (Reload Game)
              </button>
              <button
                onClick={this.handleReset}
                className="w-full py-2 px-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium transition-all"
              >
                پاک‌سازی حافظه محلی و شروع مجدد (Reset Data)
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
