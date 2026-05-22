"use client";
import { useRouter } from "next/navigation";
import { useOnboard } from "../../../context/OnboardContext";

export function Step3Footer({ isFormValid, onSubmitAttempt }) {
  const router = useRouter();
  const {
    name, aadhar,
    frontImage, backImage,
    businessName, selectedState, selectedCity,
    logoImage,
    panFile, gstFile,
    isSubmitting, setIsSubmitting,
    setSubmitError,
  } = useOnboard();

const compressImage = async (file) => {
  if (!file || !file.type.startsWith("image/")) return file;

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new self.Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        
        // Max dimensions
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (!blob) {
            resolve(file); // fallback
            return;
          }
          const compressedFile = new File([blob], file.name, {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        }, "image/jpeg", 0.7); // 70% quality
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
};

  const handleSubmit = async () => {
    if (!isFormValid) {
      onSubmitAttempt();
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const formData = new FormData();

      // Text fields
      formData.append("name", name);
      formData.append("aadhar", aadhar.replace(/\s/g, ""));
      formData.append("businessName", businessName);
      formData.append("state", selectedState);
      formData.append("city", selectedCity);

      // Compress and append file uploads
      if (frontImage) formData.append("aadharFront", await compressImage(frontImage));
      if (backImage) formData.append("aadharBack", await compressImage(backImage));
      if (panFile) formData.append("panCard", await compressImage(panFile));
      if (gstFile) formData.append("gstCertificate", await compressImage(gstFile));
      if (logoImage) formData.append("businessLogo", await compressImage(logoImage));

      const res = await fetch("/api/onboard/submit", {
        method: "POST",
        body: formData,
      });

      // Handle plain-text HTML errors (like 413 Payload Too Large) gracefully
      const isHtml = res.headers.get("content-type")?.includes("text/html");
      if (isHtml) {
        throw new Error(`Server returned error status ${res.status}. Files might still be too large.`);
      }

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Submission failed");
      }

      // Success — navigate to submitted page
      router.push("/onboard/submitted");
    } catch (err) {
      console.error("Submit error:", err);
      setSubmitError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-end ml-auto gap-2">
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!isFormValid || isSubmitting}
        className={`w-full md:w-[140px] font-extrabold rounded-[10px] px-4 py-[clamp(10px,1.2vw,14px)] text-[clamp(13px,1.4vw,15px)] transition-all tracking-wide transform translate-x-0 md:translate-x-[46px] ${
          isSubmitting
            ? "bg-[#6B7280] text-white cursor-wait"
            : isFormValid
              ? "bg-[#000000] text-white hover:bg-black/90 cursor-pointer"
              : "bg-[#D1D5DB] text-white cursor-not-allowed"
        }`}
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Submitting...
          </div>
        ) : "Submit"}
      </button>
    </div>
  );
}
