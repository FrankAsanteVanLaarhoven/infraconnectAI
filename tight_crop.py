from PIL import Image

def get_tight_bbox(img, alpha_threshold=15):
    data = img.load()
    width, height = img.size
    min_x, min_y = width, height
    max_x, max_y = 0, 0
    for y in range(height):
        for x in range(width):
            if data[x, y][3] > alpha_threshold:
                if x < min_x: min_x = x
                if y < min_y: min_y = y
                if x > max_x: max_x = x
                if y > max_y: max_y = y
    if min_x < max_x and min_y < max_y:
        return (min_x, min_y, max_x, max_y)
    return None

def apply_tight_crop(path):
    try:
        img = Image.open(path).convert("RGBA")
        bbox = get_tight_bbox(img, alpha_threshold=15)
        if bbox:
            pad = int(min(img.width, img.height) * 0.05)
            # Make sure we don't crop out too much glow. 5% padding gives it room.
            bbox = (
                max(0, bbox[0] - pad),
                max(0, bbox[1] - pad),
                min(img.width, bbox[2] + pad),
                min(img.height, bbox[3] + pad)
            )
            img.crop(bbox).save(path)
            print(f"Tightly cropped {path} to {bbox}")
        else:
            print(f"No bbox found for {path}")
    except Exception as e:
        print(f"Failed {path}: {e}")

apply_tight_crop("public/brand/logo-main.png")
apply_tight_crop("public/brand/logo-video.png")
