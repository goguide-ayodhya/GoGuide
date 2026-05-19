"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { getCroppedImg, type PixelCrop } from "@/lib/cropImage";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import TouristLoader from "@/components/common/TouristLoader";
import { ZoomIn, ZoomOut } from "lucide-react";

interface ImageCropModalProps {
  imageSrc: string | null;
  open: boolean;
  onClose: () => void;
  onCropComplete: (file: File, previewUrl: string) => void;
  outputFileName?: string;
}

export function ImageCropModal({
  imageSrc,
  open,
  onClose,
  onCropComplete,
  outputFileName = "profile.jpg",
}: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelCrop | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const onCropCompleteCallback = useCallback(
    (_: unknown, croppedPixels: PixelCrop) => {
      setCroppedAreaPixels(croppedPixels);
    },
    []
  );

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setIsSaving(true);
    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const file = new File([blob], outputFileName, { type: "image/jpeg" });
      const previewUrl = URL.createObjectURL(blob);
      onCropComplete(file, previewUrl);
      onClose();
    } catch (err) {
      console.error("Crop failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm sm:max-w-md w-full p-0 overflow-hidden rounded-2xl">
        <DialogHeader className="px-5 pt-5 pb-2">
          <DialogTitle className="text-base font-semibold text-foreground">
            Adjust Profile Photo
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Drag to reposition · Pinch or scroll to zoom
          </p>
        </DialogHeader>

        {/* Crop area */}
        <div className="relative w-full bg-black" style={{ height: "340px" }}>
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropCompleteCallback}
              style={{
                containerStyle: { borderRadius: "0" },
                cropAreaStyle: {
                  border: "3px solid white",
                  boxShadow: "0 0 0 9999px rgba(0,0,0,0.65)",
                },
              }}
            />
          )}
        </div>

        {/* Zoom Slider */}
        <div className="flex items-center gap-3 px-5 pt-3 pb-1">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(1, +(z - 0.1).toFixed(1)))}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-black h-1 rounded-full cursor-pointer"
            aria-label="Zoom"
          />
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(3, +(z + 0.1).toFixed(1)))}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-5 pb-5 pt-3">
          <Button
            variant="outline"
            className="flex-1 rounded-full"
            onClick={handleClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 rounded-full bg-black hover:bg-black/85 text-white"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <TouristLoader inline size={18} text="Saving..." />
            ) : (
              "Save Photo"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
