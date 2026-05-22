"use client";
import { RetailerOnboardProvider } from "../../context/RetailerOnboardContext";

/**
 * Layout wrapping all /onboard-retailer/* pages.
 * Must be a client component because RetailerOnboardProvider uses useState.
 */
export default function RetailerOnboardLayout({ children }) {
  return (
    <div className="theme-retailer min-h-screen flex flex-col">
      <RetailerOnboardProvider>
        <div className="onboard-page-transition flex-1 flex flex-col w-full">
          {children}
        </div>
      </RetailerOnboardProvider>
    </div>
  );
}