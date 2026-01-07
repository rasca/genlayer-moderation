"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2, Tag, FileText } from "lucide-react";
import { useAddGuideline } from "@/lib/hooks/useContentModeration";
import { useWallet } from "@/lib/genlayer/wallet";
import { error } from "@/lib/utils/toast";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export function AddGuidelineModal() {
  const { isConnected, address, isLoading } = useWallet();
  const { addGuideline, isAdding, isSuccess } = useAddGuideline();

  const [isOpen, setIsOpen] = useState(false);
  const [guidelineId, setGuidelineId] = useState("");
  const [text, setText] = useState("");

  const [errors, setErrors] = useState({
    guidelineId: "",
    text: "",
  });

  // Auto-close modal when wallet disconnects
  useEffect(() => {
    if (!isConnected && isOpen && !isAdding) {
      setIsOpen(false);
    }
  }, [isConnected, isOpen, isAdding]);

  const validateForm = (): boolean => {
    const newErrors = {
      guidelineId: "",
      text: "",
    };

    if (!guidelineId.trim()) {
      newErrors.guidelineId = "Guideline ID is required";
    } else if (guidelineId.includes(" ")) {
      newErrors.guidelineId = "ID cannot contain spaces";
    }

    if (!text.trim()) {
      newErrors.text = "Guideline text is required";
    } else if (text.trim().length < 10) {
      newErrors.text = "Guideline should be at least 10 characters";
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected || !address) {
      error("Please connect your wallet first");
      return;
    }

    if (!validateForm()) {
      return;
    }

    addGuideline({
      guidelineId: guidelineId.trim(),
      text: text.trim(),
    });
  };

  const resetForm = () => {
    setGuidelineId("");
    setText("");
    setErrors({ guidelineId: "", text: "" });
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !isAdding) {
      resetForm();
    }
    setIsOpen(open);
  };

  // Reset form and close modal on success
  useEffect(() => {
    if (isSuccess) {
      resetForm();
      setIsOpen(false);
    }
  }, [isSuccess]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={!isConnected || !address || isLoading}
        >
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
      </DialogTrigger>
      <DialogContent className="brand-card border-2 sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Add Moderation Guideline
          </DialogTitle>
          <DialogDescription>
            Create a new guideline for content moderation. Guidelines are
            permanent and cannot be modified after creation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Guideline ID */}
          <div className="space-y-2">
            <Label htmlFor="guidelineId" className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Guideline ID
            </Label>
            <Input
              id="guidelineId"
              type="text"
              placeholder="e.g., no-hate-speech"
              value={guidelineId}
              onChange={(e) => {
                setGuidelineId(e.target.value);
                setErrors({ ...errors, guidelineId: "" });
              }}
              className={errors.guidelineId ? "border-destructive" : ""}
            />
            {errors.guidelineId && (
              <p className="text-xs text-destructive">{errors.guidelineId}</p>
            )}
            <p className="text-xs text-muted-foreground">
              A unique identifier for this guideline. Cannot be changed later.
            </p>
          </div>

          {/* Guideline Text */}
          <div className="space-y-2">
            <Label htmlFor="text" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Guideline Text
            </Label>
            <textarea
              id="text"
              placeholder="Describe what content should be kept, limited, or removed..."
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setErrors({ ...errors, text: "" });
              }}
              rows={5}
              className={`flex min-h-[120px] w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none ${
                errors.text ? "border-destructive" : "border-input"
              }`}
            />
            {errors.text && (
              <p className="text-xs text-destructive">{errors.text}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Be specific about what types of content violate this guideline.
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setIsOpen(false)}
              disabled={isAdding}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gradient"
              className="flex-1"
              disabled={isAdding}
            >
              {isAdding ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Guideline"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
