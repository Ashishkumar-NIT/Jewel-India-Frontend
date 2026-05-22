"use client";
import { OnboardProvider } from "../../context/OnboardContext";

export default function OnboardLayout({ children }) {
  return (
    <div className="theme-wholesaler min-h-screen flex flex-col">
      <OnboardProvider>
        <div className="onboard-page-transition flex-1 flex flex-col w-full">
          {children}
        </div>
      </OnboardProvider>
    </div>
  );
}