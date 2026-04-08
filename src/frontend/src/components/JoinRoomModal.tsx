import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, Users, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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
const randomName = () =>
  `${ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]}${Math.floor(10 + Math.random() * 90)}`;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefillRoomId?: string;
}

export default function JoinRoomModal({
  open,
  onOpenChange,
  prefillRoomId = "",
}: Props) {
  const [roomId, setRoomId] = useState(prefillRoomId);
  const [name, setName] = useState(() => randomName());
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { actor } = useActor();

  useEffect(() => {
    if (prefillRoomId) setRoomId(prefillRoomId);
  }, [prefillRoomId]);

  const handleJoin = async () => {
    const rid = roomId.trim();
    if (!rid) {
      toast.error("Please enter a room code");
      return;
    }
    if (!actor) {
      toast.error("Not connected yet, please wait");
      return;
    }
    setLoading(true);
    try {
      const exists = await actor.roomExists(rid);
      if (!exists) {
        toast.error("Room not found. Check the code and try again.");
        return;
      }
      const finalName = name.trim() || randomName();
      sessionStorage.setItem(`qr_name_${rid}`, finalName);
      onOpenChange(false);
      navigate({ to: "/room/$roomId", params: { roomId: rid } });
    } catch {
      toast.error("Failed to check room. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="bg-card border-border sm:max-w-md"
        data-ocid="join_room.dialog"
      >
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <DialogTitle className="font-heading text-xl">
              Join a Room
            </DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground">
            Enter the room code shared with you. No account needed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label
              htmlFor="join-room-id"
              className="text-sm font-medium text-foreground"
            >
              Room Code
            </Label>
            <Input
              id="join-room-id"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value.trim())}
              placeholder="e.g. abc123"
              className="bg-input border-border focus:border-primary/60 font-mono text-foreground placeholder:text-muted-foreground"
              autoFocus={!prefillRoomId}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              data-ocid="join_room.input"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="join-name"
              className="text-sm font-medium text-foreground"
            >
              Display Name{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Input
              id="join-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={randomName()}
              className="bg-input border-border focus:border-primary/60 text-foreground placeholder:text-muted-foreground"
              maxLength={30}
              data-ocid="join_room.name_input"
            />
            <p className="text-[11px] text-muted-foreground">
              Leave blank for a random identity
            </p>
          </div>

          <div className="flex gap-3 pt-1">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-border"
              data-ocid="join_room.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleJoin}
              disabled={loading || !roomId.trim()}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
              data-ocid="join_room.submit_button"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Joining…
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" /> Join Room
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
