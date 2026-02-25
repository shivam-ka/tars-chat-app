import React from "react";
import Navbar from "../_components/navbar";
import UserSync from "@/components/user-sync";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="flex h-screen flex-col">
      <Navbar />
      <UserSync />
      <div className="flex flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
