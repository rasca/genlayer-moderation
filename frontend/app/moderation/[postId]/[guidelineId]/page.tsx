"use client";

import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Shield,
  CheckCircle,
  AlertTriangle,
  XCircle,
  AlertCircle,
  Loader2,
  FileText,
  ScrollText,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddressDisplay } from "@/components/AddressDisplay";
import {
  useModerationResults,
  useGuideline,
} from "@/lib/hooks/useContentModeration";
import { useWallet } from "@/lib/genlayer/wallet";
import type { ModerationResult } from "@/lib/contracts/types";

function getOutcomeBadge(outcome: ModerationResult["outcome"]) {
  switch (outcome) {
    case "keep":
      return {
        icon: CheckCircle,
        className: "bg-green-500/20 text-green-400 border-green-500/30",
        label: "Keep",
        description:
          "This content complies with the guideline and should remain visible.",
      };
    case "limit":
      return {
        icon: AlertTriangle,
        className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        label: "Limit",
        description:
          "This content may require reduced visibility or warnings.",
      };
    case "remove":
      return {
        icon: XCircle,
        className: "bg-red-500/20 text-red-400 border-red-500/30",
        label: "Remove",
        description:
          "This content violates the guideline and should be removed.",
      };
    default:
      return {
        icon: AlertCircle,
        className: "bg-gray-500/20 text-gray-400 border-gray-500/30",
        label: outcome,
        description: "Unknown outcome type.",
      };
  }
}

export default function ModerationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { address } = useWallet();

  const postId = decodeURIComponent(params.postId as string);
  const guidelineId = decodeURIComponent(params.guidelineId as string);

  const { data: results, isLoading: resultsLoading } = useModerationResults();
  const { data: guideline, isLoading: guidelineLoading } =
    useGuideline(guidelineId);

  const isLoading = resultsLoading || guidelineLoading;

  const result = results?.find(
    (r) => r.post_id === postId && r.guideline_id === guidelineId
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
          <p className="text-sm text-muted-foreground">Loading details...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="brand-card p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 mx-auto text-yellow-400 opacity-60 mb-4" />
          <h1 className="text-xl font-bold mb-2">Result Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The moderation result you&apos;re looking for doesn&apos;t exist or
            has been removed.
          </p>
          <Button variant="outline" onClick={() => router.push("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const outcomeBadge = getOutcomeBadge(result.outcome);
  const OutcomeIcon = outcomeBadge.icon;
  const isOwner =
    address?.toLowerCase() === result.moderator_address?.toLowerCase();

  return (
    <div className="min-h-screen py-8 px-4 md:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="brand-card p-6 mb-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2 mb-2">
                <Shield className="w-6 h-6 text-accent" />
                Moderation Result
              </h1>
              <p className="text-muted-foreground">
                Post ID:{" "}
                <span className="font-mono text-accent">{result.post_id}</span>
              </p>
            </div>
            <Badge className={`${outcomeBadge.className} text-lg px-4 py-2`}>
              <OutcomeIcon className="w-5 h-5 mr-2" />
              {outcomeBadge.label}
            </Badge>
          </div>
        </div>

        <div className="brand-card p-6 mb-6">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <OutcomeIcon className="w-5 h-5 text-accent" />
            Decision: {outcomeBadge.label}
          </h2>
          <p className="text-muted-foreground">{outcomeBadge.description}</p>
        </div>

        <div className="brand-card p-6 mb-6">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-accent" />
            Post Content
          </h2>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <p className="text-foreground whitespace-pre-wrap">
              {result.post_content}
            </p>
          </div>
        </div>

        <div className="brand-card p-6 mb-6">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-accent" />
            Guideline:{" "}
            <span className="font-mono text-accent">{result.guideline_id}</span>
          </h2>
          {guideline ? (
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <p className="text-foreground whitespace-pre-wrap">
                {guideline.text}
              </p>
              <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2 text-sm text-muted-foreground">
                <span>Created by</span>
                <AddressDisplay
                  address={guideline.creator_address}
                  maxLength={12}
                  showCopy={true}
                />
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground italic">
              Guideline details not available
            </p>
          )}
        </div>

        <div className="brand-card p-6 mb-6">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-accent" />
            AI Reasoning
          </h2>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <p className="text-foreground whitespace-pre-wrap">
              {result.reasoning}
            </p>
          </div>
        </div>

        <div className="brand-card p-6">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <User className="w-5 h-5 text-accent" />
            Moderator
          </h2>
          <div className="flex items-center gap-3">
            <AddressDisplay
              address={result.moderator_address}
              maxLength={20}
              showCopy={true}
            />
            {isOwner && (
              <Badge variant="secondary" className="text-sm">
                You
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
