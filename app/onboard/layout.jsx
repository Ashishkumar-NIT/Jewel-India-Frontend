"use client";
import { OnboardProvider } from "../../context/OnboardContext";

export default function OnboardLayout({ children }) {
  return (
    <div className="theme-wholesaler min-h-screen flex flex-col">
      <OnboardProvider>{children}</OnboardProvider>
    </div>
  );
}