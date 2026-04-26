"use client";

import { useEffect, useMemo, useState } from "react";
import { categories } from "../../lib/config/catalogueCategories";

export function DesignUploadModal({ isOpen, onClose, onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const categoryOptions = useMemo(
    () => categories.map((item) => item.name),
    []
  );

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setTitle("");
      setCategory("");
      setTags("");
      setIsSubmitting(false);
      setError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (event) => {
    const selected = event.target.files?.[0] || null;
    setFile(selected);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      setError("Please select an image to upload.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("image", file);
      if (title.trim()) formData.append("title", title.trim());
      if (category.trim()) formData.append("category", category.trim());
      if (tags.trim()) formData.append("tags", tags.trim());

      const response = await fetch("/api/designs/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      onUploadComplete?.(data.data);
      onClose();
    } catch (err) {
      setError(err.message || "Upload failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-[520px] rounded-[20px] bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400 font-semibold">Retailer Catalogue</p>
            <h2 className="text-[20px] font-extrabold text-[#111827] tracking-tight">Upload Design</h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
            aria-label="Close"
          >
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 flex flex-col gap-5">
          <div className="grid gap-4">
            <label className="text-[13px] font-semibold text-[#374151]">Design Image*</label>
            <div className="flex items-center gap-4">
              <div className="w-[110px] h-[110px] rounded-[12px] border border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[11px] text-gray-400">Preview</span>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/jpeg, image/png, image/webp"
                  onChange={handleFileChange}
                  className="block w-full text-[12px] text-gray-500 file:mr-4 file:rounded-[8px] file:border-0 file:bg-[#111827] file:px-4 file:py-2 file:text-[12px] file:font-bold file:text-white hover:file:bg-black"
                />
                <p className="mt-2 text-[11px] text-gray-400">
                  JPEG, PNG, or WebP. Recommended size 1200px+.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-semibold text-[#374151]">Title (optional)</label>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Emerald bridal set"
                className="w-full rounded-[10px] border border-gray-200 bg-gray-50 px-4 py-2.5 text-[14px] text-[#374151] outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-semibold text-[#374151]">Category (optional)</label>
              <input
                type="text"
                list="retailer-category-options"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                placeholder="Rings"
                className="w-full rounded-[10px] border border-gray-200 bg-gray-50 px-4 py-2.5 text-[14px] text-[#374151] outline-none focus:ring-2 focus:ring-black/10"
              />
              <datalist id="retailer-category-options">
                {categoryOptions.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-semibold text-[#374151]">Tags (optional)</label>
              <input
                type="text"
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                placeholder="bridal, kundan, emerald"
                className="w-full rounded-[10px] border border-gray-200 bg-gray-50 px-4 py-2.5 text-[14px] text-[#374151] outline-none focus:ring-2 focus:ring-black/10"
              />
              <p className="text-[11px] text-gray-400">Separate tags with commas.</p>
            </div>
          </div>

          {error && (
            <div className="rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-[12px] text-red-600 font-medium">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-[12px] border border-gray-200 px-4 py-3 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-[12px] bg-[#111827] px-4 py-3 text-[13px] font-bold text-white hover:bg-black transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Uploading..." : "Upload Design"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
