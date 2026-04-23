"use client";

import { useState, useEffect } from "react";
import { createPackage, updatePackage, createPackageForm, updatePackageForm } from "@/lib/api/tourPackages";

type Props = {
  existing?: any;
  onSuccess?: () => void;
};

const emptyForm = () => ({
  title: "",
  description: "",
  city: "",
  state: "",
  price: "",
  basePrice: "",
  cabPrice: "",
  guidePrice: "",
  duration: "",
  durationType: "HOURS",
  startTime: "",
  maxGroupSize: "",
  includesCab: false,
  includesGuide: false,
  images: [] as string[],
  itinerary: [] as any[],
});

function normalizeExisting(e: any) {
  if (!e) return emptyForm();
  return {
    ...emptyForm(),
    title: e.title ?? "",
    description: e.description ?? "",
    city: e.location?.city ?? e.city ?? "",
    state: e.location?.state ?? e.state ?? "",
    price: e.price ?? "",
    basePrice: e.priceBreakdown?.basePrice ?? "",
    cabPrice: e.priceBreakdown?.cabPrice ?? "",
    guidePrice: e.priceBreakdown?.guidePrice ?? "",
    duration: e.duration ?? "",
    durationType: e.durationType ?? "HOURS",
    startTime: e.startTime ?? "",
    maxGroupSize: e.maxGroupSize ?? "",
    includesCab: !!e.includesCab,
    includesGuide: !!e.includesGuide,
    images: Array.isArray(e.images)
      ? e.images
      : typeof e.images === "string"
      ? e.images.split(",").map((s: string) => s.trim()).filter(Boolean)
      : [],
    itinerary: Array.isArray(e.itinerary)
      ? e.itinerary.map((s: any, i: number) => ({
          title: s.title ?? "",
          description: s.description ?? "",
          location: typeof s.location === "string" ? s.location : s.location?.city ?? "",
          order: s.order ?? i + 1,
        }))
      : [],
  };
}

export default function AdminTourPackageForm({ existing, onSuccess }: Props) {
  const [form, setForm] = useState(() => normalizeExisting(existing));

  useEffect(() => {
    setForm(normalizeExisting(existing));
  }, [existing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as any;
    setForm((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ------------------ ITINERARY ------------------
  const addStop = () => {
    setForm((prev: any) => ({
      ...prev,
      itinerary: [
        ...prev.itinerary,
        { title: "", description: "", location: "", order: prev.itinerary.length + 1 },
      ],
    }));
  };

  const updateStop = (index: number, field: string, value: string) => {
    const idx = Number(index);
    const updated = [...(form.itinerary || [])];
    if (!updated[idx]) return;
    updated[idx] = { ...updated[idx], [field]: value };
    setForm({ ...form, itinerary: updated });
  };

  const removeStop = (index: number) => {
    const updated = (form.itinerary || []).filter((_: any, i: number) => i !== index);
    setForm({ ...form, itinerary: updated });
  };

  // ------------------ IMAGE ------------------
  const [files, setFiles] = useState<File[]>([]);
  const handleImages = (e: { target: { value: string; }; }) => {
    const urls = e.target.value.split(",").map((i: string) => i.trim()).filter(Boolean);
    setForm((prev: any) => ({ ...prev, images: urls }));
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    setFiles(list ? Array.from(list) : []);
  };

  // ------------------ SUBMIT ------------------
  const handleSubmit = async () => {
    const payload = {
      title: form.title,
      description: form.description,
      location: {
        city: form.city,
        state: form.state,
      },
      price: Number(form.price),
      priceBreakdown: {
        basePrice: Number(form.basePrice),
        cabPrice: Number(form.cabPrice),
        guidePrice: Number(form.guidePrice),
      },
      duration: Number(form.duration),
      durationType: form.durationType,
      startTime: form.startTime,
      maxGroupSize: Number(form.maxGroupSize),
      includesCab: form.includesCab,
      includesGuide: form.includesGuide,
      images: form.images,
      itinerary: form.itinerary.map((s: { title: any; description: any; location: any; order: any; }) => ({
        title: s.title,
        description: s.description,
        location: typeof s.location === "string" ? { city: s.location } : s.location,
        order: s.order,
      })),
    };

    try {
      // If files selected, send as FormData so backend can accept uploads
      if (files.length > 0) {
        const formData = new FormData();
        formData.append("title", payload.title);
        formData.append("description", payload.description);
        formData.append("location", JSON.stringify(payload.location));
        formData.append("price", String(payload.price));
        formData.append("priceBreakdown", JSON.stringify(payload.priceBreakdown));
        formData.append("duration", String(payload.duration));
        formData.append("durationType", payload.durationType);
        formData.append("startTime", payload.startTime || "");
        formData.append("maxGroupSize", String(payload.maxGroupSize));
        formData.append("includesCab", String(payload.includesCab));
        formData.append("includesGuide", String(payload.includesGuide));
        formData.append("itinerary", JSON.stringify(payload.itinerary));
        // include any image URLs already entered
        if (payload.images && payload.images.length) {
          formData.append("images", JSON.stringify(payload.images));
        }
        files.forEach((f) => formData.append("images", f));

        if (existing) {
          const id = existing._id || existing.id;
          await updatePackageForm(id, formData);
        } else {
          await createPackageForm(formData);
        }
      } else {
        if (existing) {
          const id = existing._id || existing.id;
          await updatePackage(id, payload);
        } else {
          await createPackage(payload);
        }
      }

      alert("Saved successfully");
      onSuccess?.();
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Error saving package");
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow space-y-6">
      <h2 className="text-xl font-bold">Tour Package</h2>

      {/* BASIC */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-muted-foreground mb-1">Title</label>
          <input name="title" placeholder="Title" value={form.title ?? ""} onChange={handleChange} className="input w-full" />
        </div>
        <div>
          <label className="block text-sm text-muted-foreground mb-1">City</label>
          <input name="city" placeholder="City" value={form.city ?? ""} onChange={handleChange} className="input w-full" />
        </div>
      </div>

      <div>
        <label className="block text-sm text-muted-foreground mb-1">Description</label>
        <textarea name="description" placeholder="Description" value={form.description ?? ""} onChange={handleChange} className="input w-full" />
      </div>

      {/* LOCATION */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-muted-foreground mb-1">State</label>
          <input name="state" placeholder="State" value={form.state ?? ""} onChange={handleChange} className="input w-full" />
        </div>
        <div>
          <label className="block text-sm text-muted-foreground mb-1">Max Group Size</label>
          <input name="maxGroupSize" placeholder="Max Group Size" value={form.maxGroupSize ?? ""} onChange={handleChange} className="input w-full" />
        </div>
      </div>

      {/* PRICE */}
      <div className="grid grid-cols-4 gap-4">
        <div>
          <label className="block text-sm text-muted-foreground mb-1">Total Price</label>
          <input name="price" placeholder="Total Price" value={form.price ?? ""} onChange={handleChange} className="input w-full" />
        </div>
        <div>
          <label className="block text-sm text-muted-foreground mb-1">Base Price</label>
          <input name="basePrice" placeholder="Base Price" value={form.basePrice ?? ""} onChange={handleChange} className="input w-full" />
        </div>
        <div>
          <label className="block text-sm text-muted-foreground mb-1">Cab Price</label>
          <input name="cabPrice" placeholder="Cab Price" value={form.cabPrice ?? ""} onChange={handleChange} className="input w-full" />
        </div>
        <div>
          <label className="block text-sm text-muted-foreground mb-1">Guide Price</label>
          <input name="guidePrice" placeholder="Guide Price" value={form.guidePrice ?? ""} onChange={handleChange} className="input w-full" />
        </div>
      </div>

      {/* DETAILS */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-muted-foreground mb-1">Duration</label>
          <input name="duration" placeholder="Duration" value={form.duration ?? ""} onChange={handleChange} className="input w-full" />
        </div>

        <div>
          <label className="block text-sm text-muted-foreground mb-1">Duration Type</label>
          <select name="durationType" value={form.durationType ?? "HOURS"} onChange={handleChange} className="input w-full">
            <option value="HOURS">Hours</option>
            <option value="DAYS">Days</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-muted-foreground mb-1">Start Time</label>
          <input name="startTime" placeholder="Start Time (15:00)" value={form.startTime ?? ""} onChange={handleChange} className="input w-full" />
        </div>
      </div>

      {/* TOGGLES */}
      <div className="flex gap-6 items-center">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="includesCab" checked={!!form.includesCab} onChange={handleChange} />
          <span>Includes Cab</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="includesGuide" checked={!!form.includesGuide} onChange={handleChange} />
          <span>Includes Guide</span>
        </label>
      </div>

      {/* IMAGES */}
      <div>
        <label className="block text-sm text-muted-foreground mb-1">Image URLs</label>
        <textarea placeholder="Image URLs (comma separated)" value={(form.images || []).join(", ")} onChange={handleImages} className="input w-full" />
        <input type="file" multiple onChange={handleFileChange} className="input mt-2" />

        <div className="flex gap-2 mt-3 flex-wrap">
          {(form.images || []).map((src: string, idx: number) => (
            <div key={idx} className="w-20 h-20 bg-muted/10 rounded overflow-hidden flex items-center justify-center text-xs text-muted-foreground">
              {src.startsWith("http") ? <img src={src} alt={`img-${idx}`} className="w-full h-full object-cover" /> : <span className="px-1 break-words">{src}</span>}
            </div>
          ))}

          {files.map((f, i) => (
            <div key={`f-${i}`} className="w-20 h-20 bg-muted/10 rounded flex items-center justify-center text-xs text-muted-foreground">
              {f.name}
            </div>
          ))}
        </div>
      </div>

      {/* ITINERARY */}
      <div>
        <h3 className="font-semibold mb-2">Itinerary</h3>

        {((form.itinerary || []) as any[]).map((stop, i: number) => (
          <div key={i} className="border p-3 mb-2 rounded">
            <input placeholder="Title" value={stop.title ?? ""} onChange={(e) => updateStop(i, "title", e.target.value)} className="input w-full mb-2" />
            <input placeholder="Location" value={stop.location ?? ""} onChange={(e) => updateStop(i, "location", e.target.value)} className="input w-full mb-2" />
            <textarea placeholder="Description" value={stop.description ?? ""} onChange={(e) => updateStop(i, "description", e.target.value)} className="input w-full mb-2" />

            <div className="flex justify-between">
              <button onClick={() => removeStop(i)} className="text-red-500">Remove</button>
              <span className="text-xs text-muted-foreground">Order: {stop.order}</span>
            </div>
          </div>
        ))}

        <button onClick={addStop} className="bg-blue-500 text-white px-3 py-1 rounded">
          + Add Stop
        </button>
      </div>

      {/* SUBMIT */}
      <div className="pt-4">
        <button onClick={handleSubmit} className="bg-black text-white px-4 py-2 rounded">
          Save Package
        </button>
      </div>
    </div>
  );
}