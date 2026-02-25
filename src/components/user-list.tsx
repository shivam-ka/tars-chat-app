"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";

import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Props {
  onSelect: (userId: string) => void;
  selectedUserId: string | null;
}

export default function UserList({ onSelect, selectedUserId }: Props) {
  const { user } = useUser();

  const users = useQuery(
    api.users.getUsersWithLastMessage,
    user ? { currentUserId: user.id } : "skip",
  );

  const [search, setSearch] = useState("");

  // 🔹 Loading State
  if (!users || !user) {
    return (
      <div className="bg-background flex h-full w-80 flex-col border-r">
        <div className="border-b p-4">
          <div className="bg-muted h-9 w-full animate-pulse rounded-md" />
        </div>

        <div className="space-y-4 p-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="bg-muted h-10 w-10 animate-pulse rounded-full" />
              <div className="bg-muted h-4 w-32 animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const filteredUsers = users
    .filter((u) => u.clerkId !== user.id)
    .filter((u) => u.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-background flex h-full w-full flex-col border-r">
      {/* Header */}
      <div className="border-b p-4">
        <h2 className="mb-3 text-lg font-semibold">Messages</h2>
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* User List */}
      <ScrollArea className="flex-1">
        <div className="space-y-1 p-2">
          {filteredUsers.length === 0 ? (
            <div className="text-muted-foreground mt-10 text-center text-sm">
              No users found.
            </div>
          ) : (
            filteredUsers.map((u) => {
              const isSelected = selectedUserId === u.clerkId;

              return (
                <div
                  key={u._id}
                  onClick={() => onSelect(u.clerkId)}
                  className={cn(
                    "relative flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition",
                    isSelected ? "bg-accent" : "hover:bg-accent/60",
                  )}
                >
                  {/* Avatar */}
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={u.image} />
                      <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                    </Avatar>

                    {u.isOnline && (
                      <span className="border-background absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 bg-green-500" />
                    )}
                  </div>

                  {/* Name + Last Message */}
                  <div className="flex flex-1 flex-col overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="truncate text-sm font-medium">
                        {u.name}
                      </span>

                      {u.lastMessage && (
                        <span className="text-muted-foreground text-xs">
                          {new Date(u.lastMessage.createdAt).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </span>
                      )}
                    </div>

                    {u.lastMessage ? (
                      <span className="text-muted-foreground truncate text-xs">
                        {u.lastMessage.senderId === user.id && "You: "}
                        {u.lastMessage.content}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs">
                        No messages yet
                      </span>
                    )}

                    {u.unreadCount > 0 && (
                      <span className="absolute right-2 bottom-2 flex size-4 items-center justify-center rounded-full bg-green-600 text-[10px] text-white dark:bg-green-700">
                        {u.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
