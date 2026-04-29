"use client";
import { ImageUploadBox } from "../ImageUploadBox";

export function DocumentUpload({ panFile, setPanFile, gstFile, setGstFile, submitAttempted }) {
  const panError = submitAttempted && !panFile;
  const gstError = submitAttempted && !gstFile;

  return (
    <div className="flex flex-row gap-[clamp(8px,3vw,24px)] w-full">
      <div className="flex-1 min-w-0">
        <ImageUploadBox
          label="PAN Card*"
          image={panFile}
          onUpload={(file) => setPanFile(file)}
          onRemove={() => setPanFile(null)}
          error={panError ? "Please upload your PAN Card" : null}
          accept="image/jpeg, image/png, image/webp, application/pdf"
        />
        <p className="mt-3 text-[8px] md:text-[8.5px] tracking-tight text-[#000000] font-bold leading-relaxed pr-2 w-full wrap-break-word">
          *Your documents are encrypted and only used for verification.<br />
          We never share them.
        </p>
      </div>
      <div className="flex-1 min-w-0">
        <ImageUploadBox
          label="GST Certificate*"
          image={gstFile}
          onUpload={(file) => setGstFile(file)}
          onRemove={() => setGstFile(null)}
          error={gstError ? "Please upload your GST Certificate" : null}
          accept="image/jpeg, image/png, image/webp, application/pdf"
        />
      </div>
    </div>
  );
}