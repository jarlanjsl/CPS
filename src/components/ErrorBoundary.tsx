import { Component, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import '../styles/error-boundary.css';

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

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('[ErrorBoundary] Erro capturado:', error);
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
  }

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-wrapper">
          <div className="error-boundary-card glass-effect">
            <div className="error-boundary-icon">
              <AlertTriangle size={48} strokeWidth={1.5} />
            </div>
            <h1 className="error-boundary-title">Algo deu errado</h1>
            <p className="error-boundary-description">
              Ocorreu um erro inesperado. Tente recarregar a página.
            </p>
            {this.state.error && (
              <p className="error-boundary-detail">{this.state.error.message}</p>
            )}
            <button
              className="error-boundary-btn"
              onClick={this.handleReload}
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;