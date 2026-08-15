"use client";

import { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "./hero.css";
import { RiCoupon2Line } from "react-icons/ri";
import Button from "../Button";

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

const slides: Slide[] = [
  {
    id: 1,
    tag: "Rock",
    title: "Pearl Jam",
    description:
      "Uma das maiores bandas de todos os tempos volta ao Brasil para uma noite que não se esquece.",
    date: "15 Set 2026",
    location: "Allianz Parque — São Paulo",
    image:
      "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1600&q=80",
    href: "#",
  },
  {
    id: 2,
    tag: "Eletrônico",
    title: "Ultra Brasil",
    description:
      "Os principais nomes da música eletrônica mundial em um festival de 3 dias.",
    date: "08 Nov 2026",
    location: "Sambódromo do Anhembi — São Paulo",
    image:
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1600&q=80",
    href: "#",
  },
  {
    id: 3,
    tag: "Cinema",
    title: "Festival de Brasília",
    description:
      "O mais tradicional festival de cinema brasileiro celebra 60 anos com programação inédita.",
    date: "22 Out 2026",
    location: "Cine Brasília — Brasília",
    image:
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600&q=80",
    href: "#",
  },
];

const DELAY = 5500;

export default function HeroCarousel() {
  const swiperRef = useRef<SwiperType | null>(null);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);

  const goTo = (i: number) => {
    swiperRef.current?.slideTo(i);
  };

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
          {slides.map((slide) => (
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
                    {slide.tag}
                  </span>
                </div>

                <h1
                  className="et-title"
                  style={{
                    fontSize: "clamp(2.2rem, 5.5vw, 4rem)",
                    fontWeight: 800,
                    color: "#fff",
                    lineHeight: 1.08,
                    letterSpacing: "-0.025em",
                    margin: "0 0 12px",
                    maxWidth: 600,
                  }}
                >
                  {slide.title}
                </h1>

                <p
                  className="et-desc"
                  style={{
                    fontSize: "clamp(0.875rem, 1.5vw, 1rem)",
                    color: "#fff",
                    lineHeight: 1.65,
                    margin: "0 0 20px",
                    maxWidth: 420,
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
                    {slide.date}
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
                    {slide.location}
                  </span>
                </div>

                <div className="et-cta">
                  <Button className="et-buy-btn max-w-50" >
                    <RiCoupon2Line/>
                    Comprar ingresso
                  </Button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <nav className="et-nav" aria-label="Navegação do carrosel">
          {slides.map((_, i) => (
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