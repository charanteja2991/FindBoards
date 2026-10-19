import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

/**
 * Contextual auth prompt. Never blocks browsing — it only appears when a
 * visitor triggers an action that needs an account.
 */
export function AuthModal() {
  const { gate, closeGate } = useAuth();
  const navigate = useNavigate();

  return (
    <Dialog open={gate.open} onOpenChange={(open) => !open && closeGate()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{gate.title || "Sign in required"}</DialogTitle>
          <DialogDescription>{gate.description}</DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex flex-col gap-3">
          <Button
            onClick={() => {
              closeGate();
              navigate("/auth");
            }}
            className="w-full"
          >
            Go to Sign In / Sign Up
          </Button>
          <Button
            variant="outline"
            onClick={closeGate}
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
