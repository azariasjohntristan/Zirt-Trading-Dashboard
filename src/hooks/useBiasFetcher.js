import { useState, useEffect, useRef } from "react";

export default function useBiasFetcher() {
  const [liveData, setLiveData] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    async function fetchLatest() {
      try {
        const res = await fetch("/latest-bias.json?_=" + Date.now());
        if (!res.ok) return;
        const data = await res.json();
        setLiveData(data);
      } catch (e) {
        // Silent fail
      }
    }
    fetchLatest();
    intervalRef.current = setInterval(fetchLatest, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return liveData;
}