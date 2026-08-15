import { ReactNode } from "react";

interface ModalFooterProps {
  children: ReactNode;
  className?: string;
}

export default function ModalFooter({
  children,
  className = "",
}: ModalFooterProps) {
  return (
    <div className={`flex w-full items-center justify-between mt-6 ${className}`}>
      {children}
    </div>
  );
}