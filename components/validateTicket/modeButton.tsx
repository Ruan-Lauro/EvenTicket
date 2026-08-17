export default function ModeButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center gap-1.5 py-4 rounded-2xl border-2 text-sm font-semibold transition-all
        ${
          active
            ? "border-[#1570EF] bg-[#1570EF]/5 text-[#1570EF]"
            : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700"
        }`}
    >
      {icon}
      {label}
    </button>
  );
}