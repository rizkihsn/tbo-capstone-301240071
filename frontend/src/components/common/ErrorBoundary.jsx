import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import Button from '../buttons/Button';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-[400px] flex items-center justify-center p-6 w-full h-full">
                    <div className="max-w-md w-full bg-white rounded-xl shadow-card border border-border p-8 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mb-6">
                            <AlertTriangle className="text-danger" size={32} />
                        </div>
                        <h2 className="text-2xl font-bold font-heading text-text-primary mb-2">Something went wrong</h2>
                        <p className="text-text-secondary mb-6 text-sm leading-relaxed">
                            An unexpected error occurred in this module. We apologize for the inconvenience. 
                            You can try refreshing the page to fix this issue.
                        </p>
                        
                        {this.state.error && (
                            <div className="w-full text-left bg-gray-50 border border-border rounded-lg p-3 mb-6 overflow-auto max-h-32 text-xs font-mono text-danger/80">
                                {this.state.error.toString()}
                            </div>
                        )}

                        <Button onClick={this.handleReload} className="w-full flex items-center justify-center gap-2">
                            <RefreshCcw size={16} /> Reload Page
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children; 
    }
}

export default ErrorBoundary;
