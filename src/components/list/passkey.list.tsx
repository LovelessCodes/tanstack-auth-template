import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Passkey } from "better-auth/plugins/passkey";
import { CheckIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import { passkey } from "~/utils/client/auth";
import { XIcon } from "lucide-react";

interface PasskeyListProps {
  passkeys: Passkey[] | null | undefined;
}

export function PasskeyList({ passkeys }: PasskeyListProps) {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const { mutate: updatePasskey } = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      passkey.updatePasskey({ id, name }),
    onSuccess: () => {
      toast.success("Passkey updated successfully");
      queryClient.invalidateQueries({ queryKey: ["passkeyList"] });
      setEditingId(null);
    },
    onError: (error: Error) => {
      toast.error("Failed to update passkey", {
        description: error.message,
      });
    },
  });

  const { mutate: deletePasskey } = useMutation({
    mutationFn: (id: string) => passkey.deletePasskey({ id }),
    onSuccess: () => {
      toast.success("Passkey deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["passkeyList"] });
    },
    onError: (error: Error) => {
      toast.error("Failed to delete passkey", {
        description: error.message,
      });
    },
  });

  const handleStartEdit = (passkey: Passkey) => {
    setEditingId(passkey.id);
    setEditName(passkey.name ?? "");
  };

  const handleSaveEdit = (id: string) => {
    if (editName.trim()) {
      updatePasskey({ id, name: editName });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  if (!passkeys?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No passkeys found. Add your first passkey to get started.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {passkeys.map((pk) => (
        <Card key={pk.id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              {editingId === pk.id ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-8 w-auto"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSaveEdit(pk.id)}
                  >
                    <CheckIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCancelEdit()}
                  >
                    <XIcon className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="font-medium">{pk.name || pk.id}</div>
              )}
              <div className="text-sm text-muted-foreground">
                {pk.deviceType} • Created {pk.createdAt.toLocaleString()} •{" "}
                {pk.backedUp ? "Backed up" : "Not backed up"}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleStartEdit(pk)}
                disabled={!!editingId}
              >
                <PencilIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive/90"
                onClick={() => {
                  if (confirm("Are you sure you want to remove this passkey?")) {
                    deletePasskey(pk.id);
                  }
                }}
                disabled={!!editingId}
              >
                <Trash2Icon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export function PasskeyListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}