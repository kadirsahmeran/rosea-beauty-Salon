import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

export default function MasonryGallery({ images }) {
  const [index, setIndex] = useState(-1);

  return (
    <>
      <div className="columns-2 gap-4 sm:columns-3">
        {images.map((image, i) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setIndex(i)}
            className="group relative mb-4 block w-full cursor-pointer break-inside-avoid overflow-hidden rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blush-400"
          >
            <img
              src={image.src}
              alt={image.alt}
              loading="lazy"
              className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-ink/0 transition-colors duration-300 group-hover:bg-ink/20" />
          </button>
        ))}
      </div>

      <Lightbox
        open={index >= 0}
        close={() => setIndex(-1)}
        index={index}
        slides={images.map((image) => ({ src: image.src, alt: image.alt }))}
      />
    </>
  );
}
