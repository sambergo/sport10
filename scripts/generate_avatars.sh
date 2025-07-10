#!/bin/bash

# This script generates 20 avatars for the game by calling the Python script with different prompts.

# Make sure you have set your GEMINI_API_KEY environment variable before running this script.
# export GEMINI_API_KEY='YOUR_API_KEY'

PROMPTS=(
  "A wise old wizard with a long white beard, fantasy style"
  "A futuristic cyborg ninja with glowing red eyes, cyberpunk art"
  "A cheerful cartoon robot with a single antenna"
  "A stoic female warrior with tribal paint and a spear, digital painting"
  "A mischievous pixie with iridescent wings, surrounded by fireflies"
  "A gritty space marine in heavy armor, sci-fi concept art"
  "A friendly alien with three eyes and blue skin, cartoon style"
  "A mysterious rogue hiding in the shadows, holding a dagger"
  "A noble knight in shining silver armor with a lion crest"
  "A steampunk inventor with goggles and a clockwork arm"
  "A powerful sorceress casting a glowing spell, fantasy illustration"
  "An undead pirate captain with a ghostly aura"
  "A cute, fluffy creature with big, innocent eyes, like a game mascot"
  "A hardened detective in a trench coat, film noir style"
  "A graceful elf archer with pointed ears and a longbow"
  "A hulking orc barbarian with a massive axe"
  "A time-traveling adventurer with a retro-futuristic watch"
  "A serene nature spirit made of leaves and vines"
  "A fast-talking goblin merchant with a sack of gold"
  "A celestial being made of stardust and constellations"
)

# Get the directory of the script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

for prompt in "${PROMPTS[@]}"; do
  echo "Generating image for prompt: '$prompt'"
  python "$SCRIPT_DIR/generate_image.py" "$prompt"
  # Optional: add a small delay to avoid hitting rate limits if necessary
  # sleep 1
done

echo "Avatar generation complete. Images are in the scripts/images directory."
