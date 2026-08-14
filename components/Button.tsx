
type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
};

export default function Button({
  children,
  className,
  onClick,
  type = "button",
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`bg-blue hover:bg-blue-2 w-full text-white rounded-sm text-sm py-2 ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}