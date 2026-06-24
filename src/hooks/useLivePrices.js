import { useState, useEffect, useCallback } from "react";

const SYMBOLS = [
  { key: "nq", symbol: "NQ=F", label: "NQ Futures" },
  { key: "dxy", symbol: "DX-Y.NYB", label: "DXY" },
  { key: "vix", symbol: "^VIX", label: "VIX" },
  { key: "tnx", symbol: "^TNX", label: "10Y Yield" },
];

async function fetchWithTimeout(url, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch {
    clearTimeout(timer);
    return null;
  }
}

async function fetchPriceYahoo(symbol) {
  try {
    const res = await fetchWithTimeout(
      `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`
    );
    if (!res || !res.ok) return null;
    const data = await res.json();
    const meta = data?.chart?.result?.[0]?.meta;
    if (!meta) return null;
    return {
      price: meta.regularMarketPrice ?? null,
      previousClose: meta.chartPreviousClose ?? meta.previousClose ?? null,
      currency: meta.currency ?? "",
    };
  } catch {
    return null;
  }
}

async function fetchPriceYahooV7(symbol) {
  try {
    const res = await fetchWithTimeout(
      `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbol)}`
    );
    if (!res || !res.ok) return null;
    const data = await res.json();
    const q = data?.quoteResponse?.result?.[0];
    if (!q) return null;
    return {
      price: q.regularMarketPrice ?? null,
      previousClose: q.regularMarketPreviousClose ?? null,
      currency: q.currency ?? "",
    };
  } catch {
    return null;
  }
}

async function fetchPrice(symbol) {
  let result = await fetchPriceYahoo(symbol);
  if (!result) result = await fetchPriceYahooV7(symbol);
  return result;
}

export default function useLivePrices(intervalMs = 30000) {
  const [prices, setPrices] = useState(() =>
    SYMBOLS.reduce((acc, s) => {
      acc[s.key] = { price: null, previousClose: null, change: null, changePct: null, currency: "", loading: true };
      return acc;
    }, {})
  );
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchAll = useCallback(async () => {
    const results = await Promise.all(SYMBOLS.map((s) => fetchPrice(s.symbol)));
    const next = {};
    SYMBOLS.forEach((s, i) => {
      const r = results[i];
      if (r && r.price != null) {
        const change = r.previousClose ? r.price - r.previousClose : null;
        const changePct = r.previousClose && change != null ? (change / r.previousClose) * 100 : null;
        next[s.key] = {
          price: r.price,
          previousClose: r.previousClose,
          change,
          changePct,
          currency: r.currency,
          loading: false,
        };
      } else {
        next[s.key] = { price: null, previousClose: null, change: null, changePct: null, currency: "", loading: false };
      }
    });
    setPrices(next);
    setLastUpdated(new Date());
  }, []);

  useEffect(() => {
    fetchAll();
    const id = setInterval(fetchAll, intervalMs);
    return () => clearInterval(id);
  }, [fetchAll, intervalMs]);

  return { prices, lastUpdated, refresh: fetchAll };
}
