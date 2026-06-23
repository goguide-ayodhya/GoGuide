"use client";

import { X, QrCode, Copy, Check } from "lucide-react";
import { useState } from "react";

interface PaymentQRModalProps {
  qrUrl: string;
  upiId?: string;
  merchantName?: string;
  onClose: () => void;
}

export function PaymentQRModal({ qrUrl, upiId, merchantName, onClose }: PaymentQRModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyUPI = () => {
    if (upiId) {
      navigator.clipboard.writeText(upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-3xl shadow-2xl border border-border max-w-sm w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <QrCode className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground text-base">Payment QR</h2>
              <p className="text-xs text-muted-foreground">Show to tourist for payment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* QR Image */}
        <div className="p-6 flex flex-col items-center gap-4">
          <div className="w-64 h-64 rounded-2xl overflow-hidden border-2 border-border bg-white flex items-center justify-center">
            {qrUrl ? (
              <img src={qrUrl} alt="Payment QR Code" className="w-full h-full object-contain" />
            ) : (
              <div className="text-center text-muted-foreground">
                <QrCode className="h-16 w-16 mx-auto mb-2 opacity-30" />
                <p className="text-xs">QR not available</p>
              </div>
            )}
          </div>

          {/* Merchant Information */}
          {merchantName && (
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Merchant Name</p>
              <p className="font-semibold text-foreground">{merchantName}</p>
            </div>
          )}

          {/* UPI ID */}
          {upiId && (
            <div className="w-full">
              <div className="flex items-center justify-between gap-2 p-3 bg-muted rounded-xl border border-border">
                <div className="text-left flex-1">
                  <p className="text-xs text-muted-foreground mb-1">UPI ID</p>
                  <p className="font-mono text-sm font-semibold text-foreground break-all">{upiId}</p>
                </div>
                <button
                  onClick={handleCopyUPI}
                  className="flex-shrink-0 p-2 hover:bg-muted-foreground/10 rounded-lg transition-colors"
                  title="Copy UPI ID"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>
          )}

          <p className="text-sm text-muted-foreground text-center">
            Ask the tourist to scan this QR code to make payment
          </p>
        </div>
      </div>
    </div>
  );
}
