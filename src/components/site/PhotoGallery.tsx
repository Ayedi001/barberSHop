import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import type { PublicGalleryPhoto } from "@/lib/public.functions";

export function PhotoGallery({ photos }: { photos: PublicGalleryPhoto[] }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (!photos.length) return null;

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
        {photos.map((p, idx) => (
          <div
            key={p.id || idx}
            onClick={() => setSelectedIndex(idx)}
            className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-muted cursor-pointer shadow-soft hover:shadow-card transition-all"
          >
            <img
              src={p.image_url}
              alt={p.caption || "Coiffure barber"}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="grid size-10 place-items-center rounded-full bg-black/60 text-white backdrop-blur">
                <ZoomIn className="size-5 text-amber-400" />
              </span>
            </div>
            {p.caption && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2.5">
                <p className="text-xs font-medium text-white truncate">{p.caption}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      <Dialog
        open={selectedIndex !== null}
        onOpenChange={(open) => !open && setSelectedIndex(null)}
      >
        <DialogContent className="max-w-4xl border-0 bg-black/95 p-0 text-white">
          <DialogTitle className="sr-only">Agrandissement photo</DialogTitle>
          {selectedIndex !== null && (
            <div className="relative flex flex-col items-center justify-center p-4">
              <div className="relative max-h-[80vh] w-full flex items-center justify-center">
                <img
                  src={photos[selectedIndex]?.image_url}
                  alt={photos[selectedIndex]?.caption || ""}
                  className="max-h-[75vh] max-w-full rounded-lg object-contain"
                />

                {/* Nav buttons */}
                {photos.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedIndex((prev) =>
                          prev !== null ? (prev > 0 ? prev - 1 : photos.length - 1) : 0,
                        )
                      }
                      className="absolute left-2 top-1/2 -translate-y-1/2 grid size-10 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                      aria-label="Photo précédente"
                    >
                      <ChevronLeft className="size-6" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedIndex((prev) =>
                          prev !== null ? (prev < photos.length - 1 ? prev + 1 : 0) : 0,
                        )
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 grid size-10 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                      aria-label="Photo suivante"
                    >
                      <ChevronRight className="size-6" />
                    </button>
                  </>
                )}
              </div>

              {photos[selectedIndex]?.caption && (
                <p className="mt-3 text-center text-sm font-medium text-white/90">
                  {photos[selectedIndex]?.caption}
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
