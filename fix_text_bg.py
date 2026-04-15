import io
from rembg import remove
from PIL import Image

def process_text_logo(src_path, dest_path):
    print(f"Reading {src_path}...")
    with open(src_path, "rb") as input_file:
        input_data = input_file.read()
    
    print("Running deep-learning background removal (U^2-Net)...")
    # rembg automatically handles white backgrounds, preserving anti-aliasing
    no_bg_data = remove(input_data)
    
    img = Image.open(io.BytesIO(no_bg_data)).convert("RGBA")
    data = img.load()
    width, height = img.size
    
    print("Illuminating dark metal text...")
    min_x, min_y = width, height
    max_x, max_y = 0, 0
    
    for y in range(height):
        for x in range(width):
            r, g, b, a = data[x, y]
            if a > 10:
                # Track tight bounding box
                if x < min_x: min_x = x
                if y < min_y: min_y = y
                if x > max_x: max_x = x
                if y > max_y: max_y = y
                
                # Protect specific blue colors (like the neon "AI")
                is_blue = b > r + 30 and b > g + 30
                
                # We want to boost the dark grey metal to bright platinum
                boost_factor = 0.85 if not is_blue else 0.1
                
                nr = min(255, int(r + (255 - r) * boost_factor))
                ng = min(255, int(g + (255 - g) * boost_factor))
                nb = min(255, int(b + (255 - b) * boost_factor))
                
                # Increase alpha of semitransparent shadows for solidity
                na = min(255, max(a, int(a * 1.5)))
                
                data[x, y] = (nr, ng, nb, na)

    if min_x < max_x and min_y < max_y:
        pad = int(min(width, height) * 0.05)
        # Leave a tiny bit of horizontal padding
        hpad = int(width * 0.02)
        bbox = (
            max(0, min_x - hpad),
            max(0, min_y - pad),
            min(width, max_x + hpad),
            min(height, max_y + pad)
        )
        print(f"Tight cropping text to {bbox}...")
        img = img.crop(bbox)
        
    img.save(dest_path)
    print(f"Successfully saved pristine text asset to {dest_path}")

try:
    process_text_logo(
        "/Users/favl/Downloads/infraconnectAI/assets/INFRACONNECTAI-LOGO/Futuristic metallic logo with AI design (1).png",
        "public/brand/logo-video.png"
    )
except Exception as e:
    print(f"Error processing logo: {e}")

