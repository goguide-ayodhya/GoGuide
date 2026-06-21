"use client";

import { X, QrCode } from "lucide-react";

interface ReviewQRModalProps {
  token?: string;
  qrUrl?: string | null;
  onClose: () => void;
}

export function ReviewQRModal({ token, qrUrl, onClose }: ReviewQRModalProps) {
  const clientOrigin = typeof window !== "undefined" ? window.location.origin : "";
  const reviewUrl = qrUrl || (token ? `${clientOrigin}/review/${token}` : clientOrigin);
  const qrSrc = qrUrl
    ? qrUrl
    : `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(reviewUrl)}`;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-3xl shadow-2xl border border-border max-w-sm w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <QrCode className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground text-base">Leave a Review</h2>
              <p className="text-xs text-muted-foreground">Scan to open the review page</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center gap-4">
          <div className="w-64 h-64 rounded-2xl overflow-hidden border-2 border-border bg-white flex items-center justify-center">
            <img src={qrSrc} alt="Review QR" className="w-full h-full object-contain" />
          </div>
          <a href={reviewUrl} target="_blank" rel="noreferrer" className="text-sm text-primary underline">Open review page</a>
        </div>
      </div>
    </div>
  );
}
