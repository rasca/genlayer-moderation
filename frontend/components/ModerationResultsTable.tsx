"use client";

import { useState } from "react";
import {
  Loader2,
  Shield,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  usePaginatedModerationResults,
  useContentModerationContract,
} from "@/lib/hooks/useContentModeration";
import { useWallet } from "@/lib/genlayer/wallet";
import { AddressDisplay } from "./AddressDisplay";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import type { ModerationResult } from "@/lib/contracts/types";

const RESULTS_PER_PAGE = 10;

// Helper to truncate text with ellipsis
function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1) + "…";
}

// Helper function to get outcome badge styling
function getOutcomeBadge(outcome: ModerationResult["outcome"]) {
  switch (outcome) {
    case "keep":
      return {
        icon: CheckCircle,
        className: "bg-green-500/20 text-green-400 border-green-500/30",
        label: "Keep",
      };
    case "limit":
      return {
        icon: AlertTriangle,
        className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        label: "Limit",
      };
    case "remove":
      return {
        icon: XCircle,
        className: "bg-red-500/20 text-red-400 border-red-500/30",
        label: "Remove",
      };
    default:
      return {
        icon: AlertCircle,
        className: "bg-gray-500/20 text-gray-400 border-gray-500/30",
        label: outcome,
      };
  }
}

export function ModerationResultsTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const contract = useContentModerationContract();
  const { data: paginatedData, isLoading, isError } = usePaginatedModerationResults(currentPage, RESULTS_PER_PAGE);
  const { address } = useWallet();

  const results = paginatedData?.results || [];
  const totalResults = Number(paginatedData?.total || 0);
  const totalPages = Number(paginatedData?.total_pages || 0);

  if (isLoading) {
    return (
      <div className="brand-card p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
          <p className="text-sm text-muted-foreground">
            Loading moderation results...
          </p>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="brand-card p-12">
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 mx-auto text-yellow-400 opacity-60" />
          <h3 className="text-xl font-bold">Setup Required</h3>
          <div className="space-y-2">
            <p className="text-muted-foreground">
              Contract address not configured.
            </p>
            <p className="text-sm text-muted-foreground">
              Please set{" "}
              <code className="bg-muted px-1 py-0.5 rounded text-xs">
                NEXT_PUBLIC_CONTRACT_ADDRESS
              </code>{" "}
              in your .env file.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="brand-card p-8">
        <div className="text-center">
          <p className="text-destructive">
            Failed to load moderation results. Please try again.
          </p>
        </div>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="brand-card p-12">
        <div className="text-center space-y-3">
          <Shield className="w-16 h-16 mx-auto text-muted-foreground opacity-30" />
          <h3 className="text-xl font-bold">No Moderation Results Yet</h3>
          <p className="text-muted-foreground">
            Submit content for moderation to see results here.
          </p>
        </div>
      </div>
    );
  }

  const startResult = (currentPage - 1) * RESULTS_PER_PAGE + 1;
  const endResult = Math.min(currentPage * RESULTS_PER_PAGE, totalResults);

  return (
    <div className="brand-card p-6 overflow-hidden">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Shield className="w-5 h-5 text-accent" />
        Moderation Results
        <span className="text-sm font-normal text-muted-foreground">
          ({totalResults} total)
        </span>
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Post ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Content
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Guideline
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Outcome
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Reasoning
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Moderator
              </th>
              <th className="px-4 py-3 w-10">
                <span className="sr-only">Details</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {results.map((result, index) => (
              <ResultRow
                key={`${result.post_id}-${result.guideline_id}-${index}`}
                result={result}
                currentAddress={address}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
          <p className="text-sm text-muted-foreground">
            Showing {startResult}-{endResult} of {totalResults} results
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm px-3">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

interface ResultRowProps {
  result: ModerationResult;
  currentAddress: string | null;
}

function ResultRow({ result, currentAddress }: ResultRowProps) {
  const router = useRouter();
  const isOwner =
    currentAddress?.toLowerCase() === result.moderator_address?.toLowerCase();
  const outcomeBadge = getOutcomeBadge(result.outcome);
  const OutcomeIcon = outcomeBadge.icon;

  const handleRowClick = () => {
    router.push(
      `/moderation/${encodeURIComponent(result.post_id)}/${encodeURIComponent(result.guideline_id)}`
    );
  };

  return (
    <tr
      className="group hover:bg-white/5 transition-colors animate-fade-in cursor-pointer"
      onClick={handleRowClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleRowClick()}
    >
      <td className="px-4 py-4">
        <span className="font-mono text-sm text-accent">
          {truncateText(result.post_id, 20)}
        </span>
      </td>
      <td className="px-4 py-4">
        <p className="text-sm truncate max-w-[200px]" title={result.post_content}>
          {truncateText(result.post_content, 60)}
        </p>
      </td>
      <td className="px-4 py-4">
        <Badge variant="outline" className="font-mono text-xs">
          {result.guideline_id}
        </Badge>
      </td>
      <td className="px-4 py-4">
        <Badge className={outcomeBadge.className}>
          <OutcomeIcon className="w-3 h-3 mr-1" />
          {outcomeBadge.label}
        </Badge>
      </td>
      <td className="px-4 py-4">
        <p className="text-sm text-muted-foreground truncate max-w-[250px]" title={result.reasoning}>
          {truncateText(result.reasoning, 80)}
        </p>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <AddressDisplay
            address={result.moderator_address}
            maxLength={10}
            showCopy={true}
          />
          {isOwner && (
            <Badge variant="secondary" className="text-xs">
              You
            </Badge>
          )}
        </div>
      </td>
      <td className="px-4 py-4">
        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </td>
    </tr>
  );
}
