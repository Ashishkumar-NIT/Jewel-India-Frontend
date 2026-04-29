"use client";
import { ImageUploadBox } from "../ImageUploadBox";

export function AadharUpload({ frontImage, setFrontImage, backImage, setBackImage, submitAttempted }) {
  const frontError = submitAttempted && !frontImage;
  const backError = submitAttempted && !backImage;

  return (
    <div className="flex flex-row gap-[clamp(8px,1.5vw,24px)] w-full">
      <div className="flex-1 min-w-0">
        <ImageUploadBox
          label="Aadhar Front*"
          image={frontImage}
          onUpload={(file) => setFrontImage(file)}
          onRemove={() => setFrontImage(null)}
          error={frontError ? "Please upload Aadhar Front" : null}
        />
      </div>
      <div className="flex-1 min-w-0">
        <ImageUploadBox
          label="Aadhar Back*"
          image={backImage}
          onUpload={(file) => setBackImage(file)}
          onRemove={() => setBackImage(null)}
          error={backError ? "Please upload Aadhar Back" : null}
        />
      </div>
    </div>
  );
}