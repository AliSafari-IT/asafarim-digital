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

  return (
    <div className="text-xs text-[var(--color-text-subtle)]">
      Updated {time || "Loading..."}
    </div>
  );
}
