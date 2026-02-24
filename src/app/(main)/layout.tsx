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
   redirect("/sign-in")
  }

  return (
    <>
      <Navbar />
      <UserSync />
      {children}
    </>
  );
}
