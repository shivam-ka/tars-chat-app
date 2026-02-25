"use client";

import { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Check, CheckCheck, SendHorizonal } from "lucide-react";
import { cn, formatDateLabel } from "@/lib/utils";

interface ChatWindowProps {
  conversationId: Id<"conversations"> | null;
  handleBack: () => void;
}

export default function ChatWindow({
  conversationId,
  handleBack,
}: ChatWindowProps) {
  const { user } = useUser();

  // ---------------- MUTATIONS ----------------
  const sendMessage = useMutation(api.messages.sendMessage);
  const markAsRead = useMutation(api.messages.markAsRead);
  const setTypingStatus = useMutation(api.typing.setTypingStatus);

  // ---------------- QUERIES ----------------
  const messages = useQuery(
    api.messages.getMessages,
    conversationId ? { conversationId } : "skip",
  );

  const typingUser = useQuery(
    api.typing.getTypingStatus,
    conversationId && user
      ? {
          conversationId,
          currentUserId: user.id,
        }
      : "skip",
  );

  // ---------------- STATES ----------------
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  // ---------------- AUTO SCROLL ----------------
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUser]);

  // ---------------- MARK AS READ ----------------
  useEffect(() => {
    if (conversationId && user) {
      markAsRead({
        conversationId,
        userId: user.id,
      });
    }
  }, [conversationId, user, markAsRead]);

  // ---------------- HANDLE TYPING ----------------
  const handleTyping = (value: string) => {
    setNewMessage(value);

    if (!conversationId || !user) return;

    // Start typing
    setTypingStatus({
      conversationId,
      userId: user.id,
      isTyping: true,
    });

    // Clear previous timeout
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeout.current = setTimeout(() => {
      setTypingStatus({
        conversationId,
        userId: user.id,
        isTyping: false,
      });
    }, 2000);
  };

  // ---------------- HANDLE SEND ----------------
  const handleSend = async () => {
    if (!newMessage.trim() || isSending || !user) return;

    setIsSending(true);

    await sendMessage({
      conversationId: conversationId!,
      senderId: user.id,
      content: newMessage,
    });

    // Stop typing immediately
    await setTypingStatus({
      conversationId: conversationId!,
      userId: user.id,
      isTyping: false,
    });

    setNewMessage("");
    setIsSending(false);
  };

  // ---------------- UI STATES ----------------
  if (!conversationId) {
    return (
      <div className="bg-background text-muted-foreground flex h-full items-center justify-center">
        Select a conversation
      </div>
    );
  }

  if (!messages || !user) {
    return (
      <div className="bg-background flex h-full items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-background flex h-full flex-col">
      {/* Header */}
      <div className="border-border flex items-center justify-between border-b px-3 py-2">
        <Button variant="outline" size="sm" onClick={handleBack}>
          <ArrowLeft className="mr-2 size-4" />
          Back
        </Button>

        {/* Typing Indicator */}
        {typingUser && (
          <p className="text-muted-foreground mt-2 animate-pulse text-sm">
            Typing...
          </p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full px-4 py-6">
          <div className="flex flex-col gap-3">
            {messages.map((msg, index) => {
              const isMe = msg.senderId === user.id;

              const currentDate = formatDateLabel(msg.createdAt);
              const previousMessage = messages[index - 1];
              const previousDate = previousMessage
                ? formatDateLabel(previousMessage.createdAt)
                : null;

              const showDate = currentDate !== previousDate;

              return (
                <div key={msg._id}>
                  {showDate && (
                    <div className="my-6 flex justify-center">
                      <div className="bg-muted text-muted-foreground rounded-sm px-3 py-1 text-xs">
                        {currentDate}
                      </div>
                    </div>
                  )}

                  <div
                    className={cn(
                      "flex px-2",
                      isMe ? "justify-end" : "justify-start",
                    )}
                  >
                    <div className="relative max-w-[75%]">
                      <div
                        className={cn(
                          "relative rounded-2xl px-4 py-2 text-sm shadow-sm",
                          isMe
                            ? "bg-primary text-primary-foreground rounded-br-xs"
                            : "bg-muted text-foreground rounded-bl-xs",
                        )}
                      >
                        <span className="block pr-12 wrap-break-word">
                          {msg.content}
                        </span>

                        <div className="absolute right-2 bottom-1 flex items-center gap-1 text-[10px] opacity-80">
                          <span>
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>

                          {isMe &&
                            (msg.read ? (
                              <CheckCheck size={14} />
                            ) : (
                              <Check size={14} />
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <div ref={bottomRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input */}
      <div className="border-border bg-background border-t p-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Type a message"
            value={newMessage}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="rounded-full"
          />
          <Button
            onClick={handleSend}
            disabled={isSending}
            className="rounded-full px-6"
          >
            <SendHorizonal className="mr-2 size-4" />
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
