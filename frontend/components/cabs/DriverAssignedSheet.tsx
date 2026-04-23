"use client";

import { X } from "lucide-react";

export default function DriverAssignedSheet({ driver, onClose }: { driver: any; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-t-2xl bg-white p-4 shadow-lg sm:rounded-2xl">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm text-slate-500">Driver assigned</div>
            <div className="text-lg font-semibold">{driver.name}</div>
            <div className="text-sm text-slate-600">{driver.vehicle} • {driver.plate}</div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-slate-50 p-3">
            <div className="text-xs text-slate-500">ETA</div>
            <div className="font-medium">{driver.eta}</div>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <div className="text-xs text-slate-500">Rating</div>
            <div className="font-medium">{driver.rating}</div>
          </div>
        </div>

        <div className="mt-4">
          <button onClick={onClose} className="w-full rounded-xl bg-indigo-600 text-white px-4 py-2">Close</button>
        </div>
      </div>
    </div>
  );
}
