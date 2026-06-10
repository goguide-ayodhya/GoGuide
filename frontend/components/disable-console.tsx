"use client";

import { useEffect } from "react";

export function DisableConsole() {
  useEffect(() => {
    // Disable all console output in production
    if (process.env.NODE_ENV === "production") {
      const noop = () => {};
      console.log = noop;
      console.error = noop;
      console.warn = noop;
      console.info = noop;
      console.debug = noop;
      console.trace = noop;
      console.group = noop;
      console.groupEnd = noop;
    }
  }, []);

  return null;
}
