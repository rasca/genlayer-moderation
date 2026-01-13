#!/bin/bash

CONTRACT="0x80cE07D1A888E928FE328CA8DA5B4a37ca211B1a"

add_guideline() {
  local id="$1"
  local text="$2"
  echo "Adding guideline: $id"
  npx genlayer write "$CONTRACT" add_guideline --args "$id" "$text"
  echo ""
}

submit_post() {
  local id="$1"
  local content="$2"
  local guideline="$3"
  echo "Submitting: $id (guideline: $guideline)"
  npx genlayer write "$CONTRACT" moderate_content --args "$id" "$content" "$guideline"
  echo ""
}

echo "=== Adding Guidelines ==="

add_guideline "no-hate-speech" "Content must not contain hate speech, discrimination, or attacks against individuals or groups based on race, ethnicity, religion, gender, sexual orientation, disability, or other protected characteristics."

add_guideline "no-violence" "Content must not promote, glorify, or incite violence, terrorism, or physical harm against any person or group."

add_guideline "no-misinformation" "Content must not contain false or misleading information about health, elections, or public safety that could cause real-world harm."

add_guideline "no-spam" "Content must not be spam, including repetitive posts, unsolicited advertisements, or attempts to manipulate engagement metrics."

add_guideline "respectful-discourse" "Content should maintain respectful discourse. Personal attacks, harassment, bullying, or targeted abuse of other users is not permitted."

echo "=== Submitting Sample Posts ==="

# Respectful discourse - KEEP
submit_post "discourse-1" "I think we should have a thoughtful discussion about immigration policy and find common ground." "respectful-discourse"
submit_post "discourse-2" "I disagree with your opinion but I respect your right to express it." "respectful-discourse"
submit_post "discourse-3" "Great point! I had not considered that perspective before." "respectful-discourse"

# Spam - REMOVE
submit_post "spam-1" "BUY NOW!!! AMAZING CRYPTO GAINS 1000X GUARANTEED!!! DM ME FOR SECRET TIPS!!!" "no-spam"
submit_post "spam-2" "CLICK HERE NOW!!! WIN FREE IPHONE!!! SHARE WITH 10 FRIENDS!!!" "no-spam"

# Misinformation - mix
submit_post "misinfo-1" "The earth is flat and NASA is lying to everyone. Wake up sheeple!" "no-misinformation"
submit_post "misinfo-2" "Here is a healthy recipe I tried: grilled chicken with vegetables and quinoa." "no-misinformation"
submit_post "misinfo-3" "Vaccines cause autism and the government is covering it up!" "no-misinformation"

# Violence - mix
submit_post "violence-1" "Someone should teach that politician a violent lesson they will not forget." "no-violence"
submit_post "violence-2" "The weather has been beautiful lately. Perfect for outdoor activities!" "no-violence"
submit_post "violence-3" "I hope bad things happen to people who disagree with me." "no-violence"

# Hate speech - mix
submit_post "hate-1" "All members of that group are criminals and should be deported immediately." "no-hate-speech"
submit_post "hate-2" "I really enjoyed the new restaurant downtown. The pasta was delicious!" "no-hate-speech"
submit_post "hate-3" "People who support that political party are all stupid and deserve bad things." "no-hate-speech"

echo "Done! Added 5 guidelines and submitted 14 posts for moderation."
