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
import { Loader2, Zap } from "lucide-react";
import { useState } from "react";
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
  onRoomCreated: (roomId: string) => void;
}

export default function CreateRoomModal({
  open,
  onOpenChange,
  onRoomCreated,
}: Props) {
  const [name, setName] = useState(() => randomName());
  const [loading, setLoading] = useState(false);
  const { actor } = useActor();

  const handleCreate = async () => {
    if (!actor) {
      toast.error("Not connected yet, please wait");
      return;
    }
    setLoading(true);
    try {
      const roomId = await actor.createRoom();
      const finalName = name.trim() || randomName();
      sessionStorage.setItem(`qr_name_${roomId}`, finalName);
      toast.success(`Room created! You are ${finalName}`);
      onOpenChange(false);
      onRoomCreated(roomId);
    } catch {
      toast.error("Failed to create room. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="bg-card border-border sm:max-w-md"
        data-ocid="create_room.dialog"
      >
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center glow-teal-sm">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <DialogTitle className="font-heading text-xl">
              Create a Room
            </DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground">
            Your room will be created instantly. Share the link to invite
            others.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label
              htmlFor="create-name"
              className="text-sm font-medium text-foreground"
            >
              Your Display Name{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Input
              id="create-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={randomName()}
              className="bg-input border-border focus:border-primary/60 text-foreground placeholder:text-muted-foreground"
              maxLength={30}
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              data-ocid="create_room.name_input"
            />
            <p className="text-[11px] text-muted-foreground">
              Leave blank for a random identity. New identity every session.
            </p>
          </div>

          {/* Privacy note */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg px-4 py-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              🔒{" "}
              <span className="text-foreground font-medium">Zero traces.</span>{" "}
              Messages are never stored. Close the tab and everything
              disappears.
            </p>
          </div>

          <div className="flex gap-3 pt-1">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-border"
              data-ocid="create_room.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={loading}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
              data-ocid="create_room.submit_button"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating…
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" /> Create Room
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
