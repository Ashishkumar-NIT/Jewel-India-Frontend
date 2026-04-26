"use client";
import { ImageUploadBox } from "../../onboard/ImageUploadBox";

export function RetailerBusinessLogoUpload({ logoImage, setLogoImage, submitAttempted }) {
  const error = submitAttempted && !logoImage;

  return (
    <div className="w-full">
      <ImageUploadBox
        label="Store Logo"
        image={logoImage}
        onUpload={(file) => setLogoImage(file)}
        onRemove={() => setLogoImage(null)}
        error={error ? "Please upload your store logo" : null}
        objectFit="contain"
        aspectRatio="aspect-square"
      />
    </div>
  );
}
