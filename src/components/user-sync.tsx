"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function UserSync() {
  const { user, isLoaded } = useUser();
  const createUser = useMutation(api.users.createAndUpdateUser);

  useEffect(() => {
    if (!isLoaded || !user) return;

    createUser({
      clerkId: user.id,
      name: user.fullName || "",
      email: user.primaryEmailAddress?.emailAddress || "",
      image: user.imageUrl,
    });
  }, [isLoaded, user, createUser]);

  return null;
}
