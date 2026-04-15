import base64
from PIL import Image

png_path = "public/brand/logo-4.png"

# Convert to ICO
try:
    img = Image.open(png_path)
    # Ensure it's square for ico (or resize)
    size = (max(img.width, img.height), max(img.width, img.height))
    sq = Image.new("RGBA", size, (255, 255, 255, 0))
    sq.paste(img, (int((size[0]-img.width)/2), int((size[1]-img.height)/2)))
    sq.resize((256, 256), Image.Resampling.LANCZOS).save("src/app/favicon.ico", format="ICO")
    sq.resize((256, 256), Image.Resampling.LANCZOS).save("public/favicon.ico", format="ICO")
    print("Created favicon.ico")
except Exception as e:
    print(f"Error creating ICO: {e}")

# Convert to Base64 embedded SVG
try:
    with open(png_path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode("utf-8")
    
    # logo-4.png has a specific width/height
    w, h = img.width, img.height
    
    svg_content = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="100%" height="100%">
  <image href="data:image/png;base64,{b64}" width="{w}" height="{h}" x="0" y="0"/>
</svg>"""
    
    with open("public/brand/logo.svg", "w") as f:
        f.write(svg_content)
    
    print("Created logo.svg")
except Exception as e:
    print(f"Error creating SVG: {e}")

