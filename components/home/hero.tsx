"use client";

import { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "./hero.css";
import { RiCoupon2Line } from "react-icons/ri";
import Button from "../Button";
import { Publication } from "@/types/publication";
import { getPublicationsApi } from "@/services/publicationService";
import { parseAddress } from "@/utils/parseAddress";
import { useRouter } from "next/navigation";

interface Slide {
  id: number;
  tag: string;
  title: string;
  description: string;
  date: string;
  location: string;
  image: string;
  href?: string;
}

const DELAY = 5500;

const formatDateWithTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

export default function HeroCarousel() {
  const swiperRef = useRef<SwiperType | null>(null);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const [eventHero, setEventHero] = useState<Publication[]>([]);

  const router = useRouter();

  const goTo = (i: number) => {
    swiperRef.current?.slideTo(i);
  };

  async function getEventHero() {
    try {
      const response = await getPublicationsApi();
      const publications = Array.isArray(response)
        ? response
        : Array.isArray(response)
          ? response
          : [];

      setEventHero(publications.slice(0, 3));
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
      setEventHero([]);
    }
  }

  useEffect(() => {
    getEventHero();
  }, []);

  return (
    <section className="et-hero">
        <Swiper
          className="et-swiper"
          modules={[Autoplay, EffectFade]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          autoplay={{ delay: DELAY, disableOnInteraction: false }}
          speed={400}
          onSwiper={(s) => (swiperRef.current = s)}
          onSlideChange={(s) => {
            setActive(s.activeIndex);
            setProgress(0);
          }}
          onAutoplayTimeLeft={(_s, _time, ratio) => {
            setProgress((1 - ratio) * 100);
          }}
        >
          {eventHero && eventHero.length > 0 && eventHero.map((slide) => (
            <SwiperSlide key={slide.id}>
              <div
                className="et-bg"
                style={{ backgroundImage: `url(${slide.image})` }}
              />

              <div className="et-overlay" />

              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  padding: "clamp(32px, 6vw, 72px)",
                  paddingBottom: "clamp(72px, 10vw, 110px)",
                }}
              >

                <div className="et-tag" style={{ marginBottom: 16 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "#60A5FA",
                      borderBottom: "1.5px solid #3B82F6",
                      paddingBottom: 2,
                    }}
                  >
                    {slide.type}
                  </span>
                </div>

                <h1
                  className="et-title"
                  style={{
                    fontSize: "clamp(2rem, 3.7vw, 4rem)",
                    fontWeight: 800,
                    color: "#fff",
                    lineHeight: 1.08,
                    letterSpacing: "-0.025em",
                    margin: "0 0 12px",
                    maxWidth: 600,
                  }}
                >
                  {slide.name}
                </h1>

                <p
                  className="et-desc line-clamp-4"
                  style={{
                    fontSize: "clamp(0.875rem, 1.5vw, 1rem)",
                    color: "#fff",
                    lineHeight: 1.65,
                    margin: "0 0 20px",
                    maxWidth: 420,
                    maxHeight: 200,
                  }}
                >
                  {slide.description}
                </p>

                <div
                  className="et-meta"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 28,
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{ fontSize: 13, color: "#fff" }}>
                    {typeof slide.date === 'string' ? formatDateWithTime(slide.date) : formatDateWithTime(new Date(slide.date).toLocaleDateString())}
                  </span>
                  <span
                    style={{
                      width: 3,
                      height: 3,
                      borderRadius: "50%",
                      background: "#fff",
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: 13, color: "#fff" }}>
                    {`${parseAddress(slide.local).city}, ${parseAddress(slide.local).country}`}
                  </span>
                </div>

                <div className="et-cta">
                  <Button 
                    className="et-buy-btn max-w-50" 
                     onClick={() => {
                      router.push(`/home/${slide.id}`)
                    }}  
                  >
                    <RiCoupon2Line/>
                    Comprar ingresso
                  </Button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <nav className="et-nav" aria-label="Navegação do carrosel">
          {eventHero && eventHero.length > 0 && eventHero.map((_, i) => (
            <button
              key={i}
              className={`et-dot ${i === active ? "active" : ""}`}
              onClick={() => goTo(i)}
              aria-label={`Ir para slide ${i + 1}`}
            >
              {i === active && (
                <span
                  className="et-dot-fill"
                  style={{ width: `${progress}%`, transition: "width 50ms linear" }}
                />
              )}
            </button>
          ))}
        </nav>
      </section>
  );
}