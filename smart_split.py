from PIL import Image

def smart_extract_text(src_path, dest_path):
    try:
        img = Image.open(src_path).convert("RGBA")
        width, height = img.size
        data = img.load()
        
        # 1. Find the rightmost edge of the diamond
        # The diamond ends roughly in the first half of the image.
        # It contains bright blue pixels or very solid metallic pixels.
        diamond_right_x = 0
        
        # Scan the first 50% of the image to find the true gap
        # We can look for a vertical column that has VERY FEW or NO non-transparent pixels!
        # The gap between the diamond and the 'I' will be an empty column.
        
        best_gap_x = int(width * 0.35) # default fallback
        
        # Look for empty columns between 25% and 45% of width
        start_scan = int(width * 0.25)
        end_scan = int(width * 0.45)
        
        for x in range(start_scan, end_scan):
            # count opaque pixels in this column
            opaque_count = 0
            for y in range(height):
                if data[x, y][3] > 20: 
                    opaque_count += 1
            
            # If we find a completely empty column, that is the gap!
            if opaque_count == 0:
                print(f"Found true transparent gap at X={x}!")
                best_gap_x = x
                # We can break, because the first empty column after the diamond is perfect.
                # Actually, the gap might be multiple pixels wide. We will take the middle of the gap.
                gap_start = x
                gap_end = x
                for x2 in range(gap_start, end_scan):
                    op_count = 0
                    for y in range(height):
                        if data[x2, y][3] > 20:
                            op_count += 1
                    if op_count == 0:
                        gap_end = x2
                    else:
                        break
                
                best_gap_x = gap_start + (gap_end - gap_start) // 2
                print(f"Gap spans from {gap_start} to {gap_end}. Cropping at {best_gap_x}.")
                break

        print(f"Slicing at {float(best_gap_x) / width * 100:.2f}% (x={best_gap_x})")
        
        crop_x = best_gap_x
        bbox = (crop_x, 0, width, height)
        text_img = img.crop(bbox)
        
        # Tight crop
        t_data = text_img.load()
        w, h = text_img.size
        min_x, min_y = w, h
        max_x, max_y = 0, 0
        found = False
        for y in range(h):
            for x in range(w):
                if t_data[x, y][3] > 20:
                    found = True
                    if x < min_x: min_x = x
                    if y < min_y: min_y = y
                    if x > max_x: max_x = x
                    if y > max_y: max_y = y
                    
        if found:
            pad = int(min(w, h) * 0.05)
            hpad = int(w * 0.02)
            final_bbox = (
                max(0, min_x - hpad),
                max(0, min_y - pad),
                min(w, max_x + hpad),
                min(h, max_y + pad)
            )
            text_img = text_img.crop(final_bbox)
            text_img.save(dest_path)
            print(f"Successfully saved cleanly severed text to {dest_path}")
        else:
            print("Failed to tighten bbox")
            
    except Exception as e:
        print(f"Error: {e}")

smart_extract_text("public/brand/logo-main.png", "public/brand/logo-text-only.png")
