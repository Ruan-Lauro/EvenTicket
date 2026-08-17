import { CameraOff, ScanLine } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export default function QRScanner({ onDetect }: { onDetect: (code: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const [camError, setCamError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const detectedRef = useRef(false);

  const tick = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    import("jsqr").then(({ default: jsQR }) => {
      if (detectedRef.current) return;
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });

      if (code?.data) {
        detectedRef.current = true;
        console.log("QR detectado (raw):", code.data);
        const raw = code.data;
        const match = raw.match(/\/tickets\/([^/?#]+)/);
        const ticketCode = match ? match[1] : raw;
        console.log("Código extraído:", ticketCode);
        onDetect(ticketCode);
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    });
  }, [onDetect]);

  useEffect(() => {
    detectedRef.current = false;
    let cancelled = false;

    navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "environment" }, audio: false })
        .then((stream) => {
        if (cancelled) {
            stream.getTracks().forEach((t) => t.stop());
            return;
        }

        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) return;

        video.srcObject = stream;

        video.onloadedmetadata = () => {
            if (cancelled) return;
            video
            .play()
            .then(() => {
                if (cancelled) return;
                setScanning(true);
                rafRef.current = requestAnimationFrame(tick);
            })
            .catch(() => {
            });
        };
        })
        .catch(() => {
        if (!cancelled)
            setCamError("Permissão de câmera negada ou câmera não disponível.");
        });

    return () => {
        cancelled = true;
        cancelAnimationFrame(rafRef.current);
        streamRef.current?.getTracks().forEach((t) => t.stop());
        if (videoRef.current) {
        videoRef.current.srcObject = null;
        }
    };
  }, [tick]);

  if (camError) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
        <CameraOff size={40} className="text-gray-400" />
        <p className="text-gray-500 text-sm font-medium">{camError}</p>
        <p className="text-xs text-gray-400">Use a digitação manual para continuar.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-sm mx-auto rounded-2xl overflow-hidden bg-black aspect-square">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        muted
        playsInline
      />
      <canvas ref={canvasRef} className="hidden" />

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-48 h-48">
          {["top-left", "top-right", "bottom-left", "bottom-right"].map((pos) => (
            <span
              key={pos}
              className={`absolute w-8 h-8 border-[#1570EF] border-[3px] rounded-sm
                ${pos === "top-left" ? "top-0 left-0 border-r-0 border-b-0" : ""}
                ${pos === "top-right" ? "top-0 right-0 border-l-0 border-b-0" : ""}
                ${pos === "bottom-left" ? "bottom-0 left-0 border-r-0 border-t-0" : ""}
                ${pos === "bottom-right" ? "bottom-0 right-0 border-l-0 border-t-0" : ""}
              `}
            />
          ))}
          <div className="absolute left-1 right-1 top-0 h-0.5 bg-[#1570EF] opacity-80 animate-scan-line" />
        </div>
      </div>

      {scanning && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center">
          <span className="bg-black/60 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1.5">
            <ScanLine size={12} className="animate-pulse" />
            Aponte para o QR Code do ingresso
          </span>
        </div>
      )}
    </div>
  );
}