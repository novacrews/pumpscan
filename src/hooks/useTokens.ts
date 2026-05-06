"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ScannerToken, SortConfig, FilterConfig } from "@/types/token";
import { fetchPumpFunTokens } from "@/lib/api";

const DEFAULT_FILTERS: FilterConfig = {
  minLiquidity: 0,
  minVolume24h: 0,
  minMarketCap: 0,
  maxAge: 0,
  search: "",
};

const DEFAULT_SORT: SortConfig = {
  field: "pairCreatedAt",
  direction: "desc",
};

const REFRESH_INTERVAL = 10_000; // 10 seconds

export function useTokens() {
  const [tokens, setTokens] = useState<ScannerToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [sort, setSort] = useState<SortConfig>(DEFAULT_SORT);
  const [filters, setFilters] = useState<FilterConfig>(DEFAULT_FILTERS);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      setError(null);

      const data = await fetchPumpFunTokens();
      setTokens(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tokens");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(true);
    intervalRef.current = setInterval(() => fetchData(false), REFRESH_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchData]);

  const filteredTokens = tokens.filter((token) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (
        !token.name.toLowerCase().includes(q) &&
        !token.symbol.toLowerCase().includes(q) &&
        !token.address.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    if (filters.minLiquidity && token.liquidityUsd < filters.minLiquidity) return false;
    if (filters.minVolume24h && token.volume24h < filters.minVolume24h) return false;
    if (filters.minMarketCap && token.marketCap < filters.minMarketCap) return false;
    if (filters.maxAge) {
      const ageHours = (Date.now() - token.pairCreatedAt) / 3600000;
      if (ageHours > filters.maxAge) return false;
    }
    return true;
  });

  const sortedTokens = [...filteredTokens].sort((a, b) => {
    const field = sort.field;
    let aVal = a[field];
    let bVal = b[field];

    if (typeof aVal === "string") aVal = aVal.toLowerCase() as unknown as number;
    if (typeof bVal === "string") bVal = bVal.toLowerCase() as unknown as number;

    if (aVal < bVal) return sort.direction === "asc" ? -1 : 1;
    if (aVal > bVal) return sort.direction === "asc" ? 1 : -1;
    return 0;
  });

  const toggleSort = (field: SortConfig["field"]) => {
    setSort((prev) => ({
      field,
      direction: prev.field === field && prev.direction === "desc" ? "asc" : "desc",
    }));
  };

  return {
    tokens: sortedTokens,
    totalCount: tokens.length,
    filteredCount: filteredTokens.length,
    loading,
    error,
    lastUpdated,
    sort,
    filters,
    setFilters,
    toggleSort,
    refresh: () => fetchData(false),
  };
}
