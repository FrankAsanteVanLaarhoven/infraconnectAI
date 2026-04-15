import sys
import os
from rembg import remove
from PIL import Image

assets = [
    ("/Users/favl/Downloads/infraconnectAI/assets/INFRACONNECTAI-LOGO/Futuristic InfraConnect AI logo design (4).png", "public/brand/logo-main.png"),
    ("/Users/favl/Downloads/infraconnectAI/assets/INFRACONNECTAI-LOGO/InfraConnect AI 3D logo design (1).png", "public/brand/favicon-source.png"),
    ("/Users/favl/Downloads/infraconnectAI/assets/INFRACONNECTAI-LOGO/Futuristic metallic logo with AI design (1).png", "public/brand/logo-video.png"),
    ("/Users/favl/Downloads/infraconnectAI/assets/INFRACONNECTAI-LOGO/Futuristic IC logo with glowing swoosh (1).png", "public/brand/logo-anim.png")
]

for src, dest in assets:
    if os.path.exists(src):
        print(f"Processing {src}")
        try:
            img = Image.open(src)
            output = remove(img)
            output.save(dest)
            print(f"Saved to {dest}")
        except Exception as e:
            print(f"Error: {e}")
    else:
        print(f"NOT FOUND: {src}")

