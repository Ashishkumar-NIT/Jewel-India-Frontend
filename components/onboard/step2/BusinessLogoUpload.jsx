"use client";
import { ImageUploadBox } from "../ImageUploadBox";

export function BusinessLogoUpload({ logoImage, setLogoImage, submitAttempted }) {
  // Although visually not asterisked, logo is mandatory
  const error = submitAttempted && !logoImage;
  
  return (
    <div className="w-full">
      <ImageUploadBox 
        label="Business Logo" 
        image={logoImage} 
        onUpload={(file) => setLogoImage(file)}
        onRemove={() => setLogoImage(null)}
        error={error ? "Please upload your business logo" : null}
        objectFit="contain"
        aspectRatio="aspect-square"
      />
    </div>
  );
}

