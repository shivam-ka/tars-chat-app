"use client";

import { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, CheckCheck } from "lucide-react";
import { cn, formatDateLabel } from "@/lib/utils";

interface ChatWindowProps {
  conversationId: Id<"conversations"> | null;
}

export default function ChatWindow({ conversationId }: ChatWindowProps) {
  const { user } = useUser();
  const sendMessage = useMutation(api.messages.sendMessage);
  const markAsRead = useMutation(api.messages.markAsRead);

  const messages = useQuery(
    api.messages.getMessages,
    conversationId ? { conversationId } : "skip",
  );

  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (conversationId && user) {
      markAsRead({
        conversationId,
        userId: user.id,
      });
    }
  }, [conversationId, user, markAsRead]);

  if (!conversationId) {
    return (
      <div className="text-muted-foreground flex h-full items-center justify-center">
        Select a conversation
      </div>
    );
  }

  if (!messages || !user) {
    return (
      <div className="flex h-full items-center justify-center">Loading...</div>
    );
  }

  const handleSend = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);

    await sendMessage({
      conversationId,
      senderId: user.id,
      content: newMessage,
    });

    setNewMessage("");
    setIsSending(false);
  };

  return (
    <div className="bg-muted/40 flex h-full flex-col">
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
                  {/* Date Divider */}
                  {showDate && (
                    <div className="my-6 flex justify-center">
                      <div className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs shadow-sm">
                        {currentDate}
                      </div>
                    </div>
                  )}

                  {/* Message Row */}
                  <div
                    className={cn(
                      "flex px-2",
                      isMe ? "justify-end" : "justify-start",
                    )}
                  >
                    <div className="relative max-w-[75%]">
                      {/* Bubble */}
                      <div
                        className={cn(
                          "relative rounded-2xl px-4 py-2 text-sm wrap-break-word shadow-sm",
                          isMe
                            ? "rounded-br-sm bg-[#DCF8C6] text-black"
                            : "bg-background rounded-bl-sm border",
                        )}
                      >
                        {/* Message Content */}
                        <span className="block pr-12">{msg.content}</span>

                        {/* Time + Tick */}
                        <div className="text-muted-foreground absolute right-2 bottom-1 flex items-center gap-1 text-[10px]">
                          <span>
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>

                          {isMe &&
                            (msg.read ? (
                              <CheckCheck size={14} className="text-blue-500" />
                            ) : (
                              <Check size={14} />
                            ))}
                        </div>
                      </div>

                      {/* Tail */}
                      <div
                        className={cn(
                          "absolute bottom-0 h-3 w-3 rotate-45",
                          isMe
                            ? "-right-1.25 bg-[#DCF8C6]"
                            : "bg-background -left-1.25 border-b border-l",
                        )}
                      />
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
      <div className="bg-background border-t p-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Type a message"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="rounded-full"
          />
          <Button
            onClick={handleSend}
            disabled={isSending}
            className="rounded-full px-6"
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
