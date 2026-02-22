from PIL import Image
import os

def replace_white_with_bg(input_path, output_path, bg_color=(2, 6, 23, 255)): # #020617
    if not os.path.exists(input_path):
        print(f"File not found: {input_path}")
        return

    img = Image.open(input_path).convert("RGBA")
    data = img.getdata()

    new_data = []
    # Replace white (and near-white) with the theme background color
    for item in data:
        # Check if the pixel is near white (e.g. R, G, B > 240)
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            # Optionally blend based on original alpha, but let's just replace
            new_data.append(bg_color)
        else:
            new_data.append(item)

    img.putdata(new_data)
    img.save(output_path, "PNG")
    print(f"Saved recolored icon to: {output_path}")

# Run for both icon sizes
base_dir = "d:/NotNotes-pwa/public"
replace_white_with_bg(f"{base_dir}/icon-192.png", f"{base_dir}/icon-192x192.png")
replace_white_with_bg(f"{base_dir}/icon-512.png", f"{base_dir}/icon-512x512.png")
