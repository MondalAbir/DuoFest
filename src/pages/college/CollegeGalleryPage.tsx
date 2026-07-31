import { useMemo, useState } from "react";
import { Eye, Heart, Images, ImagePlus, UploadCloud } from "lucide-react";
import {
  collegeGalleryAlbums,
  collegeGalleryImages,
} from "@/data/college/gallery";
import { formatCompact, formatDate } from "@/utils/format";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function CollegeGalleryPage() {
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const albumImages = useMemo(() => {
    if (!selectedAlbum) return [];
    const album = collegeGalleryAlbums.find((a) => a.id === selectedAlbum);
    return collegeGalleryImages.filter((image) => image.eventName === album?.eventName);
  }, [selectedAlbum]);

  const activeImage = selectedImage
    ? collegeGalleryImages.find((image) => image.id === selectedImage)
    : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gallery"
        subtitle="Event photos and memories"
        actions={
          <Button className="gap-2">
            <ImagePlus className="h-4 w-4" />
            <span className="hidden sm:inline">Upload Photos</span>
          </Button>
        }
      />

      {selectedAlbum ? (
        <>
          <button
            onClick={() => setSelectedAlbum(null)}
            className="text-sm font-medium text-primary hover:text-primary/80"
          >
            ← Back to albums
          </button>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {albumImages.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-border bg-card p-10 text-center shadow-card">
                <Images className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm font-medium text-foreground">
                  No photos in this album yet
                </p>
              </div>
            ) : (
              albumImages.map((image) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImage(image.id)}
                  className={cn(
                    "group relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br text-white shadow-card",
                    image.gradient,
                  )}
                >
                  <span className="px-4 text-center text-sm font-semibold">
                    {image.label}
                  </span>
                  <span className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
                  <span className="absolute bottom-3 left-3 flex items-center gap-3 rounded-full bg-black/30 px-2.5 py-1 text-xs backdrop-blur">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      {formatCompact(image.views)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-3.5 w-3.5" />
                      {image.likes}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collegeGalleryAlbums.map((album) => (
            <button
              key={album.id}
              onClick={() => setSelectedAlbum(album.id)}
              className={cn(
                "group relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br text-white shadow-card",
                album.coverGradient,
              )}
            >
              <span className="px-4 text-center text-lg font-bold">
                {album.eventName}
              </span>
              <span className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
              <span className="absolute bottom-3 left-3 rounded-full bg-black/30 px-2.5 py-1 text-xs backdrop-blur">
                {album.imageCount} photos
              </span>
              <span className="absolute bottom-3 right-3 flex items-center gap-3 rounded-full bg-black/30 px-2.5 py-1 text-xs backdrop-blur">
                <span className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  {formatCompact(album.views)}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="h-3.5 w-3.5" />
                  {formatCompact(album.likes)}
                </span>
              </span>
            </button>
          ))}

          <button
            className="flex aspect-video flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
            onClick={() => {}}
          >
            <UploadCloud className="h-8 w-8" />
            <span className="text-sm font-medium">Create new album</span>
          </button>
        </div>
      )}

      <Dialog open={Boolean(activeImage)} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>{activeImage?.label}</DialogTitle>
          </DialogHeader>
          <div
            className={cn(
              "flex aspect-video items-center justify-center rounded-2xl bg-gradient-to-br text-white",
              activeImage?.gradient,
            )}
          >
            <span className="text-lg font-semibold">{activeImage?.label}</span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                {formatCompact(activeImage?.views ?? 0)} views
              </span>
              <span className="flex items-center gap-1.5">
                <Heart className="h-4 w-4" />
                {activeImage?.likes} likes
              </span>
              <span>{formatDate(activeImage?.uploadedAt ?? "")}</span>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <UploadCloud className="h-4 w-4" />
              Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
