import { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  groomNickname?: string;
  brideNickname?: string;
  dateDisplay?: string;
  venueName?: string;
  eventCity?: string;
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
      const {
        groomNickname = '',
        brideNickname = '',
        dateDisplay = '',
        venueName = '',
        eventCity = '',
      } = this.props;

      return (
        <div className="min-h-screen bg-ivory flex flex-col items-center justify-center px-8 text-center">
          <h1 className="font-dayland text-6xl text-ink mb-4">{groomNickname && brideNickname ? `${groomNickname} & ${brideNickname}` : 'Undangan Pernikahan'}</h1>
          {dateDisplay && <p className="font-serif italic text-lg text-ink/70 mb-2">{dateDisplay}</p>}
          {(venueName || eventCity) && <p className="font-serif italic text-sm text-ink/60 mb-8">{[venueName, eventCity].filter(Boolean).join(', ')}</p>}
          <div className="w-12 h-px bg-gold/30 mx-auto mb-8" />
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-gold font-bold">Silakan refresh halaman</p>
        </div>
      );
    }

    return this.props.children;
  }
}
