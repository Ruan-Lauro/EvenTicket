type SelectedGenresProps = {
  genres: string[];
  onRemove: (genre: string) => void;
};

export default function SelectedGenres({
  genres,
  onRemove,
}: SelectedGenresProps) {
  if (genres.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-6xl flex gap-2 flex-wrap mb-4">
      {genres.map((genre) => (
        <span
          key={genre}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full text-white bg-blue-600"
        >
          {genre}

          <button
            type="button"
            onClick={() => onRemove(genre)}
            className="hover:opacity-75 leading-none"
            aria-label={`Remover filtro ${genre}`}
          >
            ✕
          </button>
        </span>
      ))}
    </div>
  );
}