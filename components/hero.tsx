import { StaticImageData } from "next/image";

export default function Hero(
  {
    text,
    keyword,
    img
  }:{
    text: string;
    keyword: string;
    img: StaticImageData
  }
) {
  return (
    <section
      className="relative w-full h-64 sm:h-80 md:h-96 lg:h-100 mb-10 bg-cover bg-center bg-fixed overflow-hidden"
      style={{ backgroundImage: `url(${img.src})` }}
    >
      <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/70 to-black/80" />

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 sm:gap-3 px-4">
        <h1 className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-white text-center text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-wide">
          <span
            className="inline-block animate-fade-slide-left opacity-0"
            style={{ animationFillMode: "forwards", animationDelay: "0ms" }}
          >
            {text}
          </span>
          <span
            className="inline-block text-blue-400 font-semibold animate-fade-slide-right opacity-0"
            style={{ animationFillMode: "forwards", animationDelay: "180ms" }}
          >
            {keyword}
          </span>
        </h1>

        <div
          className="h-px bg-blue-400/50 animate-expand-line opacity-0"
          style={{ animationFillMode: "forwards", animationDelay: "420ms" }}
        />
      </div>

      <style>{`
        @keyframes fadeSlideLeft {
          from { opacity: 0; transform: translateX(-18px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeSlideRight {
          from { opacity: 0; transform: translateX(18px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes expandLine {
          from { opacity: 0; width: 0px; }
          to   { opacity: 1; width: 80px; }
        }
        @media (min-width: 640px) {
          @keyframes expandLine {
            from { opacity: 0; width: 0px; }
            to   { opacity: 1; width: 120px; }
          }
        }

        .animate-fade-slide-left  { animation: fadeSlideLeft  0.55s cubic-bezier(0.22,1,0.36,1) both; }
        .animate-fade-slide-right { animation: fadeSlideRight 0.55s cubic-bezier(0.22,1,0.36,1) both; }
        .animate-expand-line      { animation: expandLine     0.5s  cubic-bezier(0.22,1,0.36,1) both; }
      `}</style>
    </section>
  );
}