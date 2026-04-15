from PIL import Image

try:
    img = Image.open('public/brand/favicon-source.png')
    size = (max(img.width, img.height), max(img.width, img.height))
    sq = Image.new("RGBA", size, (255, 255, 255, 0))
    sq.paste(img, (int((size[0]-img.width)/2), int((size[1]-img.height)/2)))
    
    sq.resize((256, 256), Image.Resampling.LANCZOS).save("src/app/icon.png", format="PNG")
    sq.resize((256, 256), Image.Resampling.LANCZOS).save("public/favicon.ico", format="ICO")
    print("Favicons baked seamlessly!")
except Exception as e:
    print(e)
