"use client";

import { useState, useEffect } from "react";

export default function LiveTimeDisplay() {
  const [time, setTime] = useState("");

  useEffect(() => {
    setTime(new Date().toLocaleTimeString());
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return <span className="text-xs text-[var(--color-text-subtle)] sm:text-right">Updated {time || "Loading..."}</span>;
}
