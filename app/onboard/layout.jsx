"use client";
import { OnboardProvider } from "../../context/OnboardContext";

export default function OnboardLayout({ children }) {
  return <OnboardProvider>{children}</OnboardProvider>;
}