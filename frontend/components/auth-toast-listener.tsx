"use client";

import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export function AuthToastListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handleShowToast = (event: CustomEvent) => {
      const { title, description, variant = "default" } = event.detail;
      toast({
        title,
        description,
        variant,
      });
    };

    // Listen for custom toast events from AuthContext
    window.addEventListener("showToast", handleShowToast as EventListener);

    return () => {
      window.removeEventListener("showToast", handleShowToast as EventListener);
    };
  }, [toast]);

  return null;
}
