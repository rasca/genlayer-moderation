# { "Depends": "py-genlayer:test" }

import json
from dataclasses import dataclass
from genlayer import *


@allow_storage
@dataclass
class Guideline:
    id: str
    text: str
    creator_address: Address


@allow_storage
@dataclass
class ModerationResult:
    post_id: str
    guideline_id: str
    post_content: str
    outcome: str  # "keep", "limit", "remove"
    reasoning: str
    moderator_address: Address


class ContentModeration(gl.Contract):
    guidelines: TreeMap[str, Guideline]
    moderation_results: TreeMap[str, TreeMap[str, ModerationResult]]

    def __init__(self):
        pass

    def _evaluate_content(self, content: str, guideline_text: str) -> dict:
        def evaluate() -> str:
            prompt = f"""You are a content moderation AI. Evaluate the content against the community guideline.

COMMUNITY GUIDELINE:
{guideline_text}

CONTENT TO EVALUATE:
{content}

Determine if this content should be:
- "keep": Content is appropriate and follows the guideline
- "limit": Content is borderline, should have reduced visibility
- "remove": Content clearly violates the guideline

Respond in JSON format:
{{
    "outcome": str,  // Must be exactly "keep", "limit", or "remove"
    "reasoning": str // Brief explanation (1-2 sentences)
}}

It is mandatory that you respond only using the JSON format above.
Your output must be valid JSON without any formatting prefix or suffix.
"""
            result = gl.nondet.exec_prompt(prompt, response_format="json")
            return json.dumps(result, sort_keys=True)

        principle = "The 'outcome' field must be the same (either 'keep', 'limit', or 'remove'). The 'reasoning' field can differ in wording but should support the same outcome."

        result = gl.eq_principle.prompt_comparative(evaluate, principle)
        return json.loads(result)

    @gl.public.write
    def add_guideline(self, guideline_id: str, text: str) -> None:
        # Validate ID uniqueness
        if guideline_id in self.guidelines:
            raise Exception("Guideline ID already exists")

        # Validate non-empty
        if not guideline_id.strip() or not text.strip():
            raise Exception("Guideline ID and text cannot be empty")

        guideline = Guideline(
            id=guideline_id,
            text=text,
            creator_address=gl.message.sender_address,
        )
        self.guidelines[guideline_id] = guideline

    @gl.public.write
    def moderate_content(
        self, post_id: str, post_content: str, guideline_id: str
    ) -> None:
        # Validate guideline exists
        if guideline_id not in self.guidelines:
            raise Exception("Guideline not found")

        # Validate inputs
        if not post_id.strip() or not post_content.strip():
            raise Exception("Post ID and content cannot be empty")

        guideline = self.guidelines[guideline_id]
        moderation = self._evaluate_content(post_content, guideline.text)

        # Validate outcome
        if moderation.get("outcome") not in ["keep", "limit", "remove"]:
            raise Exception("Invalid moderation outcome from AI")

        result = ModerationResult(
            post_id=post_id,
            guideline_id=guideline_id,
            post_content=post_content,
            outcome=moderation["outcome"],
            reasoning=moderation.get("reasoning", ""),
            moderator_address=gl.message.sender_address,
        )

        self.moderation_results.get_or_insert_default(post_id)[guideline_id] = result

    @gl.public.view
    def get_all_guidelines(self) -> dict:
        return {k: v for k, v in self.guidelines.items()}

    @gl.public.view
    def get_guideline(self, guideline_id: str) -> Guideline | None:
        return self.guidelines.get(guideline_id, None)

    @gl.public.view
    def get_moderation_result(
        self, post_id: str, guideline_id: str
    ) -> ModerationResult | None:
        if post_id not in self.moderation_results:
            return None
        return self.moderation_results[post_id].get(guideline_id, None)

    @gl.public.view
    def get_post_moderation_results(self, post_id: str) -> dict:
        if post_id not in self.moderation_results:
            return {}
        return {k: v for k, v in self.moderation_results[post_id].items()}

    @gl.public.view
    def get_all_moderation_results(self) -> dict:
        return {
            post_id: {gid: result for gid, result in results.items()}
            for post_id, results in self.moderation_results.items()
        }

    @gl.public.view
    def get_moderation_results_paginated(self, page: int, per_page: int) -> dict:
        """
        Get paginated moderation results.
        Returns a flat list of results with pagination info.

        Args:
            page: Page number (1-indexed)
            per_page: Number of results per page

        Returns:
            dict with 'results', 'total', 'page', 'per_page', 'total_pages'
        """
        # Flatten all results into a list
        all_results = []
        for post_id, guideline_results in self.moderation_results.items():
            for guideline_id, result in guideline_results.items():
                all_results.append(result)

        total = len(all_results)
        total_pages = (total + per_page - 1) // per_page if per_page > 0 else 0

        # Calculate slice indices (1-indexed page)
        start = (page - 1) * per_page
        end = start + per_page

        # Get the page of results (reversed so newest first)
        reversed_results = list(reversed(all_results))
        page_results = reversed_results[start:end]

        return {
            "results": page_results,
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": total_pages,
        }
