"use client";

import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

type ImageLightboxProps = {
  src: string;
  alt: string;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
};

export function ImageLightbox({
  src,
  alt,
  onClose,
  triggerRef,
}: ImageLightboxProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prevOverflow;
      triggerRef.current?.focus();
    };
  }, [triggerRef]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
      if (e.key === "Tab") {
        e.preventDefault();
        closeButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-hidden="true"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Image preview"
        className="relative max-h-[calc(100vh-3rem)] max-w-[calc(100vw-3rem)]"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          transition={{ duration: 0.18, ease: [0.22, 0.61, 0.36, 1] }}
        >
          {/* biome-ignore lint/performance/noImgElement: external API URL requires native img */}
          <img
            src={src}
            alt={alt}
            className="block max-h-[calc(100vh-6rem)] max-w-[calc(100vw-6rem)] rounded-sm object-contain"
          />
        </motion.div>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-washi-cream text-ink-faint shadow-[0_2px_8px_var(--shadow-ink-heavy)] transition-colors hover:text-accent-vermillion focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-vermillion"
          aria-label="Close image preview"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M4 4l8 8M12 4l-8 8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </motion.div>,
    document.body,
  );
}
