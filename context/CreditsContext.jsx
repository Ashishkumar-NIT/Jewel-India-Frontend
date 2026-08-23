"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { fetchWallet, fetchRateCard } from "../lib/supabase/credits-queries";

const CreditsContext = createContext(null);

export function CreditsProvider({ children }) {
  const [wallet, setWallet] = useState(null);
  const [rateCard, setRateCard] = useState({});
  const [rateCardList, setRateCardList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [walletData, pricesData] = await Promise.all([
        fetchWallet().catch((err) => {
          console.error("[CreditsContext] Failed to fetch wallet:", err);
          return null;
        }),
        fetchRateCard().catch((err) => {
          console.error("[CreditsContext] Failed to fetch rate card:", err);
          return [];
        }),
      ]);

      if (walletData) {
        setWallet(walletData);
      }

      if (Array.isArray(pricesData)) {
        setRateCardList(pricesData);
        const map = {};
        pricesData.forEach((item) => {
          if (item.feature_key) {
            map[item.feature_key] = item;
          }
        });
        setRateCard(map);
      }
    } catch (err) {
      console.error("[CreditsContext] Refresh error:", err);
      setError(err.message || "Failed to load credits.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /**
   * Get the credit cost for a specific feature key.
   * Returns null if rate card has not loaded or feature key is unknown.
   */
  const costOf = useCallback(
    (featureKey) => {
      if (!featureKey || !rateCard[featureKey]) return null;
      return rateCard[featureKey].credits;
    },
    [rateCard]
  );

  /**
   * Get the full price object for a feature key.
   */
  const feature = useCallback(
    (featureKey) => {
      return rateCard[featureKey] || null;
    },
    [rateCard]
  );

  const value = {
    wallet,
    rateCard,
    rateCardList,
    isLoading,
    error,
    refresh,
    costOf,
    feature,
  };

  return <CreditsContext.Provider value={value}>{children}</CreditsContext.Provider>;
}

export function useCredits() {
  const context = useContext(CreditsContext);
  if (!context) {
    throw new Error("useCredits must be used within a CreditsProvider");
  }
  return context;
}
