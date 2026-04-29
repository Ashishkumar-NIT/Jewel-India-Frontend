"use client";
import { RetailerOnboardProvider } from "../../context/RetailerOnboardContext";

/**
 * Layout wrapping all /onboard-retailer/* pages.
 * Must be a client component because RetailerOnboardProvider uses useState.
 */
export default function RetailerOnboardLayout({ children }) {
  return <RetailerOnboardProvider>{children}</RetailerOnboardProvider>;
}