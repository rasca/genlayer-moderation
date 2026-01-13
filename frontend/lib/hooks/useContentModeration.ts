"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import ContentModeration from "../contracts/ContentModeration";
import { getContractAddress, getStudioUrl } from "../genlayer/client";
import { useWallet } from "../genlayer/wallet";
import { success, error, configError } from "../utils/toast";
import type { Guideline, ModerationResult, PaginatedModerationResults } from "../contracts/types";

/**
 * Hook to get the ContentModeration contract instance
 *
 * Returns null if contract address is not configured.
 * The contract instance is recreated whenever the wallet address changes.
 * Read-only operations work without a connected wallet.
 * Write operations require a connected wallet.
 */
export function useContentModerationContract(): ContentModeration | null {
  const { address } = useWallet();
  const contractAddress = getContractAddress();
  const studioUrl = getStudioUrl();

  const contract = useMemo(() => {
    // Validate contract address is configured
    if (!contractAddress) {
      configError(
        "Setup Required",
        "Contract address not configured. Please set NEXT_PUBLIC_CONTRACT_ADDRESS in your .env file.",
        {
          label: "Setup Guide",
          onClick: () => window.open("/docs/setup", "_blank"),
        }
      );
      return null;
    }

    return new ContentModeration(contractAddress, address, studioUrl);
  }, [contractAddress, address, studioUrl]);

  return contract;
}

/**
 * Hook to fetch all guidelines
 * Refetches on window focus and after mutations
 * Returns empty array if contract is not configured
 */
export function useGuidelines() {
  const contract = useContentModerationContract();

  return useQuery<Guideline[], Error>({
    queryKey: ["guidelines"],
    queryFn: () => {
      if (!contract) {
        return Promise.resolve([]);
      }
      return contract.getGuidelines();
    },
    refetchOnWindowFocus: true,
    staleTime: 2000,
    enabled: !!contract,
  });
}

/**
 * Hook to fetch a specific guideline
 */
export function useGuideline(guidelineId: string) {
  const contract = useContentModerationContract();

  return useQuery<Guideline | null, Error>({
    queryKey: ["guideline", guidelineId],
    queryFn: () => {
      if (!contract || !guidelineId) {
        return Promise.resolve(null);
      }
      return contract.getGuideline(guidelineId);
    },
    refetchOnWindowFocus: true,
    staleTime: 2000,
    enabled: !!contract && !!guidelineId,
  });
}

/**
 * Hook to fetch all moderation results
 * Refetches on window focus and after mutations
 * Returns empty array if contract is not configured
 */
export function useModerationResults() {
  const contract = useContentModerationContract();

  return useQuery<ModerationResult[], Error>({
    queryKey: ["moderationResults"],
    queryFn: () => {
      if (!contract) {
        return Promise.resolve([]);
      }
      return contract.getModerationResults();
    },
    refetchOnWindowFocus: true,
    staleTime: 2000,
    enabled: !!contract,
  });
}

/**
 * Hook to fetch paginated moderation results
 * @param page - Page number (1-indexed)
 * @param perPage - Results per page
 */
export function usePaginatedModerationResults(page: number, perPage: number = 10) {
  const contract = useContentModerationContract();

  return useQuery<PaginatedModerationResults, Error>({
    queryKey: ["moderationResults", "paginated", page, perPage],
    queryFn: () => {
      if (!contract) {
        return Promise.resolve({
          results: [],
          total: 0,
          page,
          per_page: perPage,
          total_pages: 0,
        });
      }
      return contract.getModerationResultsPaginated(page, perPage);
    },
    refetchOnWindowFocus: true,
    staleTime: 2000,
    enabled: !!contract,
  });
}

/**
 * Hook to fetch moderation results for a specific post
 */
export function usePostModerationResults(postId: string) {
  const contract = useContentModerationContract();

  return useQuery<ModerationResult[], Error>({
    queryKey: ["moderationResults", postId],
    queryFn: () => {
      if (!contract || !postId) {
        return Promise.resolve([]);
      }
      return contract.getPostModerationResults(postId);
    },
    refetchOnWindowFocus: true,
    staleTime: 2000,
    enabled: !!contract && !!postId,
  });
}

/**
 * Hook to add a new guideline
 */
export function useAddGuideline() {
  const contract = useContentModerationContract();
  const { address } = useWallet();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);

  const mutation = useMutation({
    mutationFn: async ({
      guidelineId,
      text,
    }: {
      guidelineId: string;
      text: string;
    }) => {
      if (!contract) {
        throw new Error(
          "Contract not configured. Please set NEXT_PUBLIC_CONTRACT_ADDRESS in your .env file."
        );
      }
      if (!address) {
        throw new Error(
          "Wallet not connected. Please connect your wallet to add a guideline."
        );
      }
      setIsAdding(true);
      return contract.addGuideline(guidelineId, text);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guidelines"] });
      setIsAdding(false);
      success("Guideline added successfully!", {
        description: "The guideline has been registered on the blockchain.",
      });
    },
    onError: (err: any) => {
      console.error("Error adding guideline:", err);
      setIsAdding(false);
      error("Failed to add guideline", {
        description: err?.message || "Please try again.",
      });
    },
  });

  return {
    ...mutation,
    isAdding,
    addGuideline: mutation.mutate,
    addGuidelineAsync: mutation.mutateAsync,
  };
}

/**
 * Hook to moderate content
 */
export function useModerateContent() {
  const contract = useContentModerationContract();
  const { address } = useWallet();
  const queryClient = useQueryClient();
  const [isModerating, setIsModerating] = useState(false);
  const [moderatingPostId, setModeratingPostId] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async ({
      postId,
      postContent,
      guidelineId,
    }: {
      postId: string;
      postContent: string;
      guidelineId: string;
    }) => {
      if (!contract) {
        throw new Error(
          "Contract not configured. Please set NEXT_PUBLIC_CONTRACT_ADDRESS in your .env file."
        );
      }
      if (!address) {
        throw new Error(
          "Wallet not connected. Please connect your wallet to moderate content."
        );
      }
      setIsModerating(true);
      setModeratingPostId(postId);
      return contract.moderateContent(postId, postContent, guidelineId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["moderationResults"] });
      setIsModerating(false);
      setModeratingPostId(null);
      success("Content moderated successfully!", {
        description: "The AI has evaluated the content against the guideline.",
      });
    },
    onError: (err: any) => {
      console.error("Error moderating content:", err);
      setIsModerating(false);
      setModeratingPostId(null);
      error("Failed to moderate content", {
        description: err?.message || "Please try again.",
      });
    },
  });

  return {
    ...mutation,
    isModerating,
    moderatingPostId,
    moderateContent: mutation.mutate,
    moderateContentAsync: mutation.mutateAsync,
  };
}
