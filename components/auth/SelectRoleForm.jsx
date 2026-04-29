"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/Button";
import { setUserRole } from "../../lib/actions/role";

const roles = [
  {
    value: "wholesaler",
    label: "Wholesaler",
    description: "Upload jewellery products, manage your catalogue, and connect with retailers.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
  },
  {
    value: "retailer",
    label: "Retailer",
    description: "Browse the full jewellery catalogue, discover designs, and source from wholesalers.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    ),
  },
];
export function SelectRoleForm() {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  async function handleConfirm() {
    if (!selected) {
      setError("Please choose a role to continue.");
      return;
    }
    setLoading(true);
    setError(null);
    const result = await setUserRole(selected);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    // Redirect based on role
    if (selected === "wholesaler") {
      router.push("/dashboard/wholesaler");
    } else {
      router.push("/");
    }
  }

  return (
    <div className="w-full space-y-8">
      <div className="grid gap-6">
        {roles.map((role) => {
          const isSelected = selected === role.value;
          return (
            <button
              key={role.value}
              type="button"
              onClick={() => setSelected(role.value)}
              className={`
                relative w-full text-left flex items-start gap-6 p-6 border transition-all duration-300
                ${isSelected
                  ? "border-celestique-dark bg-celestique-taupe/10"
                  : "border-celestique-taupe bg-transparent hover:border-celestique-dark/50 hover:bg-celestique-taupe/5"}
              `}
            >
              {/* Radio indicator */}
              <div
                className={`
                  mt-1 shrink-0 w-4 h-4 border flex items-center justify-center transition-colors
                  ${isSelected ? "border-celestique-dark bg-celestique-dark" : "border-celestique-taupe bg-transparent"}
                `}
              >
                {isSelected && (
                  <span className="w-1.5 h-1.5 bg-celestique-cream inline-block" />
                )}
              </div>

              {/* Icon */}
              <div className={`shrink-0 p-3 border ${isSelected ? "border-celestique-dark text-celestique-dark" : "border-celestique-taupe text-celestique-dark/60"}`}>
                {role.icon}
              </div>

              {/* Text */}
              <div className="pt-1">
                <p className={`font-serif text-lg ${isSelected ? "text-celestique-dark" : "text-celestique-dark/80"}`}>
                  {role.label}
                </p>
                <p className="font-sans text-[11px] uppercase tracking-[0.1em] text-celestique-dark/60 mt-2 leading-relaxed">
                  {role.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {error && (
        <p className="font-sans text-[10px] uppercase tracking-[0.1em] text-red-800 bg-red-50 border border-red-200 px-4 py-3 text-center">
          {error}
        </p>
      )}

      <Button
        onClick={handleConfirm}
        loading={loading}
        disabled={!selected}
      >
        Complete Selection
      </Button>
    </div>
  );
}
