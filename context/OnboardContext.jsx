"use client";
import { createContext, useContext, useState } from "react";

const OnboardContext = createContext(null);
export function OnboardProvider({ children }) {
  // Step 1 — Identity
  const [name, setName] = useState("");
  const [aadhar, setAadhar] = useState("");
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);

  // Step 2 — Business Info
  const [businessName, setBusinessName] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [cities, setCities] = useState([]);
  const [logoImage, setLogoImage] = useState(null);

  // Step 3 — Documents
  const [panFile, setPanFile] = useState(null);
  const [gstFile, setGstFile] = useState(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const value = {
    // Step 1
    name, setName,
    aadhar, setAadhar,
    frontImage, setFrontImage,
    backImage, setBackImage,
    // Step 2
    businessName, setBusinessName,
    selectedState, setSelectedState,
    selectedCity, setSelectedCity,
    cities, setCities,
    logoImage, setLogoImage,
    // Step 3
    panFile, setPanFile,
    gstFile, setGstFile,
    // Submission
    isSubmitting, setIsSubmitting,
    submitError, setSubmitError,
  };

  return (
    <OnboardContext.Provider value={value}>
      {children}
    </OnboardContext.Provider>
  );
}

export function useOnboard() {
  const ctx = useContext(OnboardContext);
  if (!ctx) throw new Error("useOnboard must be used within OnboardProvider");
  return ctx;
}
