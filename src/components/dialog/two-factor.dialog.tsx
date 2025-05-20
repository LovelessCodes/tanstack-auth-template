import { useState, useEffect } from "react";
import useMeasure from "react-use-measure";
import { CheckCircle, Copy, Loader2, RefreshCw } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
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
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import PasswordInput from "~/components/input/password.input";
import { TransitionPanel } from "~/components/ui/transition-panel";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "~/components/ui/input-otp";
import { twoFactor } from "~/utils/client/auth";
import { useRouter } from "@tanstack/react-router";

interface TwoFactorDialogProps {
  is2FAEnabled: boolean;
}

export function TwoFactorDialog({
  is2FAEnabled,
}: TwoFactorDialogProps) {
  const [direction, setDirection] = useState(1);
	const [activeIndex, setActiveIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [ref, bounds] = useMeasure();
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [secret, setSecret] = useState("");
  const [qrCodeUri, setQrCodeUri] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const [isCopied, setIsCopied] = useState(false);
  const router = useRouter();


	const handleSetActiveIndex = (newIndex: number) => {
		setDirection(newIndex > activeIndex ? 1 : -1);
		setActiveIndex(newIndex);
	};

  const handleClose = () => {
    setOpen(false);
    setPassword("");
    setOtp("");
    setError("");
    handleSetActiveIndex(0);
    setSecret("");
    setQrCodeUri("");
    setTimeLeft(30);
    setIsCopied(false);
  };

  const handleEnable2FA = async () => {
    if (!password) {
      setError("Please enter your password");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    toast.promise(
      twoFactor.enable({
        password,
        issuer: "tanstack-auth-template",
      }),
      {
        loading: "Verifying password...",
        success: (d) => {
          if (d.error) {
            throw d.error;
          }
          const url = new URL(d.data.totpURI);
          setSecret(url.searchParams.get("secret") || "");
          setQrCodeUri(d.data.totpURI);
          handleSetActiveIndex(1);
          return "Password verified successfully";
        },
        error: (e) => {
          return e.message;
        },
      }
    );
  };

  const handleVerify2FA = async () => {
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    toast.promise(
      twoFactor.verifyTotp({
        code: otp,
      }),
      {
        loading: "Verifying code...",
        success: () => {
          handleSetActiveIndex(3);
          router.invalidate();
          return "Two factor authentication enabled successfully";
        },
        error: (e) => {
          return e.message;
        },
      }
    );
  };

  const handleDisable2FA = async () => {
    if (!password) {
      setError("Please enter your password");
      return;
    }

    toast.promise(
      twoFactor.disable({
        password,
      }),
      {
        loading: "Disabling two-factor authentication...",
        success: () => {
          handleSetActiveIndex(3);
          router.invalidate();
          return "Two-factor authentication disabled successfully";
        },
        error: (e) => {
          return e.message;
        },
      }
    );
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      toast.success("Copied to clipboard");
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const TABS = [
    {
      id: "password",
      title: "Confirm your password",
      description: "Enter your password to enable two-factor authentication.",
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={is2FAEnabled ? handleDisable2FA : handleEnable2FA}
              disabled={!password}
            >
              {is2FAEnabled ? "Disable 2FA" : "Continue"}
            </Button>
          </div>
        </div>
      )
    },
    {
      id: "qrCode",
      title: "Set up two-factor authentication",
      description: "Scan the QR code below with your authenticator app or enter the secret key manually.",
      content: (
        <>
          <div className="flex flex-col items-center space-y-4">
            <div className="rounded-lg border bg-white p-4">
              <QRCodeSVG value={qrCodeUri} size={200} />
            </div>

            <div className="w-full space-y-2">
              <Label>Or enter this code manually</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={secret}
                  readOnly
                  className="font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(secret)}
                >
                  {isCopied ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                If you can't scan the QR code, enter this code in your authenticator
                app.
              </p>
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                handleSetActiveIndex(2);
                setTimeLeft(30);
              }}
            >
              I've set up my authenticator
            </Button>
          </div>
        </>
      )
    },
    {
      id: "verify",
      title: "Verify your authenticator app",
      description: "Enter the 6-digit code from your authenticator app.",
      content: (
        <>
          <div className="flex flex-col items-center space-y-4">
            <InputOTP maxLength={6} value={otp} onChange={(value) => setOtp(value)}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Code expires in {timeLeft} seconds</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setTimeLeft(30)}
              >
                <RefreshCw className="h-3 w-3" />
                <span className="sr-only">Refresh</span>
              </Button>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <div className="flex justify-between pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleSetActiveIndex(1)}
            >
              Back
            </Button>
            <Button
              type="button"
              onClick={handleVerify2FA}
              disabled={otp.length !== 6}
            >
              Verify and enable
            </Button>
          </div>
        </>
      )
    },
    {
      id: "success",
      title: !is2FAEnabled ? "Two-factor disabled" : "Two-factor enabled",
      description: !is2FAEnabled ? "Two-factor authentication has been disabled successfully." : "Two-factor authentication has been enabled successfully.",
      content: (
        <div className="flex flex-col items-center space-y-6 text-center">
          <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium">{!is2FAEnabled ? "Two-factor disabled" : "Two-factor enabled"}</h3>
            <p className="text-sm text-muted-foreground">
              {!is2FAEnabled ? "Two-factor authentication has been successfully disabled for your account." : "Two-factor authentication has been successfully enabled for your account."}
            </p>
          </div>
          <Button
            className="w-full"
            onClick={handleClose}
          >
            Done
          </Button>
        </div>
      )
    }
  ];

  return (
    <Dialog open={open} onOpenChange={isOpen => {
      if (!isOpen) {
        handleClose();
      }
      setOpen(isOpen);
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => setOpen(true)}>{is2FAEnabled ? "Disable two-factor authentication" : "Enable two-factor authentication"}</Button>
      </DialogTrigger>
      <DialogContent className="overflow-x-hidden px-16">
        <DialogHeader>
          <DialogTitle>
            {TABS[activeIndex].title}
          </DialogTitle>
          <DialogDescription>
            {TABS[activeIndex].description}
          </DialogDescription>
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
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              key={index}
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
