import Link from "next/link";

type Props = {
  currentPage: number;
  totalPages: number;
  page: string;
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function Pagination({
  currentPage,
  totalPages,
  page,
  searchParams = {},
}: Props) {
  if (totalPages <= 1) {
    return null;
  }

  function getPageUrl(pageNumber: number) {
    const params = new URLSearchParams();

    Object.entries(searchParams).forEach(([key, value]) => {
      if (typeof value === "string") {
        params.set(key, value);
      }

      if (Array.isArray(value)) {
        params.set(key, value.join(","));
      }
    });

    params.set("page", pageNumber.toString());

    return `/${page}?${params.toString()}`;
  }

  const pages: (number | "...")[] = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);

    if (currentPage > 4) {
      pages.push("...");
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 3) {
      pages.push("...");
    }

    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-8 text-black">

      {currentPage > 1 && (
        <Link
          href={getPageUrl(currentPage - 1)}
          className="px-4 py-2 border rounded-sm hover:text-white hover:bg-blue transition-colors duration-300"
        >
          Anterior
        </Link>
      )}

      {pages.map((pageNumber, index) => {
        if (pageNumber === "...") {
          return (
            <span
              key={`dots-${index}`}
              className="px-3 py-2"
            >
              ...
            </span>
          );
        }

        return (
          <Link
            key={pageNumber}
            href={getPageUrl(pageNumber)}
            className={`px-4 py-2 border rounded-sm transition-colors duration-300 ${
              currentPage === pageNumber
                ? "bg-blue text-white border-blue"
                : "hover:text-white hover:bg-blue"
            }`}
          >
            {pageNumber}
          </Link>
        );
      })}

      {currentPage < totalPages && (
        <Link
          href={getPageUrl(currentPage + 1)}
          className="px-4 py-2 border rounded-sm hover:text-white hover:bg-blue transition-colors duration-300"
        >
          Próxima
        </Link>
      )}

    </div>
  );
}