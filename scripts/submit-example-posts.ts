import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

const CONTRACT_ADDRESS = "0x2833aAD1A4F522a4427A903EB141eD840d1C5e33";
const GUIDELINE_ID = "no-dogs-by-mochi";

// Example posts - mix of keep, limit, and remove outcomes
const posts = [
  // KEEP - No dog mentions
  { id: "tech-news-1", content: "Just released our new AI-powered code assistant. It helps developers write better code faster!" },
  { id: "food-review-1", content: "Had the most amazing sushi at that new place downtown. The salmon was fresh and the rice was perfectly seasoned." },
  { id: "travel-blog-1", content: "Barcelona is beautiful in spring. The architecture, the beaches, the tapas - everything is perfect." },
  { id: "fitness-tip-1", content: "Remember to stretch before your workout! It prevents injuries and improves performance." },
  { id: "book-rec-1", content: "Just finished reading 'Atomic Habits' - highly recommend for anyone looking to build better routines." },
  { id: "music-share-1", content: "This new album by The Weeknd is absolutely fire. Been on repeat all day." },
  { id: "gardening-1", content: "My tomatoes are finally growing! Started from seeds 6 weeks ago and now they're 8 inches tall." },

  // KEEP - Mentions other animals
  { id: "cat-lover-1", content: "My cat just learned to open doors. I'm both impressed and terrified." },
  { id: "bird-watch-1", content: "Spotted a rare blue jay in my backyard this morning. Nature is amazing!" },
  { id: "fish-tank-1", content: "Added some new neon tetras to my aquarium. The colors are stunning!" },

  // LIMIT - Borderline/indirect references
  { id: "pet-store-1", content: "Went to the pet store today. They had so many cute animals - cats, hamsters, birds, and some four-legged friends." },
  { id: "neighbor-noise-1", content: "My neighbor's pet keeps barking all night. Can't get any sleep!" },
  { id: "park-visit-1", content: "The park was busy today. Lots of joggers, cyclists, and people walking their pets." },

  // REMOVE - Explicit dog content
  { id: "dog-lover-1", content: "Just adopted the cutest golden retriever puppy! His name is Max and he loves belly rubs." },
  { id: "dog-training-1", content: "Tips for training your dog: Start early, be consistent, use positive reinforcement, and practice daily." },
  { id: "dog-park-1", content: "Best dog parks in the city: 1. Central Bark 2. Pawsome Fields 3. Woof Meadows" },
  { id: "dog-breed-1", content: "Thinking about getting a husky. They're so beautiful but I heard they need lots of exercise." },
  { id: "dog-photo-1", content: "Look at my precious poodle! She just got groomed and looks like a fluffy cloud. 🐩" },
  { id: "dog-walk-1", content: "Morning walks with my labrador are the best part of my day. He gets so excited!" },
  { id: "dog-rescue-1", content: "Please consider adopting dogs from shelters. So many good boys and girls need loving homes!" },
];

async function main() {
  console.log("Creating GenLayer client...");

  const client = createClient({
    chain: studionet,
    endpoint: "https://studio.genlayer.com/api",
  });

  console.log(`Submitting ${posts.length} posts for moderation...`);
  console.log(`Contract: ${CONTRACT_ADDRESS}`);
  console.log(`Guideline: ${GUIDELINE_ID}\n`);

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    console.log(`[${i + 1}/${posts.length}] Submitting: ${post.id}`);
    console.log(`  Content: ${post.content.substring(0, 60)}...`);

    try {
      const txHash = await client.writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        functionName: "moderate_content",
        args: [post.id, post.content, GUIDELINE_ID],
        value: BigInt(0),
      });

      console.log(`  TX Hash: ${txHash}`);
      console.log(`  Waiting for confirmation...`);

      const receipt = await client.waitForTransactionReceipt({
        hash: txHash,
        status: "ACCEPTED" as any,
        retries: 24,
        interval: 5000,
      });

      console.log(`  ✓ Confirmed!\n`);
    } catch (err: any) {
      console.error(`  ✗ Error: ${err.message}\n`);
    }
  }

  console.log("Done!");
}

main().catch(console.error);
