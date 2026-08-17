
type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
};

export default function ButtonExit({
  children,
  className,
  onClick,
  type = "button",
  disabled,
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`border border-blue text-blue hover:bg-blue hover:text-white transition-colors w-full rounded-sm text-sm py-2 ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}