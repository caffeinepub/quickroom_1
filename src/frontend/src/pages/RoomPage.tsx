import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  Check,
  Copy,
  LogOut,
  MessageSquare,
  Send,
  Users,
  Wifi,
  WifiOff,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Message, User } from "../backend.d";
import { useActor } from "../hooks/useActor";

const ADJECTIVES = [
  "Ghost",
  "Cyber",
  "Nova",
  "Pixel",
  "Neon",
  "Echo",
  "Blaze",
  "Storm",
  "Flux",
  "Vex",
];
const NUMBERS = () => Math.floor(10 + Math.random() * 90);

function randomName() {
  return `${ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]}${NUMBERS()}`;
}

function formatTime(ts: bigint): string {
  const d = new Date(Number(ts) / 1_000_000);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const AVATAR_COLORS = [
  "bg-primary/80",
  "bg-purple-500/80",
  "bg-emerald-500/80",
  "bg-orange-500/80",
  "bg-pink-500/80",
  "bg-yellow-500/80",
  "bg-blue-500/80",
  "bg-red-500/80",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function AvatarCircle({
  name,
  size = "md",
}: { name: string; size?: "sm" | "md" }) {
  const sz = size === "sm" ? "w-7 h-7 text-xs" : "w-9 h-9 text-sm";
  return (
    <div
      className={`${sz} rounded-full ${getAvatarColor(name)} flex items-center justify-center font-bold text-white flex-shrink-0`}
    >
      {name[0]?.toUpperCase() ?? "?"}
    </div>
  );
}

export default function RoomPage() {
  const { roomId } = useParams({ from: "/room/$roomId" });
  const navigate = useNavigate();
  const { actor, isFetching } = useActor();

  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [displayName] = useState(() => {
    const stored = sessionStorage.getItem(`qr_name_${roomId}`);
    return stored ?? randomName();
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [connected, setConnected] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [roomNotFound, setRoomNotFound] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sessionRef = useRef<string | null>(null);
  const actorRef = useRef(actor);
  actorRef.current = actor;

  // Join room on mount
  useEffect(() => {
    if (!actor || isFetching || sessionToken) return;

    let cancelled = false;
    async function join() {
      try {
        const exists = await actor!.roomExists(roomId);
        if (!exists) {
          setRoomNotFound(true);
          return;
        }
        const token = await actor!.joinRoom(roomId, displayName);
        if (cancelled) return;
        setSessionToken(token);
        sessionRef.current = token;
        setConnected(true);
        toast.success(`Joined as ${displayName}`);
      } catch (e) {
        console.error("Join failed", e);
        toast.error("Failed to join room");
      }
    }
    join();
    return () => {
      cancelled = true;
    };
  }, [actor, isFetching, roomId, displayName, sessionToken]);

  // Polling: messages + users every 2s
  useEffect(() => {
    if (!sessionToken) return;
    const poll = async () => {
      if (!actorRef.current) return;
      try {
        const [msgs, usrs] = await Promise.all([
          actorRef.current.getMessages(roomId),
          actorRef.current.getActiveUsers(roomId),
        ]);
        setMessages(msgs);
        setUsers(usrs);
      } catch {
        // silent
      }
    };
    poll();
    const id = setInterval(poll, 2000);
    return () => clearInterval(id);
  }, [sessionToken, roomId]);

  // Heartbeat every 15s
  useEffect(() => {
    if (!sessionToken) return;
    const id = setInterval(async () => {
      if (!actorRef.current || !sessionRef.current) return;
      try {
        await actorRef.current.ping(roomId, sessionRef.current);
      } catch {
        // silent
      }
    }, 15000);
    return () => clearInterval(id);
  }, [sessionToken, roomId]);

  // Leave on unmount
  useEffect(() => {
    return () => {
      if (actorRef.current && sessionRef.current) {
        actorRef.current.leaveRoom(roomId, sessionRef.current).catch(() => {});
      }
    };
  }, [roomId]);

  // Auto-scroll to bottom when message count changes
  const messageCount = messages.length;
  // biome-ignore lint/correctness/useExhaustiveDependencies: messageCount is derived from messages, triggers scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messageCount]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || !actor || !sessionToken || sending) return;

    setSending(true);
    setInput("");
    // Optimistic update
    const optimistic: Message = {
      text,
      sender: displayName,
      timestamp: BigInt(Date.now()) * 1_000_000n,
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      await actor.sendMessage(roomId, sessionToken, text);
    } catch {
      toast.error("Failed to send message");
      setMessages((prev) => prev.filter((m) => m !== optimistic));
      setInput(text);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }, [input, actor, sessionToken, sending, displayName, roomId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Room link copied!");
  };

  const handleLeave = async () => {
    if (actor && sessionToken) {
      try {
        await actor.leaveRoom(roomId, sessionToken);
      } catch {
        // silent
      }
      sessionRef.current = null;
      setSessionToken(null);
    }
    navigate({ to: "/" });
  };

  if (roomNotFound) {
    return (
      <div
        className="min-h-screen bg-background flex items-center justify-center p-4"
        data-ocid="room.error_state"
      >
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center mx-auto mb-4">
            <WifiOff className="w-7 h-7 text-muted-foreground" />
          </div>
          <h2 className="font-heading text-2xl font-bold mb-2">
            Room Not Found
          </h2>
          <p className="text-muted-foreground mb-6">
            This room doesn't exist or has expired.
          </p>
          <Button
            onClick={() => navigate({ to: "/" })}
            className="bg-primary text-primary-foreground"
            data-ocid="room.go_home.button"
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  if (!sessionToken) {
    return (
      <div
        className="min-h-screen bg-background flex items-center justify-center"
        data-ocid="room.loading_state"
      >
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Joining room…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Top bar */}
      <header className="flex-shrink-0 h-14 border-b border-border bg-card/80 backdrop-blur-sm px-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <a href="/" className="flex-shrink-0">
            <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-primary" />
            </div>
          </a>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-sm text-foreground truncate">
                Room: {roomId}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-xs text-primary">
                <Wifi className="w-3 h-3" />
                {connected ? "Live" : "Connecting"}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              You are{" "}
              <span className="text-primary font-medium">{displayName}</span> ·{" "}
              {users.length} online
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-muted/40 border border-border rounded-lg">
            <span className="text-xs text-muted-foreground">Code:</span>
            <span className="text-xs font-mono font-bold text-foreground">
              {roomId}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="border-border hover:border-primary/50 text-xs gap-1.5"
            data-ocid="room.copy_link.button"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-primary" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">
              {copied ? "Copied!" : "Copy Link"}
            </span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSidebarOpen((o) => !o)}
            className="sm:hidden border-border"
            data-ocid="room.users.toggle"
          >
            <Users className="w-3.5 h-3.5" />
            <span className="ml-1 text-xs">{users.length}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLeave}
            className="border-destructive/50 text-destructive hover:bg-destructive/10 text-xs gap-1.5"
            data-ocid="room.leave.button"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Leave</span>
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="border-r border-border bg-card/50 flex-shrink-0 hidden sm:flex flex-col w-52">
          <div className="px-4 pt-4 pb-2">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Online · {users.length}
            </p>
          </div>
          <ScrollArea className="flex-1">
            <div className="px-3 pb-4 space-y-1">
              {users.length === 0 ? (
                <p className="text-xs text-muted-foreground px-1 py-2">
                  No users yet…
                </p>
              ) : (
                users.map((u, i) => (
                  <div
                    key={u.sessionToken}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/30 transition-colors ${
                      u.displayName === displayName ? "bg-primary/10" : ""
                    }`}
                    data-ocid={`users.item.${i + 1}`}
                  >
                    <AvatarCircle name={u.displayName} size="sm" />
                    <span className="text-xs text-foreground truncate flex-1">
                      {u.displayName}
                    </span>
                    {u.displayName === displayName && (
                      <span className="text-[10px] text-primary">you</span>
                    )}
                    <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </aside>

        {/* Mobile sidebar overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="sm:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            >
              <motion.aside
                initial={{ x: -200 }}
                animate={{ x: 0 }}
                exit={{ x: -200 }}
                transition={{ type: "spring", damping: 25 }}
                className="absolute left-0 top-0 bottom-0 w-60 bg-card border-r border-border p-4"
                onClick={(e) => e.stopPropagation()}
              >
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Online · {users.length}
                </p>
                <div className="space-y-1">
                  {users.map((u, i) => (
                    <div
                      key={u.sessionToken}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
                      data-ocid={`users.item.${i + 1}`}
                    >
                      <AvatarCircle name={u.displayName} size="sm" />
                      <span className="text-xs text-foreground truncate">
                        {u.displayName}
                      </span>
                      {u.displayName === displayName && (
                        <span className="text-[10px] text-primary ml-auto">
                          you
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
          >
            {messages.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center h-full text-center"
                data-ocid="messages.empty_state"
              >
                <div className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="font-heading font-semibold text-foreground mb-1">
                  No messages yet
                </p>
                <p className="text-sm text-muted-foreground">
                  Say hello! Messages vanish when everyone leaves.
                </p>
              </div>
            ) : (
              messages.map((msg, i) => (
                <motion.div
                  key={`${msg.sender}-${String(msg.timestamp)}-${i}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-start gap-3 group ${
                    msg.sender === displayName ? "flex-row-reverse" : ""
                  }`}
                  data-ocid={`messages.item.${i + 1}`}
                >
                  <AvatarCircle name={msg.sender} />
                  <div
                    className={`max-w-[70%] ${
                      msg.sender === displayName ? "items-end" : "items-start"
                    } flex flex-col`}
                  >
                    <div
                      className={`flex items-baseline gap-2 mb-1 ${
                        msg.sender === displayName ? "flex-row-reverse" : ""
                      }`}
                    >
                      <span
                        className={`text-xs font-semibold ${
                          msg.sender === displayName
                            ? "text-primary"
                            : "text-foreground"
                        }`}
                      >
                        {msg.sender}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        msg.sender === displayName
                          ? "bg-primary/20 text-foreground border border-primary/30 rounded-tr-sm"
                          : "bg-card text-foreground border border-border rounded-tl-sm"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Input bar */}
          <div className="flex-shrink-0 border-t border-border px-4 py-3 bg-card/50">
            <div className="flex items-center gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message…"
                className="flex-1 bg-input border-border focus:border-primary/60 text-foreground placeholder:text-muted-foreground h-10"
                maxLength={1000}
                autoFocus
                data-ocid="messages.input"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || sending}
                className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 w-10 p-0 flex-shrink-0 disabled:opacity-40"
                data-ocid="messages.submit_button"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5 pl-1">
              Press Enter to send · Messages are temporary
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
