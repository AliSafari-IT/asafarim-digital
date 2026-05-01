"use client";

import { useState, useEffect } from "react";

export default function AuthFooter() {
  const [currentYear, setCurrentYear] = useState(2024);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return <p>&copy; {currentYear} ASafariM Digital</p>;
}
