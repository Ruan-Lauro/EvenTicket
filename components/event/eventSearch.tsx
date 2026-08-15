import { IoIosSearch } from "react-icons/io";

type EventSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function EventSearch({
  value,
  onChange,
}: EventSearchProps) {
  return (
    <div className="relative max-sm:w-full">
      <IoIosSearch
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg"
      />

      <input
        type="text"
        placeholder="Buscar evento..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-8 pr-4 py-2 text-sm rounded-sm border outline-none transition-colors sm:w-52 w-full"
      />
    </div>
  );
}