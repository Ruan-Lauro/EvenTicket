import { RefObject } from "react";

type GenreFilterProps = {
  genres: string[];
  selectedGenres: string[];
  isOpen: boolean;
  onToggle: () => void;
  onToggleGenre: (genre: string) => void;
  onClear: () => void;
  genreRef: RefObject<HTMLDivElement | null>;
};

export default function GenreFilter({
  genres,
  selectedGenres,
  isOpen,
  onToggle,
  onToggleGenre,
  onClear,
  genreRef,
}: GenreFilterProps) {
  return (
    <div
      className="relative max-sm:w-full"
      ref={genreRef}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center justify-between gap-2 px-4 py-2 md:w-52 w-full text-sm rounded-sm border font-medium transition-colors"
      >
        <span>Gênero</span>

        {selectedGenres.length > 0 && (
          <span className="text-xs text-white rounded-full w-5 h-5 flex items-center justify-center font-bold bg-blue-600">
            {selectedGenres.length}
          </span>
        )}

        <span
          className="transition-transform"
          style={{
            transform: isOpen ? "rotate(180deg)" : "none",
          }}
        >
          ▾
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-60 right-0 top-full mt-2 bg-white border rounded-sm shadow-lg md:w-52 w-full max-h-72 overflow-y-auto">
          <div className="p-2">
            {selectedGenres.length > 0 && (
              <button
                type="button"
                onClick={onClear}
                className="w-full text-left px-3 py-1.5 text-xs rounded-lg mb-1 font-medium"
                style={{
                  color: "#2563EB",
                  backgroundColor: "#EFF6FF",
                }}
              >
                Limpar seleção
              </button>
            )}

            {genres.map((genre) => (
              <label
                key={genre}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedGenres.includes(genre)}
                  onChange={() => onToggleGenre(genre)}
                  className="accent-blue-600 w-4 h-4"
                />

                <span
                  className="text-sm"
                  style={{ color: "#374151" }}
                >
                  {genre}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}