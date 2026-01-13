import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import type { Guideline, ModerationResult, TransactionReceipt, PaginatedModerationResults } from "./types";

/**
 * Helper to convert GenLayer Address objects to hex string
 */
function addressToString(value: any): string {
  if (typeof value === "string" && value.length > 0) return value;

  // Handle { bytes: { 0: 59, 1: 73, ... } } format from GenLayer
  if (value?.bytes && typeof value.bytes === "object") {
    const bytesObj = value.bytes;
    const byteArray: number[] = [];
    for (let i = 0; i < 20; i++) {
      if (bytesObj[i] !== undefined) {
        byteArray.push(bytesObj[i]);
      }
    }
    if (byteArray.length === 20) {
      return "0x" + byteArray.map(b => b.toString(16).padStart(2, "0")).join("");
    }
  }

  // Handle Map (GenLayer sometimes returns Maps)
  if (value instanceof Map) {
    const entries = Array.from(value.entries());
    for (const [k, v] of entries) {
      if (typeof v === "string" && v.startsWith("0x")) return v;
    }
  }
  if (value?.hex) return value.hex;
  if (value?.address) return value.address;
  if (value?.value) return String(value.value);
  // Handle Address objects that serialize to string
  const str = value?.toString?.();
  if (str && typeof str === "string" && str.startsWith("0x")) return str;

  return "";
}

/**
 * ContentModeration contract class for interacting with the GenLayer Content Moderation contract
 */
class ContentModeration {
  private contractAddress: `0x${string}`;
  private client: ReturnType<typeof createClient>;

  constructor(
    contractAddress: string,
    address?: string | null,
    studioUrl?: string
  ) {
    this.contractAddress = contractAddress as `0x${string}`;

    const config: any = {
      chain: studionet,
    };

    if (address) {
      config.account = address as `0x${string}`;
    }

    if (studioUrl) {
      config.endpoint = studioUrl;
    }

    this.client = createClient(config);
  }

  /**
   * Update the address used for transactions
   */
  updateAccount(address: string): void {
    const config: any = {
      chain: studionet,
      account: address as `0x${string}`,
    };

    this.client = createClient(config);
  }

  /**
   * Get all guidelines from the contract
   * @returns Array of guidelines
   */
  async getGuidelines(): Promise<Guideline[]> {
    try {
      const guidelines: any = await this.client.readContract({
        address: this.contractAddress,
        functionName: "get_all_guidelines",
        args: [],
      });

      // Convert GenLayer Map structure to typed array
      if (guidelines instanceof Map) {
        return Array.from(guidelines.entries()).map(([id, guidelineData]: any) => {
          const guidelineObj = Array.from((guidelineData as any).entries()).reduce(
            (obj: any, [key, value]: any) => {
              // Handle Address objects - convert to string
              if (key === "creator_address") {
                obj[key] = addressToString(value);
              } else {
                obj[key] = value;
              }
              return obj;
            },
            {} as Record<string, any>
          ) as Record<string, any>;

          return {
            id,
            ...guidelineObj,
          } as Guideline;
        });
      }

      return [];
    } catch (error) {
      console.error("Error fetching guidelines:", error);
      throw new Error("Failed to fetch guidelines from contract");
    }
  }

  /**
   * Get a specific guideline by ID
   * @param guidelineId - Guideline ID
   * @returns Guideline or null
   */
  async getGuideline(guidelineId: string): Promise<Guideline | null> {
    try {
      const guideline: any = await this.client.readContract({
        address: this.contractAddress,
        functionName: "get_guideline",
        args: [guidelineId],
      });

      if (!guideline) return null;

      if (guideline instanceof Map) {
        const guidelineObj = Array.from(guideline.entries()).reduce(
          (obj: any, [key, value]: any) => {
            // Handle Address objects - convert to string
            if (key === "creator_address") {
              obj[key] = addressToString(value);
            } else {
              obj[key] = value;
            }
            return obj;
          },
          {} as Record<string, any>
        ) as Record<string, any>;

        return guidelineObj as Guideline;
      }

      return guideline as Guideline;
    } catch (error) {
      console.error("Error fetching guideline:", error);
      return null;
    }
  }

  /**
   * Get all moderation results from the contract
   * @returns Array of moderation results
   */
  async getModerationResults(): Promise<ModerationResult[]> {
    try {
      const results: any = await this.client.readContract({
        address: this.contractAddress,
        functionName: "get_all_moderation_results",
        args: [],
      });

      console.log("Raw moderation results:", results);
      console.log("Results type:", typeof results);
      console.log("Is Map:", results instanceof Map);

      // Convert nested GenLayer Map structure to typed array
      if (results instanceof Map) {
        const parsed = Array.from(results.entries()).flatMap(([postId, guidelineMap]) => {
          console.log("Post ID:", postId, "Guideline Map:", guidelineMap);
          return Array.from((guidelineMap as any).entries()).map(
            ([guidelineId, resultData]: any) => {
              console.log("Guideline ID:", guidelineId, "Result Data:", resultData);
              const resultObj = Array.from((resultData as any).entries()).reduce(
                (obj: any, [key, value]: any) => {
                  // Handle Address objects - convert to string
                  if (key === "moderator_address") {
                    obj[key] = addressToString(value);
                  } else {
                    obj[key] = value;
                  }
                  return obj;
                },
                {} as Record<string, any>
              ) as Record<string, any>;

              return {
                ...resultObj,
                post_id: postId,
                guideline_id: guidelineId,
              } as ModerationResult;
            }
          );
        });
        console.log("Parsed results:", parsed);
        return parsed;
      }

      // Handle case where results might be an object instead of Map
      if (results && typeof results === 'object') {
        console.log("Results is object, not Map. Keys:", Object.keys(results));
      }

      return [];
    } catch (error) {
      console.error("Error fetching moderation results:", error);
      throw new Error("Failed to fetch moderation results from contract");
    }
  }

  /**
   * Get paginated moderation results
   * @param page - Page number (1-indexed)
   * @param perPage - Number of results per page
   * @returns Paginated results with metadata
   */
  async getModerationResultsPaginated(page: number, perPage: number): Promise<PaginatedModerationResults> {
    try {
      const response: any = await this.client.readContract({
        address: this.contractAddress,
        functionName: "get_moderation_results_paginated",
        args: [page, perPage],
      });

      console.log("Raw paginated response:", response);

      if (response instanceof Map) {
        const resultsMap = response.get("results");
        const results: ModerationResult[] = [];

        if (resultsMap instanceof Map || Array.isArray(resultsMap)) {
          const items = Array.isArray(resultsMap) ? resultsMap : Array.from(resultsMap.values());
          for (const resultData of items) {
            if (resultData instanceof Map) {
              const resultObj: any = {};
              for (const [key, value] of resultData.entries()) {
                if (key === "moderator_address") {
                  resultObj[key] = addressToString(value);
                } else {
                  resultObj[key] = value;
                }
              }
              results.push(resultObj as ModerationResult);
            }
          }
        }

        return {
          results,
          total: response.get("total") || 0,
          page: response.get("page") || page,
          per_page: response.get("per_page") || perPage,
          total_pages: response.get("total_pages") || 0,
        };
      }

      return {
        results: [],
        total: 0,
        page,
        per_page: perPage,
        total_pages: 0,
      };
    } catch (error) {
      console.error("Error fetching paginated moderation results:", error);
      throw new Error("Failed to fetch paginated moderation results from contract");
    }
  }

  /**
   * Get moderation results for a specific post
   * @param postId - Post ID
   * @returns Array of moderation results for that post
   */
  async getPostModerationResults(postId: string): Promise<ModerationResult[]> {
    try {
      const results: any = await this.client.readContract({
        address: this.contractAddress,
        functionName: "get_post_moderation_results",
        args: [postId],
      });

      if (results instanceof Map) {
        return Array.from(results.entries()).map(([guidelineId, resultData]: any) => {
          const resultObj = Array.from((resultData as any).entries()).reduce(
            (obj: any, [key, value]: any) => {
              // Handle Address objects - convert to string
              if (key === "moderator_address") {
                obj[key] = addressToString(value);
              } else {
                obj[key] = value;
              }
              return obj;
            },
            {} as Record<string, any>
          ) as Record<string, any>;

          return {
            ...resultObj,
            post_id: postId,
            guideline_id: guidelineId,
          } as ModerationResult;
        });
      }

      return [];
    } catch (error) {
      console.error("Error fetching post moderation results:", error);
      return [];
    }
  }

  /**
   * Add a new guideline
   * @param guidelineId - Unique ID for the guideline
   * @param text - Guideline text
   * @returns Transaction receipt
   */
  async addGuideline(
    guidelineId: string,
    text: string
  ): Promise<TransactionReceipt> {
    try {
      const txHash = await this.client.writeContract({
        address: this.contractAddress,
        functionName: "add_guideline",
        args: [guidelineId, text],
        value: BigInt(0),
      });

      const receipt = await this.client.waitForTransactionReceipt({
        hash: txHash,
        status: "ACCEPTED" as any,
        retries: 24,
        interval: 5000,
      });

      return receipt as TransactionReceipt;
    } catch (error) {
      console.error("Error adding guideline:", error);
      throw new Error("Failed to add guideline");
    }
  }

  /**
   * Moderate content against a guideline
   * @param postId - Unique ID for the post
   * @param postContent - Content to moderate
   * @param guidelineId - Guideline to evaluate against
   * @returns Transaction receipt
   */
  async moderateContent(
    postId: string,
    postContent: string,
    guidelineId: string
  ): Promise<TransactionReceipt> {
    try {
      const txHash = await this.client.writeContract({
        address: this.contractAddress,
        functionName: "moderate_content",
        args: [postId, postContent, guidelineId],
        value: BigInt(0),
      });

      const receipt = await this.client.waitForTransactionReceipt({
        hash: txHash,
        status: "ACCEPTED" as any,
        retries: 24,
        interval: 5000,
      });

      return receipt as TransactionReceipt;
    } catch (error) {
      console.error("Error moderating content:", error);
      throw new Error("Failed to moderate content");
    }
  }
}

export default ContentModeration;
