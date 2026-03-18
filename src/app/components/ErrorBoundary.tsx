import React from 'react';
import { captureError } from '../lib/observability';

interface ErrorBoundaryState {
  hasError: boolean;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('UI crash captured by ErrorBoundary', error);
    captureError(error, { source: 'react.error_boundary' });
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div style={{ padding: 24, fontFamily: 'Inter, sans-serif' }}>
            <div>Data temporarily unavailable</div>
            <div style={{ marginTop: 8, fontSize: 13, color: '#6b7280' }}>Try again later.</div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
