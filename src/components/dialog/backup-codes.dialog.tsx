import { useState } from "react";
import useMeasure from "react-use-measure";
import { CheckCircle, Copy, Loader2, RectangleEllipsisIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import PasswordInput from "~/components/input/password.input";
import { TransitionPanel } from "~/components/ui/transition-panel";
import { twoFactor } from "~/utils/client/auth";

export function BackupCodesDialog() {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [ref, bounds] = useMeasure();
  const [direction, setDirection] = useState(1);

  const handleSetActiveIndex = (newIndex: number) => {
    setDirection(newIndex > activeIndex ? 1 : -1);
    setActiveIndex(newIndex);
  };

  const handleClose = () => {
    setOpen(false);
    // Reset state after dialog closes
    setTimeout(() => {
      setPassword("");
      setError("");
      setBackupCodes([]);
      setActiveIndex(0);
    }, 300);
  };

  const fetchBackupCodes = async () => {
    if (!password) {
      setError("Please enter your password");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await twoFactor.generateBackupCodes({ password });
      
      if (response.error) {
        if (response.error.code === "INVALID_PASSWORD") {
          setError("Incorrect password. Please try again.");
        } else {
          setError(response.error.message || "Failed to fetch backup codes");
        }
        return;
      }

      if (response.data.backupCodes) {
        setBackupCodes(response.data.backupCodes);
        handleSetActiveIndex(1);
      }
    } catch (err) {
      setError("An error occurred while fetching backup codes");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateNewBackupCodes = async () => {
    if (!password) return;
    
    setIsLoading(true);
    setError("");

    try {
      const response = await twoFactor.generateBackupCodes({ password });
      
      if (response.error) {
        setError(response.error.message || "Failed to generate new backup codes");
        return;
      }

      if (response.data.backupCodes) {
        setBackupCodes(response.data.backupCodes);
        toast.success("New backup codes generated successfully");
      }
    } catch (err) {
      setError("An error occurred while generating new backup codes");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(backupCodes.join("\n"));
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      toast.success("Backup codes copied to clipboard");
    } catch (err) {
      toast.error("Failed to copy backup codes");
    }
  };

  const downloadBackupCodes = () => {
    const element = document.createElement("a");
    const file = new Blob([backupCodes.join("\n")], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = 'backup-codes.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const TABS = [
    {
      id: "password",
      title: "Enter your password",
      description: "Please enter your password to view your backup codes.",
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder="Enter your password"
              disabled={isLoading}
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={fetchBackupCodes}
              disabled={!password || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </div>
        </div>
      ),
    },
    {
      id: "backupCodes",
      title: "Your Backup Codes",
      description: "Save these codes in a safe place. Each code can only be used once.",
      content: (
        <div className="space-y-6">
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {backupCodes.map((code) => (
                <div key={`backup-code-${code}`} className="font-mono text-sm p-2 bg-background rounded">
                  {code}
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Each code can only be used once. Generate new codes if you run low.
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={copyToClipboard}
              disabled={isLoading}
              className="w-full"
            >
              {isCopied ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy to Clipboard
                </>
              )}
            </Button>
            
            <Button 
              type="button" 
              variant="outline"
              onClick={downloadBackupCodes}
              disabled={isLoading}
              className="w-full"
            >
              Download as Text File
            </Button>
            
            <Button 
              type="button" 
              variant="outline"
              onClick={generateNewBackupCodes}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate New Codes"
              )}
            </Button>
            
            <div className="pt-2">
              <Button 
                type="button" 
                onClick={handleClose}
                className="w-full"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          handleClose();
        }
        setOpen(isOpen);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <RectangleEllipsisIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{TABS[activeIndex].title}</DialogTitle>
          <DialogDescription>{TABS[activeIndex].description}</DialogDescription>
        </DialogHeader>
        <TransitionPanel
          activeIndex={activeIndex}
          variants={{
            enter: (dir: number) => ({
              x: dir > 0 ? 364 : -364,
              opacity: 0,
              height: bounds.height > 0 ? bounds.height : "auto",
              position: "initial",
            }),
            center: {
              zIndex: 1,
              x: 0,
              opacity: 1,
              height: bounds.height > 0 ? bounds.height : "auto",
            },
            exit: (dir: number) => ({
              zIndex: 0,
              x: dir < 0 ? 364 : -364,
              opacity: 0,
              position: "absolute",
              top: 0,
              width: "100%",
            }),
          }}
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          custom={direction}
        >
          {TABS.map((tab, index) => (
            <div
              key={tab.id}
              className={index === activeIndex ? "block" : "hidden"}
              ref={ref}
            >
              {tab.content}
            </div>
          ))}
        </TransitionPanel>
      </DialogContent>
    </Dialog>
  );
}
