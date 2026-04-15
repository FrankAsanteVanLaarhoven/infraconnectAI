from PIL import Image
import os

def aggressive_boost(path, start_ratio):
    try:
        # Load the original file from the root assets to avoid double-processing
        src_map = {
             "public/brand/logo-main.png": "/Users/favl/Downloads/infraconnectAI/assets/INFRACONNECTAI-LOGO/Futuristic InfraConnect AI logo design (4).png",
             "public/brand/logo-video.png": "/Users/favl/Downloads/infraconnectAI/assets/INFRACONNECTAI-LOGO/Futuristic metallic logo with AI design (1).png"
        }
        
        src_path = src_map[path]
        img = Image.open(src_path).convert("RGBA")
        
        # We also need to run the bounding box crop again since we are loading from source!
        bbox = img.getbbox()
        if bbox:
            pad = int(min(img.width, img.height) * 0.02)
            bbox = (
                max(0, bbox[0] - pad),
                max(0, bbox[1] - pad),
                min(img.width, bbox[2] + pad),
                min(img.height, bbox[3] + pad)
            )
            img = img.crop(bbox)
        
        data = img.load()
        width, height = img.size
        
        for y in range(height):
            for x in range(width):
                if x > width * start_ratio:
                    r, g, b, a = data[x, y]
                    if a > 5:
                        transition_zone = max(1.0, width * 0.05)
                        blend = min(1.0, (x - width * start_ratio) / transition_zone)
                        
                        # Preserve bright blue
                        is_blue = b > r + 30 and b > g + 30
                        
                        # Turn the metal letters almost pure white/platinum (85% push to white)
                        boost = 0.85 if not is_blue else 0.1
                        
                        nr = min(255, int(r + (255 - r) * boost * blend))
                        ng = min(255, int(g + (255 - g) * boost * blend))
                        nb = min(255, int(b + (255 - b) * boost * blend))
                        
                        # If it's a very dark pixel, boost its alpha slightly so shadows aren't lost
                        na = min(255, max(a, int(a * 1.5)) if r < 50 and blend > 0.5 else a)
                        
                        data[x, y] = (nr, ng, nb, na)
        
        img.save(path)
        print(f"Aggressively boosted text in {path}")
    except Exception as e:
        print(f"Failed {path}: {e}")

aggressive_boost("public/brand/logo-main.png", 0.25)
aggressive_boost("public/brand/logo-video.png", 0.0)
