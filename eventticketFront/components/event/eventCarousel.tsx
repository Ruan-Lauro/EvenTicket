"use client";

import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "./eventCarousel.css";
import ShowEvent from "./showEvent";

import { Publication } from "@/types/publication";
import { parseAddress } from "@/utils/parseAddress";
import { useRouter } from "next/navigation";

interface EventsCarouselProps {
  title: string;
  seeAllHref?: string;
  events?: Publication[];
}

export default function EventsCarousel({
  title = "Eventos",
  seeAllHref = "#",
  events = [],
}: EventsCarouselProps) {
  const swiperRef = useRef<SwiperType | null>(null);
  const prevId = `prev-${title.slice(0, 8).replace(/\s/g, "")}`;
  const nextId = `next-${title.slice(0, 8).replace(/\s/g, "")}`;
  const router = useRouter();

  return (
    <section className="ec-wrap  max-w-6xl">
        <div className="ec-header">
            <h2 className="ec-title">{title}</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <nav className="ec-nav" aria-label="Navegação de eventos">
                <button
                className="ec-btn"
                id={prevId}
                aria-label="Anterior"
                >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <polyline points="15 18 9 12 15 6" />
                </svg>
                </button>
                <button
                className="ec-btn"
                id={nextId}
                aria-label="Próximo"
                >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <polyline points="9 18 15 12 9 6" />
                </svg>
                </button>
            </nav>
            </div>
        </div>

        <div className="ec-outer">
            <Swiper
            className="ec-swiper"
            modules={[Navigation]}
            navigation={{
                prevEl: `#${prevId}`,
                nextEl: `#${nextId}`,
            }}
            slidesPerView={1.2}
            spaceBetween={14}
            breakpoints={{
                706: { slidesPerView: 2.2, spaceBetween: 14 },
                961: { slidesPerView: 3,   spaceBetween: 16 },
                1024: { slidesPerView: 3,  spaceBetween: 20 },
            }}
            onSwiper={(s) => (swiperRef.current = s)}
            >
            {events.map((event) => (
                <SwiperSlide key={event.id}>
                    <ShowEvent city={parseAddress(event.local).city}  country={parseAddress(event.local).country} gender={event.type} img={event.image!} onClick={() => router.push(`/home/${event.id}`)} title={event.name}/>
                </SwiperSlide>
            ))}
            </Swiper>
        </div>
    </section>
  );
}