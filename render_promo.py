# render_promo.py - Render promo video to MP4 (English version)
import os
import math
import imageio
import numpy as np

W, H = 1280, 720
FPS = 60
TOTAL_FRAMES = FPS * 30  # 30 seconds

OUTPUT_DIR = r"D:\my-ai-game-site"
MP4_PATH = os.path.join(OUTPUT_DIR, "gamedev-ai-promo.mp4")
TEMP_DIR = os.path.join(OUTPUT_DIR, "_promo_frames")
os.makedirs(TEMP_DIR, exist_ok=True)

print(f"Rendering {TOTAL_FRAMES} frames ({TOTAL_FRAMES//FPS}s @ {FPS}fps)...")
print(f"Output: {MP4_PATH}")

# ===== Particles =====
particles = [{
    "x": np.random.uniform(0, W),
    "y": np.random.uniform(0, H),
    "vx": np.random.uniform(-0.4, 0.4),
    "vy": np.random.uniform(-0.4, 0.4),
    "r": np.random.uniform(0.5, 2.5),
    "alpha": np.random.uniform(0.1, 0.5),
    "color": [0, 245, 255] if np.random.random() > 0.5 else [191, 0, 255]
} for _ in range(120)]

def update_particles():
    for p in particles:
        p["x"] += p["vx"]
        p["y"] += p["vy"]
        if p["x"] < 0: p["x"] = W
        if p["x"] > W: p["x"] = 0
        if p["y"] < 0: p["y"] = H
        if p["y"] > H: p["y"] = 0

def draw_particles(arr, alpha=1.0):
    for p in particles:
        px, py = int(p["x"]), int(p["y"])
        if 0 <= px < W and 0 <= py < H:
            c = [int(p["color"][i] * p["alpha"] * alpha) for i in range(3)]
            arr[py, px] = c + [255]

# ===== Helper functions =====
def ease_out(t):
    t = max(0, min(1, t))
    return 1 - (1 - t) ** 3

def progress(f, start, end):
    return max(0, min(1, (f - start) / (end - start)))

def make_frame_np(arr, x, y, w, h, r, color):
    """Draw rounded rect on numpy array"""
    from PIL import Image
    img = Image.fromarray(arr)
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle([x, y, x+w, y+h], radius=r, fill=tuple(color[:3]))
    return np.array(img)

# ===== PIL setup =====
from PIL import Image, ImageDraw, ImageFont

# Try to find a font that supports English well
FONT_PATHS = [
    "arial.ttf",
    "C:/Windows/Fonts/arial.ttf",
    "C:/Windows/Fonts/segoeui.ttf",
    "C:/Windows/Fonts/tahoma.ttf",
    "C:/Windows/Fonts/Calibri.ttf",
]

font_main = None
font_sub = None
font_code = None
font_small = None
font_med = None

for fp in FONT_PATHS:
    try:
        font_main = ImageFont.truetype(fp, 80)
        font_sub = ImageFont.truetype(fp, 30)
        font_code = ImageFont.truetype(fp, 16)
        font_small = ImageFont.truetype(fp, 18)
        font_med = ImageFont.truetype(fp, 22)
        print(f"Using font: {fp}")
        break
    except:
        continue

if font_main is None:
    font_main = ImageFont.load_default()
    font_sub = font_main
    font_code = font_main
    font_small = font_main
    font_med = font_main
    print("Using default font (English only)")

def draw_neon_text(draw, text, cx, cy, size, color_rgb, alpha=255, shadow=25):
    """Draw neon-style text"""
    r, g, b = color_rgb
    # Shadow/glow
    for offset in range(shadow, 0, -3):
        draw.text((cx, cy), text, font=font_main, anchor='mm',
                  fill=(r, g, b, max(1, alpha // (shadow // offset))))
    # Main text
    draw.text((cx, cy), text, font=font_main, anchor='mm', fill=(r, g, b, alpha))

def draw_code_text(draw, text, x, y, alpha=255):
    """Draw monospace code text"""
    draw.text((x, y), text, font=font_code, fill=(168, 255, 120, alpha))

def make_frame(f):
    update_particles()

    # Background
    img = Image.new('RGBA', (W, H), (5, 5, 16, 255))
    draw = ImageDraw.Draw(img)

    # Grid
    for x in range(0, W, 60):
        draw.line([(x, 0), (x, H)], fill=(0, 245, 255, 22), width=1)
    for y in range(0, H, 60):
        draw.line([(0, y), (W, y)], fill=(0, 245, 255, 22), width=1)

    # Particles
    for p in particles:
        px, py = int(p["x"]), int(p["y"])
        if 0 <= px < W and 0 <= py < H:
            a = int(p["alpha"] * 255)
            draw.ellipse([px-1, py-1, px+1, py+1], fill=(p["color"][0], p["color"][1], p["color"][2], a))

    CYAN = (0, 245, 255)
    PURPLE = (191, 0, 255)
    GREEN = (0, 255, 136)
    WHITE = (224, 224, 255)

    # ==================== SCENE 1: Logo (0-300) ====================
    if f < 300:
        p1 = ease_out(progress(f, 0, 60))
        p2 = ease_out(progress(f, 60, 180))
        p3 = ease_out(progress(f, 180, 280))
        fade = 1 - progress(f, 260, 300)

        # Expanding rings
        for i in range(3):
            r_val = int(p1 * (300 + i * 80))
            a_val = max(0, int((1 - p1 * 0.3) * (40 - i*10) * fade * 255))
            draw.ellipse([W//2-r_val, H//2-r_val, W//2+r_val, H//2+r_val],
                         outline=(CYAN[0], CYAN[1], CYAN[2], a_val), width=2)

        # Main title - GAME (cyan) DEV. (purple)
        ta = int(p2 * fade * 255)
        if ta > 0:
            draw.text((W//2 - 5, H//2 - 50), "GAME", font=font_main, anchor='mm',
                      fill=(CYAN[0], CYAN[1], CYAN[2], ta))
            draw.text((W//2 + 5, H//2 - 50), "DEV.AI", font=font_main, anchor='mm',
                      fill=(PURPLE[0], PURPLE[1], PURPLE[2], ta))

        # Subtitle typewriter
        sa = int(p3 * fade * 255)
        if sa > 0:
            sub = "AI-Powered Game Generator"
            shown = sub[:int(p3 * len(sub))]
            draw.text((W//2, H//2 + 80), shown + ("|" if p3 < 1 else ""),
                      font=font_sub, fill=(WHITE[0], WHITE[1], WHITE[2], sa), anchor='mm')

        # Bottom glow line
        la = int(p2 * fade * 200)
        if la > 0:
            draw.line([(W//2-400, H//2+120), (W//2+400, H//2+120)],
                      fill=(CYAN[0], CYAN[1], CYAN[2], la), width=1)

    # ==================== SCENE 2: AI Game Generation (300-600) ====================
    if 280 <= f < 600:
        fi = progress(f, 280, 340)
        fo = 1 - progress(f, 560, 600)
        alpha = min(fi, fo)

        ta = int(alpha * ease_out(progress(f, 300, 380)) * 255)
        if ta > 0:
            draw.text((W//2, 100), "[ AI GAME GENERATOR ]", font=font_med,
                      fill=(CYAN[0], CYAN[1], CYAN[2], ta), anchor='mm')

        # Input box
        box_a = int(alpha * ease_out(progress(f, 340, 420)) * 255)
        if box_a > 0:
            draw.rounded_rectangle([W//2-380, 160, W//2+380, 240], radius=10,
                                   fill=(15, 15, 42, box_a))
            draw.text((W//2 - 370, 200), "> Space shooter game, arrow keys to move...",
                      font=font_code, fill=(WHITE[0], WHITE[1], WHITE[2], box_a))

        # Generate button
        btn_a = int(alpha * ease_out(progress(f, 460, 520)) * 255)
        if btn_a > 0:
            draw.rounded_rectangle([W//2-110, 270, W//2+110, 320], radius=8,
                                   fill=(CYAN[0], CYAN[1], CYAN[2], btn_a))
            draw.text((W//2, 297), "[ GENERATE ]", font=font_small,
                      fill=(0, 0, 0, btn_a), anchor='mm')

        # Code block
        code_a = int(alpha * ease_out(progress(f, 500, 560)) * 255)
        if code_a > 0:
            draw.rounded_rectangle([W//2-380, 350, W//2+380, 550], radius=10,
                                   fill=(5, 5, 16, code_a))
            code_lines = [
                'const canvas = document.getElementById("c");',
                'const ctx = canvas.getContext("2d");',
                'let player = { x: 400, y: 500, speed: 5 };',
                'let bullets = [], enemies = [], score = 0;',
                'function gameLoop() { update(); draw(); }',
                'requestAnimationFrame(gameLoop);',
            ]
            cp = ease_out(progress(f, 510, 580))
            shown = min(len(code_lines), int(cp * len(code_lines)) + 1)
            for i, line in enumerate(code_lines[:shown]):
                c = (168, 255, 120) if i % 2 == 0 else (121, 192, 255)
                draw.text((W//2 - 360, 385 + i * 28), line,
                          font=font_code, fill=(c[0], c[1], c[2], code_a))

    # ==================== SCENE 3: Iteration (600-900) ====================
    if 580 <= f < 900:
        fi = progress(f, 580, 640)
        fo = 1 - progress(f, 860, 900)
        alpha = min(fi, fo)

        ta = int(alpha * ease_out(progress(f, 600, 680)) * 255)
        if ta > 0:
            draw.text((W//2, 80), "[ ITERATIVE MODIFICATION ]", font=font_med,
                      fill=(GREEN[0], GREEN[1], GREEN[2], ta), anchor='mm')

        bubbles = [
            ("user",  "Generate a brick breaker game", 640),
            ("ai",    "Done! Includes paddle, bricks, score...", 700),
            ("user",  "Speed up the ball, add lives display", 760),
            ("ai",    "Updated! Ball +30% speed, 3 lives shown", 820),
        ]

        for idx, (role, text, bf) in enumerate(bubbles):
            ba = int(alpha * ease_out(progress(f, bf, bf+40)) * 255)
            if ba <= 0:
                continue
            y = 150 + idx * 95
            x = W//2 - (100 if role == "ai" else 300)
            fill_c = (26, 26, 58, ba) if role == "user" else (10, 42, 26, ba)
            draw.rounded_rectangle([x, y, x+560, y+65], radius=10, fill=fill_c)
            role_label = ">> USER:" if role == "user" else ">> AI:"
            role_c = CYAN if role == "user" else GREEN
            draw.text((x + 14, y + 18), role_label, font=font_small,
                      fill=(role_c[0], role_c[1], role_c[2], ba))
            draw.text((x + 14, y + 42), text, font=font_small,
                      fill=(WHITE[0], WHITE[1], WHITE[2], ba))

        # Context memory badge
        ba = int(alpha * ease_out(progress(f, 820, 870)) * 255)
        if ba > 0:
            draw.rounded_rectangle([W//2+280, 520, W//2+550, 570], radius=8,
                                   fill=(0, 50, 20, ba), outline=(0, 255, 136, ba), width=1)
            draw.text((W//2+415, 535), "[ AI REMEMBERS CONTEXT ]",
                      font=font_small, fill=(GREEN[0], GREEN[1], GREEN[2], ba), anchor='mm')
            draw.text((W//2+415, 555), "Preserves all history",
                      font=font_code, fill=(100, 100, 100, ba), anchor='mm')

    # ==================== SCENE 4: Built-in Game (900-1200) ====================
    if 880 <= f < 1200:
        fi = progress(f, 880, 940)
        fo = 1 - progress(f, 1160, 1200)
        alpha = min(fi, fo)

        ta = int(alpha * ease_out(progress(f, 900, 980)) * 255)
        if ta > 0:
            draw.text((W//2, 100), "[ SPACE COLLECTOR - BUILT IN ]", font=font_med,
                      fill=(PURPLE[0], PURPLE[1], PURPLE[2], ta), anchor='mm')

        ga = int(alpha * ease_out(progress(f, 940, 1000)) * 255)
        if ga > 0:
            # Game border
            draw.rounded_rectangle([W//2-320, 140, W//2+320, 560], radius=12,
                                   fill=(10, 10, 26, ga))

            # Star field background
            for i in range(40):
                bx = ((i * 137 + f * 0.5) % 620) + W//2 - 310
                by = ((i * 97 + f * 0.3) % 400) + 150
                draw.ellipse([bx-1, by-1, bx+1, by+1], fill=(255, 255, 255, int(ga * 0.3)))

            # Player ship
            px = W//2 + int(math.sin(f * 0.04) * 150)
            py = 480
            draw.polygon([(px, py-20), (px+18, py+20), (px, py+10), (px-18, py+20)],
                         fill=(CYAN[0], CYAN[1], CYAN[2], ga))

            # Stars
            for i in range(5):
                sx = W//2 - 250 + i * 130
                sy = 220 + int(math.sin(f * 0.05 + i) * 20)
                pulse = int(math.sin(f * 0.08 + i) * 3)
                r_val = 12 + pulse
                hue = 40 + i * 15
                draw.ellipse([sx-r_val, sy-r_val, sx+r_val, sy+r_val],
                             fill=(255, int(200 + i*10), 50, ga))

            # Enemies
            for i in range(3):
                ex = W//2 - 180 + i * 180
                ey = int(300 + (f * 1.5 + i * 80) % 200)
                draw.rectangle([ex-14, ey-14, ex+14, ey+14],
                               fill=(255, 68, 68, ga))

            # HUD
            draw.text((W//2 - 310, 170), f"SCORE: {(f-900)*2}",
                      font=font_small, fill=(CYAN[0], CYAN[1], CYAN[2], ga))
            draw.text((W//2 + 200, 170), "[ + + + ]",
                      font=font_small, fill=(255, 100, 100, ga))

        ca = int(alpha * ease_out(progress(f, 1060, 1120)) * 255)
        if ca > 0:
            draw.text((W//2, 600), "ARROW KEYS to move | Collect stars | Avoid enemies",
                      font=font_small, fill=(136, 136, 170, ca), anchor='mm')

    # ==================== SCENE 5: Features (1200-1500) ====================
    if 1180 <= f < 1500:
        fi = progress(f, 1180, 1240)
        fo = 1 - progress(f, 1460, 1500)
        alpha = min(fi, fo)

        ta = int(alpha * ease_out(progress(f, 1200, 1260)) * 255)
        if ta > 0:
            draw.text((W//2, 60), "[ ALL FEATURES ]", font=font_med,
                      fill=(CYAN[0], CYAN[1], CYAN[2], ta), anchor='mm')

        features = [
            ("[AI]", "Game Generation", "Describe in plain language", "#00f5ff", 1240),
            ("[~]",  "Iterative Editing", "AI remembers context", "#00ff88", 1290),
            ("[G]",  "Built-in Games", "Play immediately", "#bf00ff", 1340),
            ("[#]",  "Code Editor", "View, edit, preview live", "#ff8c00", 1390),
            ("[*]",  "Zero Dependencies", "Pure HTML5+JS", "#ffff00", 1430),
        ]

        for i, (icon, title, desc, color, ff) in enumerate(features):
            fa = int(alpha * ease_out(progress(f, ff, ff+40)) * 255)
            if fa <= 0:
                continue
            col = i % 3
            row = i // 3
            x = W//2 - 480 + col * 320
            y = 130 + row * 160

            r_i = int(color[1:3], 16)
            g_i = int(color[3:5], 16)
            b_i = int(color[5:7], 16)

            draw.rounded_rectangle([x, y, x+280, y+130], radius=10,
                                   fill=(r_i//4, g_i//4, b_i//4, fa))
            draw.text((x + 14, y + 20), icon, font=font_med,
                      fill=(255, 255, 255, fa))
            draw.text((x + 70, y + 18), title, font=font_small,
                      fill=(r_i, g_i, b_i, fa))
            draw.text((x + 14, y + 60), desc, font=font_code,
                      fill=(136, 136, 170, fa))

    # ==================== SCENE 6: CTA (1480-1800) ====================
    if f >= 1480:
        fi = progress(f, 1480, 1560)
        alpha = ease_out(fi)

        # Glow
        for r_val in range(500, 0, -20):
            a_val = min(int(alpha * 3), 20)
            if a_val > 0:
                draw.ellipse([W//2-r_val, H//2-r_val*6//10, W//2+r_val, H//2+r_val*6//10],
                             fill=(0, 245, 255, a_val))

        ta = int(alpha * ease_out(progress(f, 1520, 1600)) * 255)
        if ta > 0:
            draw.text((W//2, H//2 - 80), "GAMEDEV.AI", font=font_main, anchor='mm',
                      fill=(CYAN[0], CYAN[1], CYAN[2], ta))

        sa = int(alpha * ease_out(progress(f, 1580, 1650)) * 255)
        if sa > 0:
            draw.text((W//2, H//2 + 20), "Generate Your Game with AI",
                      font=font_sub, fill=(WHITE[0], WHITE[1], WHITE[2], sa), anchor='mm')

        ua = int(alpha * ease_out(progress(f, 1640, 1700)) * 255)
        if ua > 0:
            draw.text((W//2, H//2 + 100), "http://127.0.0.1:9090", font=font_small, anchor='mm',
                      fill=(CYAN[0], CYAN[1], CYAN[2], ua))

        # Line
        la = int(alpha * ease_out(progress(f, 1700, 1760)) * 255)
        if la > 0:
            draw.line([(W//2-500, H//2+150), (W//2+500, H//2+150)],
                      fill=(CYAN[0], CYAN[1], CYAN[2], la), width=2)

        # Particle burst
        if f > 1600:
            bp = progress(f, 1600, 1800)
            for i in range(20):
                angle = (i / 20) * math.pi * 2 + f * 0.01
                r_val = bp * 350
                px = W//2 + int(math.cos(angle) * r_val)
                py = H//2 + int(math.sin(angle) * r_val * 0.4)
                c = CYAN if i % 2 == 0 else PURPLE
                pa = int((1 - bp) * alpha * 255)
                if pa > 0:
                    draw.ellipse([px-2, py-2, px+2, py+2], fill=(c[0], c[1], c[2], pa))

    # Progress bar
    prog = int((f / TOTAL_FRAMES) * W)
    draw.rectangle([0, H-3, prog, H], fill=(CYAN[0], CYAN[1], CYAN[2], 180))

    return np.array(img).astype(np.uint8)


# ===== Render =====
print("Rendering frames...")
frames = []
for i in range(TOTAL_FRAMES):
    frame = make_frame(i)
    frames.append(frame)
    if (i + 1) % 300 == 0:
        print(f"  Progress: {i+1}/{TOTAL_FRAMES} frames ({(i+1)*100//TOTAL_FRAMES}%)")

print(f"Rendered {len(frames)} frames. Writing MP4...")

# Write MP4
writer = imageio.get_writer(MP4_PATH, fps=FPS, codec='libx264',
                            pixelformat='yuv420p')
for frame in frames:
    writer.append_data(frame)
writer.close()

size_mb = os.path.getsize(MP4_PATH) / 1024 / 1024
print(f"Done! MP4 saved: {MP4_PATH}")
print(f"File size: {size_mb:.1f} MB")