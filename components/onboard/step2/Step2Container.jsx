"use client";

import { useState } from "react";
import { useOnboard } from "../../../context/OnboardContext";
import { BusinessForm } from "./BusinessForm";
import { BusinessLogoUpload } from "./BusinessLogoUpload";
import { Step2Footer } from "./Step2Footer";

export function Step2Container() {
  const {
    businessName, setBusinessName,
    selectedState, setSelectedState,
    selectedCity, setSelectedCity,
    cities, setCities,
    logoImage, setLogoImage,
  } = useOnboard();

  const [submitAttempted, setSubmitAttempted] = useState(false);

  const isFormValid =
    businessName.trim().length >= 2 &&
    selectedState !== '' &&
    selectedCity !== '' &&
    logoImage !== null;
  return (
    <div className="flex flex-col gap-[clamp(12px,1.5vw,20px)] w-full mt-4">
      <BusinessForm
        businessName={businessName} setBusinessName={setBusinessName}
        selectedState={selectedState} setSelectedState={setSelectedState}
        selectedCity={selectedCity} setSelectedCity={setSelectedCity}
        cities={cities} setCities={setCities}
        submitAttempted={submitAttempted}
      />

      <div className="flex flex-col md:flex-row gap-[clamp(8px,1.5vw,24px)] w-full items-start">
        <div className="w-full md:w-[58%] md:flex-none min-w-0">
          <BusinessLogoUpload
            logoImage={logoImage} setLogoImage={setLogoImage}
            submitAttempted={submitAttempted}
          />
          <p className="mt-3 text-[8px] md:text-[8.5px] tracking-tight text-[#000000] font-bold leading-relaxed pr-2 w-full wrap-break-word">
            *Your documents are encrypted and only used for verification.<br />
            We never share them.
          </p>
        </div>
        <div className="flex-1 min-w-0 w-full flex items-end justify-end self-stretch">
          <Step2Footer
            isFormValid={isFormValid}
            onSubmitAttempt={() => setSubmitAttempted(true)}
          />
        </div>
      </div>
    </div>
  );
}
