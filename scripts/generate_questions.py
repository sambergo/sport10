#!/usr/bin/env python3

import os
import sys
import json
import sqlite3
import logging
from google import genai
from google.genai import types

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("generate_questions.log"),
        logging.StreamHandler(sys.stdout),
    ],
)
logger = logging.getLogger(__name__)


def generate_questions(category, difficulty, count=5):
    """
    Generate trivia questions using Gemini AI based on category and difficulty.
    """
    logger.info(
        f"Starting question generation - Category: {category}, Difficulty: {difficulty}, Count: {count}"
    )

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        logger.error("GEMINI_API_KEY environment variable not set")
        return None

    logger.debug(f"API key found: {api_key[:10]}...{api_key[-4:]}")
    client = genai.Client(api_key=api_key)

    prompt = f"""Generate {count} trivia questions for a Smart10-style game. Each question should be a clear and direct topic.

Category: {category}
Difficulty: {difficulty}

Requirements:
- The "question" should be a direct topic, not a full interrogative sentence. For example, instead of "Which of the following players have won the Ballon d'Or?", the question should be "Ballon d'Or Winners".
- Avoid unnecessary filler phrases like "Which of the following are..." or "Identify the...". The topic itself should be the question.
- Provide exactly 10 answer options per question
- 1-10 options should be correct answers
- 0-9 options should be incorrect but plausible answers
- Questions should be appropriate for the {difficulty} difficulty level
- Vary the number of correct answers between questions

Return the response as a JSON array with this exact structure:
[
  {{
    "question": "Direct Topic Name",
    "options": [
      {{"text": "Option 1", "isCorrect": true}},
      {{"text": "Option 2", "isCorrect": false}},
      // ... exactly 10 options total
    ],
    "category": "{category}",
    "difficulty": "{difficulty}"
  }}
  // ... {count} questions total
]

Make sure the JSON is valid and properly formatted. Do not include any text before or after the JSON array."""

    logger.debug(f"Generated prompt (length: {len(prompt)})")
    logger.debug(f"Prompt preview: {prompt[:200]}...")

    model = "gemini-2.5-flash"
    logger.info(f"Using model: {model}")

    contents = [
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(text=prompt),
            ],
        ),
    ]

    generate_content_config = types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(
            thinking_budget=-1,
        ),
        response_mime_type="application/json",
    )

    logger.debug(f"Request config: {generate_content_config}")

    try:
        logger.info("Sending request to Gemini API...")
        response = client.models.generate_content(
            model=model,
            contents=contents,
            config=generate_content_config,
        )

        logger.info(f"Received response from API (length: {len(response.text)})")
        logger.info("Raw API response:")
        print("=" * 80)
        print("RAW API RESPONSE:")
        print(response.text)
        print("=" * 80)

        # Parse the JSON response
        logger.info("Parsing JSON response...")
        questions_data = json.loads(response.text)
        logger.info(f"Successfully parsed JSON with {len(questions_data)} questions")

        # Log question validation
        for i, question in enumerate(questions_data):
            logger.debug(
                f"Question {i + 1}: {len(question.get('options', []))} options, "
                f"{sum(1 for opt in question.get('options', []) if opt.get('isCorrect', False))} correct"
            )

        return questions_data

    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing error: {e}")
        logger.error(f"Raw response: {response.text}")
        return None
    except Exception as e:
        logger.error(f"Error generating questions: {e}")
        logger.error(f"Error type: {type(e).__name__}")
        return None


def add_questions_to_database(questions_data, db_path="./sport10.db"):
    """
    Add generated questions to the SQLite database.
    """
    logger.info(f"Adding {len(questions_data)} questions to database: {db_path}")

    try:
        logger.debug(f"Connecting to database: {db_path}")
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # Create tables if they don't exist
        logger.info("Creating database tables if they don't exist...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS questions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                text TEXT NOT NULL,
                category_id INTEGER NOT NULL,
                difficulty TEXT NOT NULL,
                FOREIGN KEY (category_id) REFERENCES categories (id)
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS answers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                question_id INTEGER NOT NULL,
                text TEXT NOT NULL,
                is_correct BOOLEAN NOT NULL,
                FOREIGN KEY (question_id) REFERENCES questions (id)
            )
        """)

        conn.commit()
        logger.info("Database tables created/verified successfully")

        added_count = 0

        for i, question_data in enumerate(questions_data):
            logger.debug(f"Processing question {i + 1}/{len(questions_data)}")

            # Validate question data structure
            required_fields = ["category", "question", "difficulty", "options"]
            for field in required_fields:
                if field not in question_data:
                    logger.error(f"Question {i + 1} missing required field: {field}")
                    continue

            category = question_data["category"]
            question_text = question_data["question"]
            difficulty = question_data["difficulty"]
            options = question_data["options"]

            logger.debug(
                f"Question {i + 1}: Category={category}, Difficulty={difficulty}, Options={len(options)}"
            )

            # Insert or get category
            cursor.execute(
                "INSERT OR IGNORE INTO categories (name) VALUES (?)", (category,)
            )
            cursor.execute("SELECT id FROM categories WHERE name = ?", (category,))
            category_result = cursor.fetchone()

            if not category_result:
                logger.error(f"Failed to get category ID for: {category}")
                continue

            category_id = category_result[0]
            logger.debug(f"Category ID for '{category}': {category_id}")

            # Insert question
            cursor.execute(
                "INSERT INTO questions (text, category_id, difficulty) VALUES (?, ?, ?)",
                (question_text, category_id, difficulty),
            )
            question_id = cursor.lastrowid
            logger.debug(f"Inserted question with ID: {question_id}")

            # Insert answers
            correct_count = 0
            for j, option in enumerate(options):
                if "text" not in option or "isCorrect" not in option:
                    logger.warning(
                        f"Question {i + 1}, option {j + 1} missing required fields"
                    )
                    continue

                cursor.execute(
                    "INSERT INTO answers (question_id, text, is_correct) VALUES (?, ?, ?)",
                    (question_id, option["text"], option["isCorrect"]),
                )

                if option["isCorrect"]:
                    correct_count += 1

            logger.debug(
                f"Question {i + 1}: Added {len(options)} options, {correct_count} correct"
            )
            added_count += 1

        conn.commit()
        conn.close()

        logger.info(f"Successfully added {added_count} questions to database")
        return added_count

    except sqlite3.Error as e:
        logger.error(f"Database error: {e}")
        return 0
    except Exception as e:
        logger.error(f"Error adding questions to database: {e}")
        logger.error(f"Error type: {type(e).__name__}")
        return 0


def main():
    logger.info("Starting generate_questions.py")
    logger.info(f"Command line arguments: {sys.argv}")

    if len(sys.argv) < 3:
        logger.error("Insufficient command line arguments")
        print("Usage: python generate_questions.py <category> <difficulty> [count]")
        print("Example: python generate_questions.py Technology Easy 5")
        print(
            "Categories: Technology, Science, Geography, History, Literature, Sports, Music, Art, Film"
        )
        print("Difficulties: Easy, Medium, Hard")
        sys.exit(1)

    category = sys.argv[1]
    difficulty = sys.argv[2]
    count = int(sys.argv[3]) if len(sys.argv) > 3 else 5

    logger.info(
        f"Parsed arguments - Category: {category}, Difficulty: {difficulty}, Count: {count}"
    )

    # Validate inputs
    valid_categories = [
        "Technology",
        "Science",
        "Geography",
        "History",
        "Literature",
        "Sports",
        "Music",
        "Art",
        "Film",
    ]
    valid_difficulties = ["Easy", "Medium", "Hard"]

    if category not in valid_categories:
        logger.error(f"Invalid category: {category}")
        print(f"Invalid category. Valid categories: {', '.join(valid_categories)}")
        sys.exit(1)

    if difficulty not in valid_difficulties:
        logger.error(f"Invalid difficulty: {difficulty}")
        print(
            f"Invalid difficulty. Valid difficulties: {', '.join(valid_difficulties)}"
        )
        sys.exit(1)

    if count < 1 or count > 20:
        logger.error(f"Invalid count: {count}")
        print("Count must be between 1 and 20")
        sys.exit(1)

    logger.info("All input validation passed")

    # Check for API key
    if not os.environ.get("GEMINI_API_KEY"):
        logger.error("GEMINI_API_KEY environment variable not set")
        print("Please set the GEMINI_API_KEY environment variable")
        sys.exit(1)

    logger.info(f"Generating {count} {difficulty} questions for {category}...")
    print(f"Generating {count} {difficulty} questions for {category}...")

    # Generate questions
    questions_data = generate_questions(category, difficulty, count)

    if not questions_data:
        logger.error("Failed to generate questions")
        print("Failed to generate questions")
        sys.exit(1)

    logger.info(f"Generated {len(questions_data)} questions")

    # Validate generated data
    if not isinstance(questions_data, list) or len(questions_data) == 0:
        logger.error("Invalid response format from AI")
        print("Invalid response format from AI")
        sys.exit(1)

    logger.info("Generated data validation passed")

    # Add to database
    logger.info("Adding questions to database...")
    print("Adding questions to database...")
    added_count = add_questions_to_database(questions_data)

    if added_count > 0:
        logger.info(f"Successfully generated and added {added_count} questions!")
        print(f"Successfully generated and added {added_count} questions!")
    else:
        logger.error("Failed to add questions to database")
        print("Failed to add questions to database")


if __name__ == "__main__":
    main()
