"use client";

import { ScrollText, Loader2, AlertCircle, Plus } from "lucide-react";
import {
  useGuidelines,
  useContentModerationContract,
} from "@/lib/hooks/useContentModeration";
import { useWallet } from "@/lib/genlayer/wallet";
import { AddressDisplay } from "./AddressDisplay";
import { AddGuidelineModal } from "./AddGuidelineModal";

export function GuidelinesPanel() {
  const contract = useContentModerationContract();
  const { data: guidelines, isLoading, isError } = useGuidelines();
  const { address } = useWallet();

  if (isLoading) {
    return (
      <div className="brand-card p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <ScrollText className="w-5 h-5 text-accent" />
          Guidelines
        </h2>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-accent" />
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="brand-card p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <ScrollText className="w-5 h-5 text-accent" />
          Guidelines
        </h2>
        <div className="text-center py-8 space-y-3">
          <AlertCircle className="w-12 h-12 mx-auto text-yellow-400 opacity-60" />
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Setup Required</p>
            <p className="text-xs text-muted-foreground">
              Contract address not configured
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !guidelines) {
    return (
      <div className="brand-card p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <ScrollText className="w-5 h-5 text-accent" />
          Guidelines
        </h2>
        <div className="text-center py-8">
          <p className="text-sm text-destructive">Failed to load guidelines</p>
        </div>
      </div>
    );
  }

  return (
    <div className="brand-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <ScrollText className="w-5 h-5 text-accent" />
          Guidelines
          {guidelines.length > 0 && (
            <span className="text-sm font-normal text-muted-foreground">
              ({guidelines.length})
            </span>
          )}
        </h2>
        <AddGuidelineModal />
      </div>

      {guidelines.length === 0 ? (
        <div className="text-center py-8">
          <ScrollText className="w-12 h-12 mx-auto text-muted-foreground opacity-30 mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            No guidelines yet
          </p>
          <p className="text-xs text-muted-foreground">
            Add a guideline to start moderating content
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {guidelines.map((guideline) => {
            const isCurrentUser =
              address?.toLowerCase() ===
              guideline.creator_address?.toLowerCase();

            return (
              <div
                key={guideline.id}
                className={`
                  p-4 rounded-lg transition-all border
                  ${
                    isCurrentUser
                      ? "bg-accent/10 border-accent/30"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  }
                `}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-mono text-sm font-semibold text-accent">
                    {guideline.id}
                  </span>
                  {isCurrentUser && (
                    <span className="text-xs bg-accent/30 text-accent px-2 py-0.5 rounded-full font-semibold">
                      Yours
                    </span>
                  )}
                </div>
                <p className="text-sm text-foreground/80 mb-2 line-clamp-3">
                  {guideline.text}
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span>by</span>
                  <AddressDisplay
                    address={guideline.creator_address}
                    maxLength={8}
                    className="text-xs"
                    showCopy={false}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
