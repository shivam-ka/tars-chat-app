"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";

import UserList from "@/components/user-list";
import ChatWindow from "@/components/chat-window";
import { Id } from "../../../convex/_generated/dataModel";

export default function Home() {
  const { user } = useUser();

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] =
    useState<Id<"conversations"> | null>(null);

  const getOrCreateConversation = useMutation(
    api.conversations.getOrCreateConversation,
  );

  const handleSelectUser = async (otherUserId: string) => {
    if (!user) return;

    setSelectedUserId(otherUserId);

    const conversationId = await getOrCreateConversation({
      user1: user.id,
      user2: otherUserId,
    });

    setSelectedConversation(conversationId);
  };

  return (
    <div className="flex h-screen">
      <UserList onSelect={handleSelectUser} selectedUserId={selectedUserId} />
      <ChatWindow conversationId={selectedConversation} />
    </div>
  );
}
