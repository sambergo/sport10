#!/usr/bin/env python3

import os
import sys
import time
from generate_questions import generate_questions, add_questions_to_database

def generate_batch():
    """
    Generate a batch of questions across multiple categories and difficulties.
    """
    categories = ["Technology", "Science", "Geography", "History", "Literature", "Sports", "Music", "Art", "Film"]
    difficulties = ["Easy", "Medium", "Hard"]
    
    # Check for API key
    if not os.environ.get("GEMINI_API_KEY"):
        print("Please set the GEMINI_API_KEY environment variable")
        sys.exit(1)
    
    questions_per_batch = 3  # Questions per category/difficulty combination
    total_questions = 0
    
    print(f"Generating {questions_per_batch} questions for each category/difficulty combination...")
    print(f"Total: {len(categories)} categories × {len(difficulties)} difficulties × {questions_per_batch} questions = {len(categories) * len(difficulties) * questions_per_batch} questions")
    
    for category in categories:
        for difficulty in difficulties:
            print(f"\nGenerating {questions_per_batch} {difficulty} questions for {category}...")
            
            try:
                # Generate questions
                questions_data = generate_questions(category, difficulty, questions_per_batch)
                
                if questions_data:
                    # Add to database
                    added_count = add_questions_to_database(questions_data)
                    total_questions += added_count
                    print(f"✓ Added {added_count} questions")
                else:
                    print(f"✗ Failed to generate questions for {category} ({difficulty})")
                
                # Small delay to avoid rate limiting
                time.sleep(1)
                
            except Exception as e:
                print(f"✗ Error processing {category} ({difficulty}): {e}")
                continue
    
    print(f"\n🎉 Batch generation complete! Total questions added: {total_questions}")

if __name__ == "__main__":
    generate_batch()