"use client";

import { useState, useEffect } from "react";
import {
  createPackage,
  updatePackage,
  createPackageForm,
  updatePackageForm,
} from "@/lib/api/tourPackages";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  existing?: any;
  onSuccess?: () => void;
  onClose?: () => void;
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
  durationType: "hours",
  startTime: "",
  maxGroupSize: "",
  includesCab: false,
  includesGuide: false,
  images: [] as string[],
  mainImage: "",
  locations: [] as string[],
  type: "basic",
  discount: "",
});

function normalizeExisting(e: any) {
  if (!e) return emptyForm();
  return {
    ...emptyForm(),
    title: e.title ?? "",
    description: e.description ?? "",
    city: e.location ?? e.city ?? "",
    state: e.state ?? "",
    price: e.price ?? "",
    basePrice: e.basePrice ?? e.priceBreakdown?.basePrice ?? "",
    cabPrice: e.cabPrice ?? e.priceBreakdown?.cabPrice ?? "",
    guidePrice: e.guidePrice ?? e.priceBreakdown?.guidePrice ?? "",
    duration: e.duration ?? "",
    durationType: e.durationType ?? "hours",
    startTime: e.startTime ?? "",
    maxGroupSize: e.maxGroupSize ?? "",
    includesCab: !!e.includesCab,
    includesGuide: !!e.includesGuide,
    images: Array.isArray(e.images) ? e.images : [],
    mainImage:
      e.mainImage ??
      (Array.isArray(e.images) && e.images[0] ? e.images[0] : ""),
    locations: Array.isArray(e.locations) ? e.locations : [],
    type: e.type ?? "basic",
    discount: e.discount ?? "",
  };
}

export default function PackageForm({ existing, onSuccess, onClose }: Props) {
  const [form, setForm] = useState(() => normalizeExisting(existing));
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  useEffect(() => setForm(normalizeExisting(existing)), [existing]);

  const [showDiscount, setShowDiscount] = useState(
    !!(existing && existing.discount),
  );

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type, checked } = e.target as any;
    setForm((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // locations helpers
  const addLocation = () =>
    setForm((p: any) => ({ ...p, locations: [...(p.locations || []), ""] }));
  const updateLocation = (index: number, value: string) => {
    const updated = [...(form.locations || [])];
    updated[index] = value;
    setForm({ ...form, locations: updated });
  };
  const removeLocation = (index: number) =>
    setForm((p: any) => ({
      ...p,
      locations: (p.locations || []).filter((_: any, i: number) => i !== index),
    }));

  const [files, setFiles] = useState<File[]>([]);

  const handleSingleImage = (index: number, file: File) => {
    const updated = [...(form.images || [])];
    updated[index] = URL.createObjectURL(file);

    setForm({ ...form, images: updated });

    setFiles((prev) => {
      const copy = [...prev];
      copy[index] = file;
      return copy;
    });
  };

  const handleImages = (e: { target: { value: string } }) =>
    setForm((p: any) => ({
      ...p,
      images: e.target.value
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean),
    }));
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFiles(e.target.files ? Array.from(e.target.files) : []);

  const handleSubmit = async () => {
    const payload: any = {
      title: form.title,
      description: form.description,
      location: form.city,
      state: form.state,
      price: Number(form.price || 0),
      basePrice: Number(form.basePrice || 0),
      cabPrice: Number(form.cabPrice || 0),
      guidePrice: Number(form.guidePrice || 0),
      duration: Number(form.duration || 0),
      durationType: form.durationType,
      startTime: form.startTime,
      maxGroupSize: Number(form.maxGroupSize || 0),
      includesCab: !!form.includesCab,
      includesGuide: !!form.includesGuide,
      images: form.images,
      mainImage: form.mainImage,
      locations: form.locations || [],
      type: form.type,
      discount:
        showDiscount && form.discount ? Number(form.discount) : undefined,
    };

    try {
      if (files.length > 0) {
        const formData = new FormData();
        Object.keys(payload).forEach((k) => {
          if (payload[k] !== undefined)
            formData.append(
              k,
              typeof payload[k] === "object"
                ? JSON.stringify(payload[k])
                : String(payload[k]),
            );
        });
        files.forEach((f) => formData.append("images", f));
        if (mainImageFile) {
          formData.append("mainImageFile", mainImageFile);
        }

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
      onSuccess?.();
      onClose?.();
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Save failed");
    }
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow space-y-6 w-full max-w-3xl">
      <div>
        <label className="block text-sm mb-2">Main Image</label>

        {/* MAIN IMAGE PREVIEW + CLICK */}
        <label className="cursor-pointer block mb-3">
          {form.mainImage ? (
            <img
              src={form.mainImage}
              className="w-full h-48 object-cover rounded-lg border"
            />
          ) : (
            <div className="w-full h-48 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 border-2 border-dashed">
              Click to upload
            </div>
          )}

          <input
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const preview = URL.createObjectURL(file);

                setForm({
                  ...form,
                  mainImage: preview,
                });

                setMainImageFile(file);
              }
            }}
          />
        </label>

        {/* OTHER IMAGES */}
        <label className="block text-sm mb-2">Other Images (4)</label>

        <div className="grid grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <label
              key={i}
              className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg h-24 flex items-center justify-center overflow-hidden hover:border-black transition"
            >
              {form.images[i] ? (
                <img
                  src={form.images[i]}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs text-gray-400">Add</span>
              )}

              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const preview = URL.createObjectURL(file);

                    const updatedImages = [...form.images];
                    updatedImages[i] = preview; 

                    setForm({
                      ...form,
                      images: updatedImages,
                    });

                    setFiles((prev) => {
                      const copy = [...prev];
                      copy[i] = file;
                      return copy;
                    });
                  }
                }}
              />
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm mb-1">Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            className="input w-full border rounded-lg border-2 pl-1"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">City</label>
          <input
            name="city"
            value={form.city}
            onChange={handleChange}
            className="input w-full border rounded-lg border-2 pl-1"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm mb-1">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          className="input w-full border rounded-lg border-2 pl-1"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm mb-1">State</label>
          <input
            name="state"
            value={form.state}
            onChange={handleChange}
            className="input w-full border rounded-lg border-2 pl-1"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Max Group Size</label>
          <input
            name="maxGroupSize"
            value={form.maxGroupSize}
            onChange={handleChange}
            className="input w-full border rounded-lg border-2 pl-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <input
          name="price"
          value={form.price}
          type="number"
          onChange={handleChange}
          className="input w-full border rounded-lg border-2 pl-1"
          placeholder="Price"
        />
        <input
          name="basePrice"
          value={form.basePrice}
          type="number"
          onChange={handleChange}
          className="input w-full border rounded-lg border-2 pl-1"
          placeholder="Base"
        />
        <input
          name="cabPrice"
          value={form.cabPrice}
          type="number"
          onChange={handleChange}
          className="input w-full border rounded-lg border-2 pl-1"
          placeholder="Cab"
        />
        <input
          name="guidePrice"
          value={form.guidePrice}
          type="number"
          onChange={handleChange}
          className="input w-full border rounded-lg border-2 pl-1"
          placeholder="Guide"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <input
          name="duration"
          value={form.duration}
          onChange={handleChange}
          type="number"
          className="input w-full border rounded-lg border-2 pl-1"
          placeholder="Duration"
        />
        <select
          name="durationType"
          value={form.durationType}
          onChange={handleChange}
          className="input w-full border rounded-lg border-2 pl-1"
        >
          <option value="hours">Hours</option>
          <option value="days">Days</option>
        </select>
        <input
          name="startTime"
          value={form.startTime}
          onChange={handleChange}
          className="input w-full border rounded-lg border-2 pl-1"
          placeholder="Start time"
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="includesCab"
            checked={!!form.includesCab}
            onChange={handleChange}
          />{" "}
          Includes Cab
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="includesGuide"
            checked={!!form.includesGuide}
            onChange={handleChange}
          />{" "}
          Includes Guide
        </label>
        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          className="input w-44 border rounded-lg border-2 pl-1"
        >
          <option value="basic">Basic</option>
          <option value="medium">Medium</option>
          <option value="premium">Premium</option>
        </select>
        <label className="flex items-center gap-2 ml-auto">
          <input
            type="checkbox"
            checked={showDiscount}
            onChange={(e) => setShowDiscount(e.target.checked)}
          />
          <span className="text-sm">Has Discount</span>
        </label>
      </div>

      <div>
        <h4 className="font-semibold mb-2">Locations</h4>
        {(form.locations || []).map((loc: string, i: number) => (
          <div key={i} className="flex gap-2 mb-2">
            <input
              value={loc}
              onChange={(e) => updateLocation(i, e.target.value)}
              className="input flex-1 border rounded-lg border-2 pl-1"
              placeholder={`Location ${i + 1}`}
            />
            <button onClick={() => removeLocation(i)} className="text-red-500">
              Remove
            </button>
          </div>
        ))}
        <button
          onClick={addLocation}
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          + Add Location
        </button>
      </div>

      {showDiscount && (
        <div>
          <label className="block text-sm mb-1">Discount (number)</label>
          <input
            name="discount"
            value={form.discount ?? ""}
            onChange={handleChange}
            className="input w-40 border rounded-lg border-2 pl-1"
          />
        </div>
      )}

      <div className="flex gap-2 justify-end">
        <button onClick={onClose} className="px-3 py-1">
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="bg-black text-white px-3 py-1 rounded"
        >
          Save
        </button>
      </div>
    </div>
  );
}
