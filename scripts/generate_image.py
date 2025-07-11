import os
import sys
from datetime import datetime
from io import BytesIO

from google import genai
from PIL import Image


def generate_and_save_image(prompt):
    """
    Generates an image based on a prompt and saves it to a file.
    """
    try:
        client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

        result = client.models.generate_images(
            model="models/imagen-4.0-generate-preview-06-06",
            prompt=prompt,
            config=dict(
                number_of_images=1,
                output_mime_type="image/png",
                person_generation="ALLOW_ADULT",
                aspect_ratio="1:1",
            ),
        )

        if not result.generated_images:
            print("No images generated.")
            return

        if len(result.generated_images) != 1:
            print("Number of images generated does not match the requested number.")
            return

        # Create the images directory if it doesn't exist
        images_dir = os.path.join(os.path.dirname(__file__), "images")
        os.makedirs(images_dir, exist_ok=True)

        # Generate a unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{timestamp}.png"
        filepath = os.path.join(images_dir, filename)

        # Save the image
        for generated_image in result.generated_images:
            image = Image.open(BytesIO(generated_image.image.image_bytes))
            image.save(filepath)
            print(f"Image saved successfully: {filepath}")

    except Exception as e:
        print(f"An error occurred: {e}")
        if "API_KEY" in str(e):
            print(
                "Please make sure your GEMINI_API_KEY environment variable is set correctly."
            )


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print('Usage: python generate_image.py "<your_prompt>"')
        sys.exit(1)

    input_prompt = sys.argv[1]
    generate_and_save_image(input_prompt)
