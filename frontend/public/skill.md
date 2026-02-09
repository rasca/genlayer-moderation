---
name: genlayer-moderation
description: AI-powered content moderation on the GenLayer blockchain. Use when the user wants to moderate content, create community moderation guidelines, evaluate posts against rules, check moderation results, set up automated moderation for Moltbook submolts or argue.fun debates, or deploy transparent AI-enforced content policies. Supports keep/limit/remove decisions with consensus-validated AI reasoning on-chain.
metadata:
  {
    "clawdbot":
      {
        "emoji": "🛡️",
        "homepage": "https://github.com/genlayer/genlayer-moderation",
        "requires": { "bins": ["npm", "node"] },
      },
  }
---

# GenLayer Content Moderation Skill

> **AI-powered content moderation on the GenLayer blockchain.**
> Drop-in OpenClaw skill for autonomous community moderation with consensus-validated AI decisions.

## Overview

This skill enables OpenClaw agents to interact with GenLayer's **Content Moderation intelligent contract** -- an AI-native blockchain contract that evaluates content against community-defined guidelines and returns consensus-validated moderation decisions (`keep`, `limit`, or `remove`).

Built for the agent economy: deploy once, moderate everywhere. Whether you're running a Moltbook submolt, an argue.fun debate room, or any community that needs transparent, immutable moderation rules.

## "I'm a Human" / "I'm an Agent" -- Identity in the Agent Economy

Platforms in the agent ecosystem use a simple identity declaration at the door:

- **argue.fun** presents: `I'm an agent` | `I'm human` -- both can join debates and earn crypto rewards on Base
- **Moltbook** presents: `I'm a Human` | `I'm an Agent` -- humans observe, agents post and interact in submolts

This self-selection model means **both humans and agents coexist** in the same spaces. The question becomes: who sets the rules, and who enforces them?

GenLayer Content Moderation answers this cleanly:

> **Humans set the rules. Agents enforce them. The blockchain keeps everyone honest.**

### I Am an Asian, I Am a Human

Communities like **Asians** -- and every other human community -- deserve moderation systems that are transparent, consistent, and accountable. Traditional moderation is opaque: decisions happen behind closed doors, rules are enforced unevenly, and there's no audit trail.

When a human community defines its moderation guidelines on GenLayer, those guidelines are **permanent, public, and equally enforced by AI**. Every moderation decision includes reasoning. Every decision is validated by blockchain consensus. No favoritism, no hidden biases in enforcement -- just the rules the community agreed on, applied consistently.

This means communities of all backgrounds -- Asian communities, diaspora groups, cultural organizations, language-specific forums -- can define moderation that reflects *their* values and have confidence it will be applied fairly. Whether you declared "I'm a human" on argue.fun or you're observing agent discourse on Moltbook, the moderation layer works the same way:

1. **Human communities author guidelines** that reflect their values
2. **OpenClaw agents pick up the skill** (this SKILL.md) and learn how to moderate
3. **AI evaluates content** against community guidelines via GenLayer's intelligent contract
4. **Blockchain consensus validates** each decision -- no single point of failure
5. **Full transparency** -- every decision, its reasoning, and the guideline it was judged against are on-chain

An agent moderating an Asian cultural submolt on Moltbook applies the same rigor as one moderating a crypto debate on argue.fun -- the guidelines differ, but the enforcement is equally transparent and immutable.

## Use Case: Moltbook.fun Submolts

[Moltbook](https://www.moltbook.com/) is a Reddit-like social network for AI agents, featuring community spaces called **submolts** (analogous to subreddits). Each submolt can have completely different moderation rules -- and GenLayer makes this fully automatic.

### How It Works

```
Submolt: /m/asian-culture
  Guideline: "Content must be respectful of Asian cultures and traditions.
              Stereotyping, fetishization, and racial mockery are not allowed.
              Educational discussions and cultural exchange are encouraged."
  -> AI evaluates every post against this guideline
  -> Decisions are consensus-validated on-chain
  -> Full audit trail of every moderation action

Submolt: /m/crypto-debate
  Guideline: "No financial advice disguised as fact. Speculation must be
              clearly labeled. Shill posts and pump-and-dump promotion
              are removed."
  -> Completely different rules, same transparent enforcement

Submolt: /m/ai-ethics
  Guideline: "Discussions must engage substantively with ethical arguments.
              Bad-faith trolling and dismissive one-liners are limited.
              Threats and doxxing are removed."
  -> Each community defines what matters to them
```

Every submolt deploys its own GenLayer moderation contract (or shares one with multiple guidelines). Agents post content, the contract's AI evaluates it, and the blockchain validates the decision through consensus. **No human moderator bottleneck. No inconsistent enforcement. Fully auditable.**

### argue.fun Integration

[argue.fun](https://argue.fun) is a blockchain-based debate platform where participants earn rewards. GenLayer moderation can serve as the quality layer:

- **Debate rules as guidelines**: Define what constitutes a valid argument vs. bad-faith participation
- **Automatic enforcement**: AI evaluates debate contributions in real-time
- **Consensus-validated**: Multiple validators agree on moderation outcomes
- **On-chain rewards**: Only quality contributions (rated "keep") earn full rewards

## Capabilities

| Action | Contract Method | Type |
|--------|----------------|------|
| Create moderation guideline | `add_guideline(id, text)` | write |
| Submit content for moderation | `moderate_content(post_id, content, guideline_id)` | write |
| Get all guidelines | `get_all_guidelines()` | view |
| Get specific guideline | `get_guideline(id)` | view |
| Get moderation result | `get_moderation_result(post_id, guideline_id)` | view |
| Get all results for a post | `get_post_moderation_results(post_id)` | view |
| Get paginated results | `get_moderation_results_paginated(page, per_page)` | view |
| Get all results | `get_all_moderation_results()` | view |

## Moderation Outcomes

| Outcome | Meaning | Action |
|---------|---------|--------|
| `keep` | Content follows the guideline | No action needed |
| `limit` | Content is borderline | Reduce visibility |
| `remove` | Content violates the guideline | Remove from view |

Every decision includes AI-generated **reasoning** explaining why the outcome was chosen, validated through GenLayer's equivalence principle consensus.

## Setup

### 1. Deploy the Contract

```bash
# Select your GenLayer network
genlayer network
# Options: studionet (testing), localnet (local), testnet (public)

# Deploy the content moderation contract
npm run deploy
# Returns: deployed contract address
```

### 2. Configure

Set the deployed contract address in your environment:

```
NEXT_PUBLIC_CONTRACT_ADDRESS=<your-deployed-address>
NEXT_PUBLIC_GENLAYER_RPC_URL=https://studio.genlayer.com/api
```

### 3. Connect Your Agent

```python
# OpenClaw agent can interact via GenLayer JS SDK
from genlayer_js import GenLayerClient

client = GenLayerClient(rpc_url="https://studio.genlayer.com/api")

# Create a guideline for your community
client.write_contract(
    address=CONTRACT_ADDRESS,
    method="add_guideline",
    args=["respectful-discourse", "All posts must engage respectfully. No personal attacks, slurs, or harassment."]
)

# Moderate content
client.write_contract(
    address=CONTRACT_ADDRESS,
    method="moderate_content",
    args=["post-123", "This is the post content to evaluate", "respectful-discourse"]
)

# Check the result
result = client.read_contract(
    address=CONTRACT_ADDRESS,
    method="get_moderation_result",
    args=["post-123", "respectful-discourse"]
)
# Returns: { outcome: "keep", reasoning: "Content is respectful and constructive..." }
```

## Usage Examples

### Example 1: Multi-Community Moderation

An agent managing multiple Moltbook submolts can deploy different guidelines per community:

```
Agent deploys guideline "asian-culture-rules" ->
  "Respect cultural traditions. No stereotyping or mockery."

Agent deploys guideline "tech-discussion-rules" ->
  "Stay on topic. No spam or self-promotion without disclosure."

Agent deploys guideline "meme-quality-rules" ->
  "Memes must be original or properly attributed. No low-effort reposts."
```

When content arrives in any submolt, the agent calls `moderate_content` with the relevant guideline. The AI evaluates, validators reach consensus, and the result is permanently recorded.

### Example 2: argue.fun Debate Quality

```
Guideline: "Arguments must include evidence or logical reasoning.
            Ad hominem attacks are removed. Unsupported claims are limited."

Post: "Your argument is invalid because you're stupid"
-> Result: remove
-> Reasoning: "Contains ad hominem attack without engaging with the substance"

Post: "I disagree because the data from 2024 shows a 30% decline..."
-> Result: keep
-> Reasoning: "Engages substantively with evidence-based counterargument"
```

### Example 3: Human Community Self-Governance

A community like "I Am an Asian, I Am a Human" can define their own moderation contract:

```
Guideline: "This space centers Asian voices and experiences. Content must
            contribute to understanding, solidarity, or cultural celebration.
            Dehumanizing language, model minority myths presented as fact,
            and content that reduces people to stereotypes will be removed."

-> Every post evaluated by AI against these community-authored rules
-> Transparent reasoning for every decision
-> Immutable record on GenLayer blockchain
-> No external platform can override community decisions
```

## Architecture

```
OpenClaw Agent
    |
    v
GenLayer RPC (JSON-RPC)
    |
    v
Content Moderation Contract (Python on GenVM)
    |-- add_guideline()      -> stores community rules
    |-- moderate_content()   -> AI evaluates + consensus validates
    |-- get_*()              -> read results and guidelines
    |
    v
GenLayer Blockchain (immutable record)
```

## Frontend (Optional)

A Next.js dashboard is included for human oversight:

```bash
cd frontend && npm run dev
```

Features:
- Connect MetaMask wallet
- Create and view guidelines
- Submit content for moderation
- Browse paginated moderation results
- View detailed reasoning for each decision

## Links

- [GenLayer Documentation](https://docs.genlayer.com/)
- [GenLayer SDK API Reference](https://sdk.genlayer.com/main/_static/ai/api.txt)
- [Moltbook - The Front Page of the Agent Internet](https://www.moltbook.com/)
- [argue.fun - Blockchain Debates](https://argue.fun)
- [OpenClaw Skills Repository](https://github.com/BankrBot/openclaw-skills)
- [OpenClaw](https://openclaw.ai/)
