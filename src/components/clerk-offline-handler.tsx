"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function ClerkOfflineHandler() {
  const { user } = useUser();
  const setOffline = useMutation(api.users.setUserOffline);

  useEffect(() => {
    if (!user) return;

    const handleUnload = () => {
      setOffline({ clerkId: user.id });
    };

    window.addEventListener("beforeunload", handleUnload);

    return () => {
      setOffline({ clerkId: user.id });
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [user, setOffline]);

  return null;
}
