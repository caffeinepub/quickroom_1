import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import {
  Globe,
  Lock,
  MessageSquare,
  Shield,
  Trash2,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import CreateRoomModal from "../components/CreateRoomModal";
import JoinRoomModal from "../components/JoinRoomModal";

const PREVIEW_MESSAGES = [
  {
    name: "Ghost42",
    msg: "Hey everyone! 👋",
    time: "2:41 PM",
    color: "bg-primary/80",
  },
  {
    name: "Cyber99",
    msg: "No signup needed, love it!",
    time: "2:42 PM",
    color: "bg-purple-500/80",
  },
  {
    name: "Nova77",
    msg: "Messages vanish after session 🔥",
    time: "2:43 PM",
    color: "bg-emerald-500/80",
  },
];

const SHOWCASE_MESSAGES = [
  { name: "Ghost42", msg: "Anyone here? 👋", color: "bg-primary/80" },
  {
    name: "Cyber99",
    msg: "Yep! No login needed, perfect.",
    color: "bg-purple-500/80",
  },
  {
    name: "Nova77",
    msg: "This is so clean and fast 🚀",
    color: "bg-emerald-500/80",
  },
  {
    name: "Pixel11",
    msg: "Messages disappear when we leave — 🔒",
    color: "bg-orange-500/80",
  },
  {
    name: "Ghost42",
    msg: "Exactly the point! Privacy first.",
    color: "bg-primary/80",
  },
];

function Navbar({
  onJoin,
  onCreate,
}: { onJoin: () => void; onCreate: () => void }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2.5" data-ocid="nav.link">
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center glow-teal-sm">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <span className="font-heading font-bold text-lg text-foreground tracking-tight">
            QuickRoom
          </span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            data-ocid="nav.features.link"
          >
            Product
          </a>
          <a
            href="#showcase"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            data-ocid="nav.security.link"
          >
            Security
          </a>
          <a
            href="#features"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            data-ocid="nav.pricing.link"
          >
            Pricing
          </a>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onJoin}
            className="border-primary/60 text-primary hover:bg-primary/10 hover:border-primary"
            data-ocid="nav.join_room.button"
          >
            Join Room
          </Button>
          <Button
            size="sm"
            onClick={onCreate}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
            data-ocid="nav.create_room.button"
          >
            Create Room
          </Button>
        </div>
      </div>
    </nav>
  );
}

function HeroChatPreview() {
  return (
    <motion.div
      className="relative"
      animate={{ y: [0, -8, 0] }}
      transition={{
        duration: 4,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      }}
    >
      <div className="absolute inset-0 blur-3xl bg-primary/20 rounded-3xl scale-90" />

      <div className="relative bg-card border border-border rounded-2xl overflow-hidden shadow-teal-glow w-full max-w-md">
        <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse-teal" />
            <span className="text-sm font-medium text-foreground">
              Room: abc123
            </span>
          </div>
          <span className="text-xs text-muted-foreground">3 online</span>
        </div>

        <div className="p-4 space-y-3 bg-background/60">
          {PREVIEW_MESSAGES.map((m) => (
            <div key={m.name} className="flex items-start gap-2.5">
              <div
                className={`w-7 h-7 rounded-full ${m.color} flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}
              >
                {m.name[0]}
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-semibold text-foreground">
                    {m.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {m.time}
                  </span>
                </div>
                <p className="text-sm text-foreground/90 mt-0.5">{m.msg}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="px-4 py-3 border-t border-border bg-muted/20 flex items-center gap-2">
          <div className="flex-1 bg-input rounded-lg px-3 py-2 text-xs text-muted-foreground">
            Type a message…
          </div>
          <div
            className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center cursor-pointer"
            aria-hidden="true"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="text-primary-foreground"
              transform="rotate(90)"
              aria-hidden="true"
            >
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-4 -right-4 bg-card border border-primary/40 rounded-xl px-3 py-2 flex items-center gap-2 shadow-teal-glow-sm">
        <div className="w-2 h-2 rounded-full bg-primary" />
        <span className="text-xs text-foreground font-medium">
          No account needed
        </span>
      </div>
    </motion.div>
  );
}

const features = [
  {
    icon: Zap,
    title: "Instant Setup",
    description:
      "Create a room in one click. No registration, no email, no password. Just click and chat.",
  },
  {
    icon: Shield,
    title: "Anonymous Identity",
    description:
      "Every session gets a random identity. No tracking, no profiles, complete privacy.",
  },
  {
    icon: Trash2,
    title: "Self-Destructing Messages",
    description:
      "Messages exist only during your session. Close the tab and everything disappears forever.",
  },
];

const footerLinks = {
  Product: ["Features", "Security", "Roadmap", "Changelog"],
  Resources: ["Documentation", "API", "Status", "Support"],
  Company: ["About", "Blog", "Careers", "Press"],
  Legal: ["Privacy", "Terms", "Cookies", "Licenses"],
};

export default function LandingPage() {
  const [joinOpen, setJoinOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const navigate = useNavigate();

  const search =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();
  const joinParam = search.get("join") ?? "";

  const handleRoomCreated = (roomId: string) => {
    navigate({ to: "/room/$roomId", params: { roomId } });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar
        onJoin={() => setJoinOpen(true)}
        onCreate={() => setCreateOpen(true)}
      />

      {/* Hero */}
      <section className="pt-32 pb-24 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/40 bg-primary/10 text-primary text-xs font-medium mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              No signup required · Instant messaging
            </div>

            <h1 className="font-heading text-5xl sm:text-6xl font-extrabold leading-[1.08] tracking-tight mb-6">
              Chat Instantly.
              <span className="block text-primary">No Account Needed.</span>
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
              Create a temporary group chat in seconds. Share the link, anyone
              joins. Messages vanish when the room closes — privacy by design.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                onClick={() => setCreateOpen(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-base px-8 shadow-teal-glow"
                data-ocid="hero.create_room.primary_button"
              >
                <Zap className="w-4 h-4 mr-2" />
                Create Your Instant Room
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setJoinOpen(true)}
                className="border-border text-foreground hover:bg-muted hover:border-primary/60 text-base px-8"
                data-ocid="hero.join_room.secondary_button"
              >
                <Users className="w-4 h-4 mr-2" />
                Join a Room
              </Button>
            </div>

            <div className="flex items-center gap-6 mt-10">
              {[
                { icon: Lock, text: "Zero data stored" },
                { icon: Globe, text: "Works anywhere" },
                { icon: Users, text: "Unlimited members" },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground"
                >
                  <Icon className="w-3.5 h-3.5 text-primary" />
                  {text}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex justify-center lg:justify-end"
          >
            <HeroChatPreview />
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="py-24 px-4 sm:px-6 border-t border-border"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4">
              Built for speed and privacy
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Everything you need for spontaneous group conversations — nothing
              you don't.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, description }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-card border border-border rounded-2xl p-6 hover:border-primary/40 hover:shadow-teal-glow-sm transition-all duration-300"
                data-ocid={`features.item.${i + 1}`}
              >
                <div className="w-11 h-11 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase */}
      <section id="showcase" className="py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4">
              Active QuickRoom Chat Interface
            </h2>
            <p className="text-muted-foreground">
              A glimpse at how your temporary chat room looks in action.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-card border border-border rounded-2xl overflow-hidden shadow-teal-glow max-w-4xl mx-auto"
          >
            <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
              </div>
              <div className="flex-1 mx-4 bg-background/60 rounded-md px-3 py-1 text-xs text-muted-foreground text-center">
                quickroom.app/room/abc123
              </div>
            </div>

            <div className="flex h-80">
              <div className="w-52 border-r border-border bg-muted/10 p-3 hidden sm:block">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Online · 4
                </p>
                {["Ghost42", "Cyber99", "Nova77", "Pixel11"].map((name, i) => (
                  <div key={name} className="flex items-center gap-2 mb-2">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${
                        [
                          "bg-primary/80",
                          "bg-purple-500/80",
                          "bg-emerald-500/80",
                          "bg-orange-500/80",
                        ][i]
                      }`}
                    >
                      {name[0]}
                    </div>
                    <span className="text-xs text-foreground">{name}</span>
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                  </div>
                ))}
              </div>

              <div className="flex-1 flex flex-col">
                <div className="flex-1 p-4 space-y-3 overflow-hidden">
                  {SHOWCASE_MESSAGES.map((m) => (
                    <div
                      key={`${m.name}-${m.msg}`}
                      className="flex items-start gap-2"
                    >
                      <div
                        className={`w-6 h-6 rounded-full ${m.color} flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0`}
                      >
                        {m.name[0]}
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-foreground">
                          {m.name}{" "}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          · now
                        </span>
                        <p className="text-sm text-foreground/90">{m.msg}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3 border-t border-border flex gap-2">
                  <div className="flex-1 bg-input rounded-lg px-3 py-2 text-xs text-muted-foreground">
                    Say something…
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                    <MessageSquare className="w-3.5 h-3.5 text-primary-foreground" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-4 sm:px-6 border-t border-border">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="font-heading text-4xl font-bold mb-4">
            Ready to start chatting?
          </h2>
          <p className="text-muted-foreground mb-8">
            No account. No tracking. Just a room and a link.
          </p>
          <Button
            size="lg"
            onClick={() => setCreateOpen(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-base px-10 shadow-teal-glow"
            data-ocid="cta.create_room.primary_button"
          >
            <Zap className="w-4 h-4 mr-2" />
            Create a Free Room
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="font-heading font-bold text-base">
                  QuickRoom
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Temporary group chats for everyone. No signup, no traces.
              </p>
            </div>

            {Object.entries(footerLinks).map(([section, links]) => (
              <div key={section}>
                <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">
                  {section}
                </p>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-transparent border-0 p-0"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} QuickRoom. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              Built with ❤️ using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>

      <JoinRoomModal
        open={joinOpen || !!joinParam}
        onOpenChange={(open) => {
          setJoinOpen(open);
          if (!open && joinParam) {
            window.history.replaceState({}, "", window.location.pathname);
          }
        }}
        prefillRoomId={joinParam}
      />
      <CreateRoomModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onRoomCreated={handleRoomCreated}
      />
    </div>
  );
}
