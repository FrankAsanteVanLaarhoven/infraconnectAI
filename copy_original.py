from PIL import Image
import os

assets = [
    ("/Users/favl/Downloads/infraconnectAI/assets/INFRACONNECTAI-LOGO/Futuristic InfraConnect AI logo design (4).png", "public/brand/logo-main.png"),
    ("/Users/favl/Downloads/infraconnectAI/assets/INFRACONNECTAI-LOGO/InfraConnect AI 3D logo design (1).png", "public/brand/favicon-source.png"),
    ("/Users/favl/Downloads/infraconnectAI/assets/INFRACONNECTAI-LOGO/Futuristic metallic logo with AI design (1).png", "public/brand/logo-video.png"),
    ("/Users/favl/Downloads/infraconnectAI/assets/INFRACONNECTAI-LOGO/Futuristic IC logo with glowing swoosh (1).png", "public/brand/logo-anim.png")
]

for src, dest in assets:
    if os.path.exists(src):
        img = Image.open(src)
        bbox = img.getbbox()
        if bbox:
            pad = int(min(img.width, img.height) * 0.02)
            bbox = (
                max(0, bbox[0] - pad),
                max(0, bbox[1] - pad),
                min(img.width, bbox[2] + pad),
                min(img.height, bbox[3] + pad)
            )
            img.crop(bbox).save(dest)
            print(f"Copied original & cropped {dest}")
