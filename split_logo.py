from PIL import Image
import os

def extract_text_only(src_path, dest_path):
    try:
        # Load from the natively transparent & illuminated public/brand/logo-main.png
        img = Image.open(src_path).convert("RGBA")
        width, height = img.size
        
        # The symbol geometry fully terminates by 38%. We slice at 42% just to be insanely safe, because the text usually starts right around 50% anyway.
        crop_x = int(width * 0.42)
        
        bbox = (crop_x, 0, width, height)
        text_img = img.crop(bbox)
        
        # Now tight crop
        data = text_img.load()
        w, h = text_img.size
        min_x, min_y = w, h
        max_x, max_y = 0, 0
        found = False
        for y in range(h):
            for x in range(w):
                if data[x, y][3] > 20:
                    found = True
                    if x < min_x: min_x = x
                    if y < min_y: min_y = y
                    if x > max_x: max_x = x
                    if y > max_y: max_y = y
        
        if found and min_x <= max_x and min_y <= max_y:
            pad = int(min(w, h) * 0.05)
            # Add horizontal width to make it look smooth
            hpad = int(w * 0.02)
            final_bbox = (
                max(0, min_x - hpad),
                max(0, min_y - pad),
                min(w, max_x + hpad),
                min(h, max_y + pad)
            )
            text_img = text_img.crop(final_bbox)
            text_img.save(dest_path)
            print(f"Extracted PERFECT text fragment at {dest_path}")
        else:
            print("Could not find text bounds")
    except Exception as e:
        print(f"Error: {e}")

extract_text_only("public/brand/logo-main.png", "public/brand/logo-text-only.png")
