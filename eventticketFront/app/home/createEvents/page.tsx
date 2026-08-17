"use client";

import MainPage from "@/components/main";
import Breadcrumb from "@/components/breadcrumb";
import EventDetailModal from "@/components/event/eventDetailModal";
import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { TicketMasterEvent, TicketMasterResponse, Classification } from "@/types/ticketmaster";
import ShowEvent from "@/components/event/showEvent";
import Pagination from "@/components/pagination";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Hero from "@/components/hero";
import Skeleton from "@/components/skeleton";
import hero from "@/assets/hero.webp";
import EventSearch from "@/components/event/eventSearch";
import GenreFilter from "@/components/genreFilter";
import SelectedGenres from "@/components/selectedGenres";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

function CreateEvents() {

  const [events, setEvents] = useState<TicketMasterEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    searchParams.get("genres")?.split(",").filter(Boolean) || []
  );
  const [showGenreMenu, setShowGenreMenu] = useState(false);
  const genreRef = useRef<HTMLDivElement>(null);
  const {user} = useAuth();
  const [selectedEvent, setSelectedEvent] = useState<TicketMasterEvent | null>(null);
  const [listGender, setListGender] = useState<string[]|null>([]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (genreRef.current && !genreRef.current.contains(e.target as Node))
        setShowGenreMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(()=>{
    if(user && user.role !== "ORGANIZER") {
      toast.error("Você não tem acesso a essa página");
      return router.push("/home")
    }
  },[user])

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: "12",
      });

    if (debouncedSearch.trim()) {
      params.set("keyword", debouncedSearch.trim());
    }

      if (selectedGenres.length > 0) {
        params.set("genres", selectedGenres.join(","));
      }

      const response = await fetch(`/api/ticketmaster?${params}`);
      if (!response.ok) throw new Error();

      const data: TicketMasterResponse = await response.json();
      let list: TicketMasterEvent[] = data._embedded?.events ?? [];

      if (selectedGenres.length > 1) {
        list = list.filter((ev) =>
          selectedGenres.some(
            (g) =>
              ev.classifications?.[0]?.genre?.name
                ?.toLowerCase()
                .includes(g.toLowerCase())
          )
        );
      }

      setEvents(list);
      setTotalPages(data.page?.totalPages ?? 1);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, selectedGenres]);

  function updateQuery(params: Record<string, string | null>) {
    const currentParams = new URLSearchParams(searchParams.toString());

    Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === "") {
        currentParams.delete(key);
        } else {
        currentParams.set(key, value);
        }
    });

    router.push(`/home/createEvents?${currentParams.toString()}`);
  }

  function toggleGenre(genre: string) {
    const newGenres = selectedGenres.includes(genre)
    ? selectedGenres.filter((g) => g !== genre)
    : [...selectedGenres, genre];

    setSelectedGenres(newGenres);

    updateQuery({
    genres: newGenres.length > 0 ? newGenres.join(",") : null,
    page: "1",
  });
  }

  async function getGender(){
    const response = await fetch(`/api/ticketmaster/classifications`);
    if(!response.ok) return;
    const data = await response.json();
    
    const genders = Array.from(
      new Set(
        data.classifications?.map(
          (classification: Classification) => 
            classification.segment?.name || classification.type?.name
        ) ?? []
      )
    ).filter(Boolean) as string[];
    
    setListGender(genders);
  }

  useEffect(() => {
    fetchEvents();
    getGender();
  }, [fetchEvents]);


  return (
    <MainPage page={1}>
      <Hero img={hero} keyword="Evento" text="Crie seu" />

      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          userId={user?.id} 
        />
      )}

      <main className="w-full flex flex-col items-center px-4 pb-12">
        <div className="w-full max-w-6xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pt-2">
          <Breadcrumb />

          <div className="flex items-center gap-3 flex-wrap max-sm:w-full">
            <EventSearch
              value={search}
              onChange={setSearch}
            />

            <GenreFilter
              genres={listGender ?? []}
              selectedGenres={selectedGenres}
              isOpen={showGenreMenu}
              onToggle={() => setShowGenreMenu((value) => !value)}
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

        {selectedGenres.length > 0 && (
          <SelectedGenres
            genres={selectedGenres}
            onRemove={toggleGenre}
          />
        )}

        {loading ? (
          <div className="w-full max-w-6xl">
            <div className="grid lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-5">
              {Array.from({ length: 12 }).map((_, i) => (
               <Skeleton key={i} />
              ))}
            </div>
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-gray-500 font-medium">Nenhum evento encontrado.</p>
            <p className="text-sm text-gray-400 mt-1">Tente ajustar os filtros ou a busca.</p>
          </div>
        ) : (
          <div className="w-full max-w-6xl grid lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-5">
            {events.map((event) => (
              <ShowEvent title={event.name} city={event._embedded?.venues![0].city?.name!} country={event._embedded?.venues![0].country?.name!} gender={event.classifications?event.classifications[0].genre?.name!:"Amplo"} img={event.images![0].url} onClick={() => setSelectedEvent(event)} key={event.id} />
            ))}
          </div>
        )}

        {!loading && (
          <Pagination currentPage={page} totalPages={totalPages} page="home/createEvents" />
        )}
        
      </main>
    </MainPage>
  );
}

export default function Page(){
    return(
      <Suspense fallback={<div>Carregando...</div>}>
        <CreateEvents/>
      </Suspense>
    );
}
