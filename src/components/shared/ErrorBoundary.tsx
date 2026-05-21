// src/components/shared/ErrorBoundary.tsx

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error('[ErrorBoundary]', error, info.componentStack);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div className="min-h-screen app-bg flex items-center justify-center p-4">
                    <div
                        className="w-full max-w-sm rounded-2xl p-6 text-center shadow-xl"
                        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                            style={{ background: 'color-mix(in srgb, var(--color-error) 12%, transparent)' }}>
                            <AlertTriangle size={28} style={{ color: 'var(--color-error)' }} />
                        </div>
                        <h2 className="text-base font-bold mb-2" style={{ color: 'var(--color-text)' }}>
                            เกิดข้อผิดพลาด
                        </h2>
                        <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
                            {this.state.error?.message || 'ไม่ทราบสาเหตุ'}
                        </p>
                        <p className="text-xs mb-5" style={{ color: 'var(--color-text-muted)' }}>
                            ลองโหลดหน้าใหม่ หรือติดต่อผู้ดูแลระบบ
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={this.handleReset}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
                                style={{ background: 'var(--color-border)', color: 'var(--color-text)' }}>
                                <RefreshCw size={13} /> ลองใหม่
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="flex-1 py-2 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90"
                                style={{ background: 'var(--color-primary)' }}>
                                หน้าหลัก
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
