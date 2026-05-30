"use client";

import { useRef, useState, useEffect } from "react";

export function ImageUpload({ onFileChange, error }) {
    const inputRef = useRef(null);
    const [preview, setPreview] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const previousUrlRef = useRef(null);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (previousUrlRef.current) {
                URL.revokeObjectURL(previousUrlRef.current);
            }
        };
    }, []);
    function handleFile(file) {
        if (!file) return;
        // Revoke previous URL to prevent memory leak
        if (previousUrlRef.current) {
            URL.revokeObjectURL(previousUrlRef.current);
            previousUrlRef.current = null;
        }
        const url = URL.createObjectURL(file);
        previousUrlRef.current = url;
        setPreview(url);
        onFileChange(file);
    }

    function handleInputChange(e) {
        handleFile(e.target.files[0]);
    }

    function handleDrop(e) {
        e.preventDefault();
        setDragOver(false);
        handleFile(e.dataTransfer.files[0]);
    }

    function handleRemove(e) {
        e.stopPropagation();
        // Revoke the object URL to free memory
        if (previousUrlRef.current) {
            URL.revokeObjectURL(previousUrlRef.current);
            previousUrlRef.current = null;
        }
        setPreview(null);
        onFileChange(null);
        if (inputRef.current) inputRef.current.value = "";
    }

    return (
        <div className="w-full flex flex-col gap-1" id="image">
            <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => !preview && inputRef.current?.click()}
                className={`w-full md:w-[420px] h-[200px] md:h-[240px] border-2 border-dashed rounded-[10px] flex items-center justify-center cursor-pointer transition-all ${
                    error
                        ? "border-red-500 bg-red-50 hover:bg-red-50/70"
                        : dragOver
                        ? "border-[#2563EB] bg-[#EFF6FF]"
                        : "border-[#3B82F6] hover:border-[#2563EB] hover:bg-[#F8FAFC] bg-[#F1F5F9]"
                }`}
            >
                {preview ? (
                    <div className="relative w-full h-full flex items-center justify-center p-4">
                        <img
                            src={preview}
                            alt="Preview"
                            className="max-h-full max-w-full object-contain"
                        />
                    </div>
                ) : (
                    <div className="flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full border-2 border-dashed border-[#3B82F6] flex items-center justify-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6 text-[#3B82F6]"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                    </div>
                )}
            </div>

            {/* Action buttons - shown when image is uploaded */}
            {preview && (
                <div className="flex gap-4 mt-3 w-full md:w-[420px] justify-center">
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                        className="bg-black text-white px-3.5 py-2 rounded-md text-sm flex items-center gap-1.5 hover:bg-black/90 transition-colors font-gilroy font-semibold"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Change Image
                    </button>
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="bg-transparent text-red-500 px-3.5 py-2 text-sm flex items-center gap-1.5 hover:text-red-600 transition-colors font-gilroy font-semibold"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Remove
                    </button>
                </div>
            )}

            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleInputChange}
            />
            {error && (
                <p className="text-xs font-semibold text-red-500 font-gilroy mt-1.5 animate-fade-in w-full md:w-[420px] text-center">
                    {error}
                </p>
            )}
        </div>
    );
}
