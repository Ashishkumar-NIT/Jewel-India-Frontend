"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { fetchWallet, fetchRateCard } from "../lib/supabase/credits-queries";

const defaultCreditsState = {
  wallet: {
    ok: true,
    available: 0,
    lifetime_granted: 0,
    lifetime_spent: 0,
    lifetime_expired: 0,
    expiring_soon: 0,
    next_expiry: null,
    low_balance: false,
  },
  rateCard: {},
  rateCardList: [],
  isLoading: false,
  error: null,
  refresh: async () => {},
  costOf: () => null,
  feature: () => null,
};

const CreditsContext = createContext(defaultCreditsState);

export function CreditsProvider({ children }) {
  const [wallet, setWallet] = useState({
    ok: true,
    available: 0,
    lifetime_granted: 0,
    lifetime_spent: 0,
    lifetime_expired: 0,
    expiring_soon: 0,
    next_expiry: null,
    low_balance: false,
  });
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
          console.warn("[CreditsContext] Wallet fetch notice:", err?.message);
          return null;
        }),
        fetchRateCard().catch((err) => {
          console.warn("[CreditsContext] Rate card fetch notice:", err?.message);
          return [];
        }),
      ]);

      if (walletData && typeof walletData === "object") {
        setWallet(walletData);
      }

      if (Array.isArray(pricesData)) {
        setRateCardList(pricesData);
        const map = {};
        pricesData.forEach((item) => {
          if (item?.feature_key) {
            map[item.feature_key] = item;
          }
        });
        setRateCard(map);
      }
    } catch (err) {
      console.warn("[CreditsContext] Refresh notice:", err?.message);
      setError(err?.message || "Failed to load credits.");
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
      return rateCard[featureKey]?.credits ?? null;
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
  return context || defaultCreditsState;
}
