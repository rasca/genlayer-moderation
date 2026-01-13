"use client";

import { useState } from "react";
import { Shield, Loader2, FileText, ScrollText } from "lucide-react";
import {
  useModerateContent,
  useGuidelines,
  useContentModerationContract,
} from "@/lib/hooks/useContentModeration";
import { useWallet } from "@/lib/genlayer/wallet";
import { error } from "@/lib/utils/toast";
import { Button } from "./ui/button";
import { Label } from "./ui/label";

export function ModerationPanel() {
  const { isConnected, address } = useWallet();
  const contract = useContentModerationContract();
  const { data: guidelines, isLoading: guidelinesLoading } = useGuidelines();
  const { moderateContent, isModerating } = useModerateContent();

  const [postContent, setPostContent] = useState("");
  const [guidelineId, setGuidelineId] = useState("");

  const [errors, setErrors] = useState({
    postContent: "",
    guidelineId: "",
  });

  const generatePostId = (): string => {
    return crypto.randomUUID();
  };

  const validateForm = (): boolean => {
    const newErrors = {
      postContent: "",
      guidelineId: "",
    };

    if (!postContent.trim()) {
      newErrors.postContent = "Post content is required";
    }

    if (!guidelineId) {
      newErrors.guidelineId = "Please select a guideline";
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

    moderateContent({
      postId: generatePostId(),
      postContent: postContent.trim(),
      guidelineId,
    });

    // Reset form on submission (will show result in table)
    setPostContent("");
    setGuidelineId("");
  };

  const hasGuidelines = guidelines && guidelines.length > 0;

  return (
    <div className="brand-card p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Shield className="w-5 h-5 text-accent" />
        Moderate Content
      </h2>

      {!contract ? (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">
            Contract not configured
          </p>
        </div>
      ) : !hasGuidelines ? (
        <div className="text-center py-4">
          <ScrollText className="w-10 h-10 mx-auto text-muted-foreground opacity-30 mb-2" />
          <p className="text-sm text-muted-foreground">
            Add a guideline first to start moderating content
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Guideline Selection */}
          <div className="space-y-2">
            <Label htmlFor="guidelineId" className="flex items-center gap-2">
              <ScrollText className="w-4 h-4" />
              Guideline
            </Label>
            <select
              id="guidelineId"
              value={guidelineId}
              onChange={(e) => {
                setGuidelineId(e.target.value);
                setErrors({ ...errors, guidelineId: "" });
              }}
              disabled={isModerating || guidelinesLoading}
              className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                errors.guidelineId ? "border-destructive" : "border-input"
              }`}
            >
              <option value="">Select a guideline...</option>
              {guidelines?.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.id}
                </option>
              ))}
            </select>
            {errors.guidelineId && (
              <p className="text-xs text-destructive">{errors.guidelineId}</p>
            )}
          </div>

          {/* Post Content */}
          <div className="space-y-2">
            <Label htmlFor="postContent" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Post Content
            </Label>
            <textarea
              id="postContent"
              placeholder="Enter the content to be moderated..."
              value={postContent}
              onChange={(e) => {
                setPostContent(e.target.value);
                setErrors({ ...errors, postContent: "" });
              }}
              rows={3}
              disabled={isModerating}
              className={`flex min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none ${
                errors.postContent ? "border-destructive" : "border-input"
              }`}
            />
            {errors.postContent && (
              <p className="text-xs text-destructive">{errors.postContent}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="gradient"
              disabled={isModerating || !isConnected || !address}
            >
              {isModerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Moderating...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Submit for Moderation
                </>
              )}
            </Button>
          </div>

          {isModerating && (
            <p className="text-xs text-center text-muted-foreground">
              AI is evaluating the content. This may take a moment...
            </p>
          )}
        </form>
      )}
    </div>
  );
}
