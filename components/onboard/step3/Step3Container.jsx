"use client";

import { useState } from "react";
import { useOnboard } from "../../../context/OnboardContext";
import { DocumentUpload } from "./DocumentUpload";
import { Step3Footer } from "./Step3Footer";

export function Step3Container() {
  const {
    panFile, setPanFile,
    gstFile, setGstFile,
    submitError,
  } = useOnboard();

  const [submitAttempted, setSubmitAttempted] = useState(false);

  const isFormValid = panFile !== null && gstFile !== null;
  return (
    <div className="flex flex-col gap-8 w-full mt-10">
      <DocumentUpload
        panFile={panFile} setPanFile={setPanFile}
        gstFile={gstFile} setGstFile={setGstFile}
        submitAttempted={submitAttempted}
      />
      <div className="mt-8 w-full">
        {submitError && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 border border-red-200 rounded-[10px] text-sm font-medium">
            {submitError}
          </div>
        )}
        <Step3Footer
          isFormValid={isFormValid}
          onSubmitAttempt={() => setSubmitAttempted(true)}
        />
      </div>
    </div>
  );
}
