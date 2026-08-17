import { ReactNode } from "react";

interface ModalHeaderProps {
  children?: ReactNode;
  image?: string;
  imageAlt?: string;
  badge?: string;
  onClose: () => void;
}

export default function ModalHeader({
  children,
  image,
  imageAlt = "",
  badge,
  onClose,
}: ModalHeaderProps) {
  return (
    <div className="relative h-56 overflow-hidden">
      {image && (
        <img
          src={image}
          alt={imageAlt}
          className="w-full h-full object-cover"
        />
      )}

      {image && (
        <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent" />
      )}

      {badge && (
        <div className="absolute top-4 left-4">
          <span
            className="text-xs font-semibold px-3 py-1 rounded-full text-white"
            style={{ backgroundColor: "#2563EB" }}
          >
            {badge}
          </span>
        </div>
      )}

      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
        aria-label="Fechar modal"
      >
        ✕
      </button>

      {children}
    </div>
  );
}