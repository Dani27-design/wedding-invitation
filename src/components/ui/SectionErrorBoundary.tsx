'use client';
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class SectionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full py-16 flex flex-col items-center justify-center text-center px-6">
          <p className="font-serif italic text-sm text-ink/60 mb-4">
            Gagal memuat konten. Periksa koneksi internet Anda.
          </p>
          <button
            onClick={this.handleRetry}
            className="px-6 py-2 bg-gold text-ivory rounded-full text-xs uppercase tracking-[0.2em] font-black shadow-md hover:scale-105 transition-transform"
          >
            Coba Lagi
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
