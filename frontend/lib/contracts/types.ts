/**
 * TypeScript types for GenLayer Content Moderation contract
 */

export interface Guideline {
  id: string;
  text: string;
  creator_address: string;
}

export interface ModerationResult {
  post_id: string;
  guideline_id: string;
  post_content: string;
  outcome: "keep" | "limit" | "remove";
  reasoning: string;
  moderator_address: string;
}

export interface TransactionReceipt {
  status: string;
  hash: string;
  blockNumber?: number;
  [key: string]: any;
}

export interface ModerationFilters {
  outcome?: "keep" | "limit" | "remove";
  post_id?: string;
  guideline_id?: string;
}

export interface PaginatedModerationResults {
  results: ModerationResult[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}
