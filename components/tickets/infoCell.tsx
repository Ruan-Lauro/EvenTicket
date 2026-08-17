export function InfoCell({
  icon,
  label,
  value,
  wide = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-0.5 ${wide ? "col-span-2" : ""}`}>
      <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
        {icon}
        {label}
      </span>
      <span className="text-sm font-semibold text-gray-800 leading-snug">{value}</span>
    </div>
  );
}