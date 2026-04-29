"use client";
import { createContext, useContext, useState } from "react";

const RetailerOnboardContext = createContext(null);

export function RetailerOnboardProvider({ children }) {
  // ── Step 1 — Identity ────────────────────────────────────────
  const [name, setName] = useState("");
  const [aadhar, setAadhar] = useState("");
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);

  // ── Step 2 — Business Info ───────────────────────────────────
  const [businessName, setBusinessName] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [cities, setCities] = useState([]);
  const [logoImage, setLogoImage] = useState(null);

  // ── Step 3 — Documents ───────────────────────────────────────
  const [panFile, setPanFile] = useState(null);
  const [gstFile, setGstFile] = useState(null);

  // ── Submission state ─────────────────────────────────────────
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
    <RetailerOnboardContext.Provider value={value}>
      {children}
    </RetailerOnboardContext.Provider>
  );
}

export function useRetailerOnboard() {
  const ctx = useContext(RetailerOnboardContext);
  if (!ctx) throw new Error("useRetailerOnboard must be used within RetailerOnboardProvider");
  return ctx;
}
