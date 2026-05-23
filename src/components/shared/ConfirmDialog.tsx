// src/components/shared/ConfirmDialog.tsx
// F3 — Confirmation dialog สำหรับ destructive actions

import React, { useEffect, useRef } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
    onCancel: () => void;
    loading?: boolean;
}

/**
 * @component ConfirmDialog
 * @description Modal dialog สำหรับ destructive actions เช่น ลบข้อมูล, รีเซ็ต, ออก Join Code ใหม่
 *
 * @example
 * <ConfirmDialog
 *   open={showDelete}
 *   title="ลบบทเรียน"
 *   message="ต้องการลบบทเรียนนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้"
 *   variant="danger"
 *   confirmLabel="ลบ"
 *   onConfirm={handleDelete}
 *   onCancel={() => setShowDelete(false)}
 * />
 */
const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    open,
    title,
    message,
    confirmLabel = 'ยืนยัน',
    cancelLabel = 'ยกเลิก',
    variant = 'danger',
    onConfirm,
    onCancel,
    loading = false,
}) => {
    const cancelBtnRef = useRef<HTMLButtonElement>(null);

    // Focus cancel button เมื่อเปิด (safer default)
    useEffect(() => {
        if (open) {
            setTimeout(() => cancelBtnRef.current?.focus(), 50);
        }
    }, [open]);

    // กด Escape ปิด dialog
    useEffect(() => {
        if (!open) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onCancel();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [open, onCancel]);

    if (!open) return null;

    const variantConfig = {
        danger: {
            iconColor: 'var(--color-error)',
            iconBg: 'color-mix(in srgb, var(--color-error) 12%, transparent)',
            confirmBg: 'var(--color-error)',
            Icon: Trash2,
        },
        warning: {
            iconColor: 'var(--color-warning)',
            iconBg: 'color-mix(in srgb, var(--color-warning) 12%, transparent)',
            confirmBg: 'var(--color-warning)',
            Icon: AlertTriangle,
        },
        info: {
            iconColor: 'var(--color-primary)',
            iconBg: 'var(--color-primary-light)',
            confirmBg: 'var(--color-primary)',
            Icon: AlertTriangle,
        },
    }[variant];

    const { iconColor, iconBg, confirmBg, Icon } = variantConfig;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)' }}
                onClick={onCancel}
            >
                {/* Dialog */}
                <div
                    className="w-full max-w-sm rounded-2xl p-6 shadow-2xl"
                    style={{
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                    }}
                    onClick={e => e.stopPropagation()}
                    role="alertdialog"
                    aria-modal="true"
                    aria-labelledby="confirm-title"
                >
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-4">
                        <div
                            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: iconBg }}
                        >
                            <Icon size={20} style={{ color: iconColor }} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3
                                id="confirm-title"
                                className="font-semibold text-base leading-snug"
                                style={{ color: 'var(--color-text)' }}
                            >
                                {title}
                            </h3>
                        </div>
                        <button
                            onClick={onCancel}
                            className="flex-shrink-0 p-1 rounded-lg transition-colors hover:opacity-70"
                            style={{ color: 'var(--color-text-muted)' }}
                            aria-label="ปิด"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Message */}
                    <p
                        className="text-sm leading-relaxed mb-6"
                        style={{ color: 'var(--color-text-muted)' }}
                    >
                        {message}
                    </p>

                    {/* Buttons */}
                    <div className="flex gap-2">
                        <button
                            ref={cancelBtnRef}
                            onClick={onCancel}
                            disabled={loading}
                            className="flex-1 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-80 disabled:opacity-50"
                            style={{
                                background: 'var(--color-border)',
                                color: 'var(--color-text)',
                            }}
                        >
                            {cancelLabel}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={loading}
                            className="flex-1 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                            style={{ background: confirmBg }}
                        >
                            {loading ? 'กำลังดำเนินการ...' : confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

/**
 * @hook useConfirmDialog
 * @description Hook สำหรับจัดการ state ของ ConfirmDialog
 *
 * @example
 * const confirm = useConfirmDialog();
 * confirm.open({ title: 'ลบ?', message: '...', onConfirm: handleDelete });
 * return <ConfirmDialog {...confirm.props} />;
 */
export function useConfirmDialog() {
    const [state, setState] = React.useState<{
        open: boolean;
        title: string;
        message: string;
        confirmLabel?: string;
        variant?: 'danger' | 'warning' | 'info';
        onConfirm: () => void;
        loading: boolean;
    }>({
        open: false,
        title: '',
        message: '',
        loading: false,
        onConfirm: () => {},
    });

    const openDialog = (opts: {
        title: string;
        message: string;
        confirmLabel?: string;
        variant?: 'danger' | 'warning' | 'info';
        onConfirm: () => void | Promise<void>;
    }) => {
        setState({
            open: true,
            title: opts.title,
            message: opts.message,
            confirmLabel: opts.confirmLabel,
            variant: opts.variant ?? 'danger',
            loading: false,
            onConfirm: async () => {
                setState(s => ({ ...s, loading: true }));
                try {
                    await opts.onConfirm();
                } finally {
                    setState(s => ({ ...s, open: false, loading: false }));
                }
            },
        });
    };

    const closeDialog = () => setState(s => ({ ...s, open: false }));

    return {
        open: openDialog,
        props: {
            open: state.open,
            title: state.title,
            message: state.message,
            confirmLabel: state.confirmLabel,
            variant: state.variant,
            onConfirm: state.onConfirm,
            onCancel: closeDialog,
            loading: state.loading,
        },
    };
}

export default ConfirmDialog;
