"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect, useRef } from "react";
import { Id } from "../../convex/_generated/dataModel";

interface ChatWindowProps {
  conversationId: Id<"conversations"> | null;
}

export default function ChatWindow({ conversationId }: ChatWindowProps) {
  const { user } = useUser();
  const messages = useQuery(
    api.messages.getMessages,
    conversationId ? { conversationId } : "skip"
  );

  const sendMessage = useMutation(api.messages.sendMessage);

  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!conversationId)
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        Select a user to start chatting
      </div>
    );

  if (!messages)
    return <div className="flex flex-1 items-center justify-center">Loading...</div>;

  const handleSend = async () => {
    if (!text.trim()) return;

    await sendMessage({
      conversationId,
      senderId: user!.id,
      content: text,
    });

    setText("");
  };

  return (
    <div className="flex flex-1 flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`max-w-xs rounded-lg px-3 py-2 text-sm ${
              msg.senderId === user!.id
                ? "ml-auto bg-primary text-white"
                : "bg-muted"
            }`}
          >
            {msg.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t p-3 flex gap-2">
        <input
          className="flex-1 rounded-md border px-3 py-2 text-sm"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
        />
        <button
          onClick={handleSend}
          className="rounded-md bg-primary px-4 py-2 text-white text-sm"
        >
          Send
        </button>
      </div>
    </div>
  );
}
