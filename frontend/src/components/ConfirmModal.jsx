/**
 * ConfirmModal Component
 * On-brand confirmation dialog that replaces browser's default `window.confirm()`.
 * Features glassmorphic design, gentle animations, and empathetic copy.
 */

import { Heart, AlertTriangle, Trash2, X } from "lucide-react";
import { useEffect, useRef } from "react";

const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Are you sure?",
    message = "",
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    variant = "default", // "default" | "danger" | "gentle"
    icon: CustomIcon,
}) => {
    const modalRef = useRef(null);

    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [isOpen, onClose]);

    // Auto-focus the modal for accessibility
    useEffect(() => {
        if (isOpen && modalRef.current) {
            modalRef.current.focus();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const getVariantStyles = () => {
        switch (variant) {
            case "danger":
                return {
                    iconBg: "rgba(199, 80, 80, 0.1)",
                    iconColor: "var(--color-error)",
                    Icon: CustomIcon || Trash2,
                    confirmBg: "var(--color-error)",
                    confirmHoverBg: "#b94a4a",
                };
            case "gentle":
                return {
                    iconBg: "rgba(58, 125, 92, 0.1)",
                    iconColor: "var(--color-primary)",
                    Icon: CustomIcon || Heart,
                    confirmBg: "var(--color-primary)",
                    confirmHoverBg: "#2B5E44",
                };
            default:
                return {
                    iconBg: "rgba(200, 149, 108, 0.1)",
                    iconColor: "#C8956C",
                    Icon: CustomIcon || AlertTriangle,
                    confirmBg: "#C8956C",
                    confirmHoverBg: "#a87a52",
                };
        }
    };

    const styles = getVariantStyles();

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-[100] animate-fade-in"
                style={{
                    background: "rgba(0, 0, 0, 0.3)",
                    backdropFilter: "blur(6px)",
                    WebkitBackdropFilter: "blur(6px)",
                }}
                onClick={onClose}
            />

            {/* Modal Card */}
            <div
                ref={modalRef}
                tabIndex={-1}
                className="fixed inset-0 z-[101] flex items-center justify-center p-4"
                onClick={(e) => e.target === e.currentTarget && onClose()}
            >
                <div
                    className="w-full max-w-sm animate-scale-in"
                    style={{
                        borderRadius: "24px",
                        background: "rgba(255, 255, 255, 0.97)",
                        backdropFilter: "blur(28px) saturate(1.6)",
                        WebkitBackdropFilter: "blur(28px) saturate(1.6)",
                        boxShadow: "0 24px 80px rgba(0, 0, 0, 0.15), 0 0 0 1px var(--color-border)",
                        overflow: "hidden",
                    }}
                >
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1.5 rounded-lg transition-colors"
                        style={{ color: "var(--color-text-muted)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.05)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                        <X className="w-4 h-4" />
                    </button>

                    {/* Content */}
                    <div className="p-7 text-center">
                        {/* Icon */}
                        <div
                            className="inline-flex items-center justify-center w-14 h-14 rounded-[18px] mb-5"
                            style={{
                                background: styles.iconBg,
                            }}
                        >
                            <styles.Icon className="w-6 h-6" style={{ color: styles.iconColor }} />
                        </div>

                        {/* Title */}
                        <h3
                            className="text-lg font-semibold mb-2"
                            style={{
                                color: "var(--color-text)",
                                fontFamily: "var(--font-heading)",
                            }}
                        >
                            {title}
                        </h3>

                        {/* Message */}
                        {message && (
                            <p
                                className="text-sm leading-relaxed mb-6"
                                style={{
                                    color: "var(--color-text-secondary)",
                                    fontFamily: "var(--font-body)",
                                }}
                            >
                                {message}
                            </p>
                        )}

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all"
                                style={{
                                    background: "var(--color-surface)",
                                    color: "var(--color-text-secondary)",
                                    border: "1px solid var(--color-border)",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = "var(--color-bg)";
                                    e.currentTarget.style.borderColor = "var(--color-text-muted)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "var(--color-surface)";
                                    e.currentTarget.style.borderColor = "var(--color-border)";
                                }}
                            >
                                {cancelLabel}
                            </button>
                            <button
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold text-white transition-all"
                                style={{
                                    background: styles.confirmBg,
                                    boxShadow: `0 4px 12px ${styles.iconBg}`,
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = styles.confirmHoverBg;
                                    e.currentTarget.style.transform = "translateY(-1px)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = styles.confirmBg;
                                    e.currentTarget.style.transform = "translateY(0)";
                                }}
                            >
                                {confirmLabel}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ConfirmModal;
