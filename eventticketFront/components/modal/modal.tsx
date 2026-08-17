"use client";

import { ReactNode, MouseEvent } from "react";

interface ModalProps {
  children: ReactNode;
  onClose: () => void;
  maxWidth?: string;
  closeOnOverlayClick?: boolean;
}

export default function Modal({
  children,
  onClose,
  maxWidth = "max-w-3xl",
  closeOnOverlayClick = true,
}: ModalProps) {
  function handleOverlayClick(e: MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  }

  return (
    <div
      className="fixed inset-0 z-80 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(10, 18, 46, 0.7)",
        backdropFilter: "blur(4px)",
      }}
      onClick={handleOverlayClick}
    >
      <div
        className={`relative bg-white rounded-sm shadow-2xl w-full ${maxWidth}`}
      >
        {children}
      </div>
    </div>
  );
}