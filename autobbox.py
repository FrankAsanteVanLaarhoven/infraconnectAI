from PIL import Image
import os

paths = [
    "public/brand/logo-main.png",
    "public/brand/favicon-source.png",
    "public/brand/logo-video.png",
    "public/brand/logo-anim.png"
]

for p in paths:
    if os.path.exists(p):
        try:
            img = Image.open(p)
            bbox = img.getbbox()
            if bbox:
                # Add a tiny 2% padding just to avoid sharp cutoff glares
                pad = int(min(img.width, img.height) * 0.02)
                bbox = (
                    max(0, bbox[0] - pad),
                    max(0, bbox[1] - pad),
                    min(img.width, bbox[2] + pad),
                    min(img.height, bbox[3] + pad)
                )
                cropped = img.crop(bbox)
                cropped.save(p)
                print(f"Dynamically cropped {p} to boundary box {bbox}")
        except Exception as e:
            print(f"Failed {p}: {e}")
