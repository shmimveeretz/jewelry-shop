import { useState } from "react";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { sizedImage } from "../../../utils/format";

function Gallery({ images, name }) {
  const [index, setIndex] = useState(0);
  const hasImages = images.length > 0;
  const current = hasImages ? images[Math.min(index, images.length - 1)] : null;

  const step = (delta) =>
    setIndex((prev) => (prev + delta + images.length) % images.length);

  return (
    <div>
      <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm">
        {current ? (
          <img
            src={sizedImage(current, 600)}
            alt={name}
            width="800"
            height="800"
            // The hero image is the largest contentful paint on this page, and
            // the edge function preloads this exact URL.
            loading="eager"
            fetchpriority="high"
            decoding="async"
            className="aspect-square h-auto w-full object-cover"
          />
        ) : (
          <div className="flex aspect-square w-full flex-col items-center justify-center gap-2 bg-cream text-gray-400">
            <ImageOff className="h-10 w-10" strokeWidth={1.5} />
            <span className="text-sm">התמונה תעלה בקרוב</span>
          </div>
        )}

        {images.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="התמונה הקודמת"
              className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-navy shadow-md transition hover:bg-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="התמונה הבאה"
              className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-navy shadow-md transition hover:bg-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </>
        ) : null}
      </div>

      {images.length > 1 ? (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((image, imageIndex) => (
            <button
              key={image}
              type="button"
              onClick={() => setIndex(imageIndex)}
              aria-label={`תמונה ${imageIndex + 1}`}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                imageIndex === index ? "border-gold" : "border-transparent"
              }`}
            >
              <img
                src={sizedImage(image, 70)}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default Gallery;
