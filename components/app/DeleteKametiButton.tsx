"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";

interface Props {
  kametiId: string;
  kametiName: string;
}

export default function DeleteKametiButton({ kametiId, kametiName }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const supabase = createClient();

      // Delete kameti — CASCADE in DB removes members + payments automatically
      const { error } = await supabase
        .from("kametis")
        .delete()
        .eq("id", kametiId);

      if (error) throw new Error(error.message);

      toast.success(`"${kametiName}" deleted successfully`);
      setOpen(false);
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete kameti. Please try again.");
      setDeleting(false);
    }
  }

  return (
    <>
      {/* Trigger button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="min-h-[40px] border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-medium"
        aria-label="Delete this kameti"
      >
        <Trash2 className="w-4 h-4 sm:mr-1.5" />
        <span className="hidden sm:inline">Delete</span>
      </Button>

      {/* Confirmation dialog */}
      <Dialog open={open} onOpenChange={(v) => { if (!deleting) setOpen(v); }}>
        <DialogContent className="max-w-sm mx-4 rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <DialogTitle className="text-left text-lg">Delete Kameti?</DialogTitle>
            </div>
            <DialogDescription className="text-left text-sm text-gray-600 leading-relaxed">
              You are about to permanently delete{" "}
              <span className="font-semibold text-gray-900">&quot;{kametiName}&quot;</span>.
              <br /><br />
              This will also delete:
              <ul className="mt-1 space-y-0.5 list-disc list-inside text-gray-500">
                <li>All members in this kameti</li>
                <li>All payment records</li>
              </ul>
              <br />
              <span className="text-red-600 font-medium">This action cannot be undone.</span>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 mt-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={deleting}
              className="flex-1 min-h-[44px]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 min-h-[44px] bg-red-600 hover:bg-red-700 text-white font-semibold"
            >
              {deleting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Deleting…</>
              ) : (
                <><Trash2 className="w-4 h-4 mr-2" />Yes, Delete</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
