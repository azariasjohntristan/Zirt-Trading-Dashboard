import { useState, useEffect } from "react";
import { getPHT, getET, getCountdown } from "../data/constants";

export default function useClock() {
  const [pht, setPht] = useState(getPHT());
  const [et, setEt] = useState(getET());
  const [countdown, setCountdown] = useState(getCountdown());

  useEffect(() => {
    const int = setInterval(() => {
      setPht(getPHT());
      setEt(getET());
      setCountdown(getCountdown());
    }, 1000);
    return () => clearInterval(int);
  }, []);

  return { pht, et, countdown };
}