"use client";

import { useEffect, useRef } from "react";

/* =========================================================
   TYPES
========================================================= */

export type PopupType = "error" | "warning" | "info" | "success";

export interface PopupProps {
    open: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: PopupType;
    confirmText?: string;
}

/* =========================================================
   CONFIG PAR TYPE
========================================================= */

const TYPE_CONFIG: Record<
    PopupType,
    { accent: string; accentSoft: string; glyph: string }
> = {
    error: { accent: "#e5484d", accentSoft: "rgba(229, 72, 77, 0.14)", glyph: "!" },
    warning: { accent: "#f5a524", accentSoft: "rgba(245, 165, 36, 0.16)", glyph: "!" },
    info: { accent: "#4c9aff", accentSoft: "rgba(76, 154, 255, 0.14)", glyph: "i" },
    success: { accent: "#2fbf71", accentSoft: "rgba(47, 191, 113, 0.16)", glyph: "\u2713" },
};

/* =========================================================
   COMPOSANT
========================================================= */

export default function Popup({
    open,
    onClose,
    title,
    message,
    type = "info",
    confirmText = "OK",
}: PopupProps) {
    const dialogRef = useRef<HTMLDivElement | null>(null);
    const confirmBtnRef = useRef<HTMLButtonElement | null>(null);

    const cfg = TYPE_CONFIG[type];

    // Focus le bouton de confirmation à l'ouverture, pour l'accessibilité clavier
    useEffect(() => {
        if (open) {
            const id = window.setTimeout(() => confirmBtnRef.current?.focus(), 50);
            return () => window.clearTimeout(id);
        }
    }, [open]);

    // Fermeture via la touche Echap
    useEffect(() => {
        if (!open) return;

        function handleKeydown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                onClose();
            }
        }

        window.addEventListener("keydown", handleKeydown);
        return () => window.removeEventListener("keydown", handleKeydown);
    }, [open, onClose]);

    function handleBackdropClick(event: React.MouseEvent<HTMLDivElement>) {
        if (event.target === event.currentTarget) {
            onClose();
        }
    }

    return (
        <div
            className={`popup-alert-overlay${open ? " active" : ""}`}
            onMouseDown={handleBackdropClick}
            aria-hidden={!open}
        >
            <div
                ref={dialogRef}
                className="popup-alert"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="popup-alert-title"
                aria-describedby="popup-alert-message"
            >
                <div className="popup-alert-glyph" aria-hidden="true">
                    {cfg.glyph}
                </div>

                <h2 id="popup-alert-title" className="popup-alert-title">
                    {title}
                </h2>

                <p id="popup-alert-message" className="popup-alert-message">
                    {message}
                </p>

                <button
                    ref={confirmBtnRef}
                    type="button"
                    className="popup-alert-confirm"
                    onClick={onClose}
                >
                    {confirmText}
                </button>
            </div>

            <style jsx>{`
                .popup-alert-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 2000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    background: rgba(10, 8, 20, 0.6);
                    backdrop-filter: blur(2px);
                    opacity: 0;
                    visibility: hidden;
                    transition: opacity 0.25s ease, visibility 0.25s ease;
                }

                .popup-alert-overlay.active {
                    opacity: 1;
                    visibility: visible;
                }

                .popup-alert {
                    position: relative;
                    width: min(380px, 100%);
                    background: #1b1730;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 16px;
                    padding: 28px 26px 22px;
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.45);
                    text-align: center;
                    transform: translateY(18px) scale(0.94);
                    opacity: 0;
                    transition: transform 0.28s cubic-bezier(0.17, 0.89, 0.32, 1.24),
                        opacity 0.22s ease;
                }

                .popup-alert-overlay.active .popup-alert {
                    transform: translateY(0) scale(1);
                    opacity: 1;
                }

                .popup-alert-glyph {
                    width: 44px;
                    height: 44px;
                    margin: 0 auto 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    font-weight: 800;
                    font-size: 20px;
                    color: ${cfg.accent};
                    background: ${cfg.accentSoft};
                }

                .popup-alert-title {
                    margin: 0 0 8px;
                    font-size: 18px;
                    font-weight: 700;
                    color: #f4f2fa;
                    line-height: 1.3;
                }

                .popup-alert-message {
                    margin: 0 0 22px;
                    font-size: 14.5px;
                    line-height: 1.5;
                    color: #c7c2da;
                }

                .popup-alert-confirm {
                    width: 100%;
                    padding: 11px 16px;
                    border: none;
                    border-radius: 10px;
                    background: ${cfg.accent};
                    color: #16121f;
                    font-size: 15px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: transform 0.15s ease, filter 0.15s ease;
                }

                .popup-alert-confirm:hover {
                    filter: brightness(1.08);
                }

                .popup-alert-confirm:active {
                    transform: scale(0.97);
                }

                .popup-alert-confirm:focus-visible {
                    outline: 2px solid #ffffff;
                    outline-offset: 2px;
                }

                @media (prefers-reduced-motion: reduce) {
                    .popup-alert-overlay,
                    .popup-alert,
                    .popup-alert-confirm {
                        transition: none;
                    }
                }
            `}</style>
        </div>
    );
}