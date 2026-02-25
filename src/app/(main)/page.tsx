"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";
import UserList from "@/components/user-list";
import ChatWindow from "@/components/chat-window";
import { Id } from "../../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";

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

  const handleBack = () => {
    setSelectedConversation(null);
    setSelectedUserId(null);
  };

  return (
    <div className="flex h-full w-full">
      {/* User List */}
      <div
        className={cn(
          "overflow-y-auto ",
          "md:flex md:w-96",
          selectedUserId ? "hidden" : "flex w-full",
        )}
      >
        <UserList onSelect={handleSelectUser} selectedUserId={selectedUserId} />
      </div>

      {/* Chat Window */}
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col",
          "md:flex md:w-2/3",
          selectedUserId ? "flex w-full" : "hidden",
        )}
      >
        <ChatWindow
          conversationId={selectedConversation}
          handleBack={handleBack}
        />
      </div>
    </div>
  );
}
