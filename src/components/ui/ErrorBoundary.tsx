import { Component, ReactNode } from 'react';
import { WEDDING_DATE_DISPLAY } from '../../constants/wedding';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-ivory flex flex-col items-center justify-center px-8 text-center">
          <h1 className="font-dayland text-6xl text-ink mb-4">Dani & Marini</h1>
          <p className="font-serif italic text-lg text-ink/70 mb-2">{WEDDING_DATE_DISPLAY}</p>
          <p className="font-serif italic text-sm text-ink/60 mb-8">Gedung Wanita Candra Kencana, Surabaya</p>
          <div className="w-12 h-px bg-gold/30 mx-auto mb-8" />
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-gold font-bold">Silakan refresh halaman</p>
        </div>
      );
    }

    return this.props.children;
  }
}
