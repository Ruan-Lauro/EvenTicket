"use client";

import EventsCarousel from "@/components/event/eventCarousel";
import EventSearch from "@/components/event/eventSearch";
import ShowEvent from "@/components/event/showEvent";
import GenreFilter from "@/components/genreFilter";
import HeroCaroseul from "@/components/home/hero";
import MainPage from "@/components/main";
import Pagination from "@/components/pagination";
import Skeleton from "@/components/skeleton";

import { Publication } from "@/types/publication";
import {
  getPublicationCategoriesApi,
  searchPublicationsApi,
} from "@/services/publicationService";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { parseAddress } from "@/utils/parseAddress";

function Home() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [genderPrimary, setGenderPrimary] = useState<string | null>(null);
  const [listEventGenderPrimary, setlistEventGenderPrimary] = useState<Publication[]>([]);

  const searchParams = useSearchParams();
  const router = useRouter();

  const page = Number(searchParams.get("page")) || 1;

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    searchParams.get("genres")?.split(",").filter(Boolean) || []
  );

  const [showGenreMenu, setShowGenreMenu] = useState(false);
  const genreRef = useRef<HTMLDivElement>(null);

  const [listGender, setListGender] = useState<string[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);  

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        genreRef.current &&
        !genreRef.current.contains(e.target as Node)
      ) {
        setShowGenreMenu(false);
      }
    };

    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, []);

  const fetchPublications = useCallback(async () => {
    setLoading(true);

    try {
      const data = await searchPublicationsApi({
        search: debouncedSearch.trim() || undefined,

        gender: selectedGenres[0] || undefined,

        page,
        total: 12,
      });

      if (Array.isArray(data)) {
        setPublications(data);
        setTotalPages(1);
        return;
      }

      setPublications(data.data ?? []);
      setGenderPrimary(data.data[0].type ?? null);
      setTotalPages(
        data.totalPages ??
          data.pagination?.totalPages ??
          1
      );
    } catch (error) {
      console.error("Erro ao buscar publicações:", error);

      setPublications([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, selectedGenres]);

  function updateQuery(
    params: Record<string, string | null>
  ) {
    const currentParams = new URLSearchParams(
      searchParams.toString()
    );

    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === "") {
        currentParams.delete(key);
      } else {
        currentParams.set(key, value);
      }
    });

    router.push(
      `/home?${currentParams.toString()}`
    );
  }

  function toggleGenre(genre: string) {
    const newGenres = selectedGenres.includes(genre)
      ? selectedGenres.filter((g) => g !== genre)
      : [genre];

    setSelectedGenres(newGenres);

    updateQuery({
      genres:
        newGenres.length > 0
          ? newGenres.join(",")
          : null,
      page: "1",
    });
  }

  async function getGender() {
    try {
      const data = await getPublicationCategoriesApi();
      const categories =
        data.categories ??
        data.genders ??
        data ??
        [];

      if (Array.isArray(categories)) {
        setListGender(categories);
      }
    } catch (error) {
      console.error(
        "Erro ao buscar categorias:",
        error
      );

      setListGender([]);
    }
  }

  useEffect(() => {
    fetchPublications();
  }, [fetchPublications]);

  useEffect(() => {
    getGender();
  }, []);

  useEffect(() => {
    const hasQuery =
      searchParams.has("search") ||
      searchParams.has("genres");

    if (!loading && hasQuery) {
      document
        .getElementById("event-search")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }
  }, [loading, searchParams]);

  useEffect(()=>{
    const fetchData = async () => {
      if(!genderPrimary) return;
      const data = await searchPublicationsApi({
        gender: genderPrimary,
        page: 1,
        total: 12,
      });
      setlistEventGenderPrimary(data.data);
    };
    fetchData();
  },[genderPrimary])

  

  return (
    <MainPage page={0}>
      <main className="flex flex-col items-center w-full pb-10">
        <HeroCaroseul  />

        <section className="w-full mt-15 px-1 sm:px-5">
          <div className="flex flex-col gap-5 mb-15">
            <h2 className="text-5xl font-bold text-center">
              Eventos
            </h2>

            <p className="text-center text-xl">
              Procure os melhores eventos{" "}
              <span className="text-blue">
                por aqui!
              </span>
            </p>
          </div>
          {listEventGenderPrimary && listEventGenderPrimary.length > 0 && (
              <section className="flex justify-center" ><EventsCarousel title={`Eventos de ${genderPrimary}`} events={listEventGenderPrimary} /></section>
          )}
        </section>

        <main className="w-full flex flex-col items-center px-4 py-12 mt-20" id="event-search">
          <p className="text-center text-4xl font-bold mb-15">
            Pesquise o evento
          </p>

          <div className="w-full  max-w-6xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pt-2">
            <div className="flex items-center gap-3 flex-wrap w-full">
              <EventSearch
                value={search}
                onChange={(value) => {
                  setSearch(value);
                  updateQuery({
                    page: "1",
                  });
                }}
              />

              <GenreFilter
                genres={listGender}
                selectedGenres={selectedGenres}
                isOpen={showGenreMenu}
                onToggle={() =>
                  setShowGenreMenu((value) => !value)
                }
                onToggleGenre={toggleGenre}
                onClear={() => {
                  setSelectedGenres([]);

                  updateQuery({
                    genres: null,
                    page: "1",
                  });
                }}
                genreRef={genreRef}
              />
            </div>
          </div>

          {loading ? (
            <div className="w-full max-w-6xl">
              <div className="grid lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-5">
                {Array.from({ length: 12 }).map((_, i) => (
                  <Skeleton key={i} />
                ))}
              </div>
            </div>
          ) : publications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-gray-500 font-medium">
                Nenhum evento encontrado.
              </p>

              <p className="text-sm text-gray-400 mt-1">
                Tente ajustar os filtros ou a busca.
              </p>
            </div>
          ) : (
            <div className="w-full  max-w-6xl grid lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-5">
              {publications && publications.length && publications.map((publication) => (
                <ShowEvent
                  key={publication.id}
                  title={publication.name}
                  city={parseAddress(publication.local).city ?? ""}
                  country={parseAddress(publication.local).country ?? ""}
                  gender={publication.type || "Amplo"}
                  img={
                    publication.image ??
                    "/images/event-placeholder.jpg"
                  }
                  onClick={() => {
                    router.push(`/home/${publication.id}`)
                  }}
                />
              ))}
            </div>
          )}

          {!loading && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              page="home"
            />
          )}
        </main>
      </main>
    </MainPage>
  );
}

export default function Page(){
   return(
    <Suspense fallback={<div>Carregando...</div>}>
      <Home/>
    </Suspense>
   );
}