from PIL import Image, ImageDraw, ImageFont

NAVY = (26, 46, 74)
NAVY_DARK = (16, 30, 50)
ORANGE = (192, 86, 46)
WHITE = (255, 255, 255)
LIGHT_BLUE = (120, 160, 210)

DEJAVU_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
DEJAVU = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

def gradient_bg(w, h, top, bottom):
    img = Image.new("RGB", (w, h), top)
    draw = ImageDraw.Draw(img)
    for y in range(h):
        t = y / h
        r = int(top[0] + (bottom[0] - top[0]) * t)
        g = int(top[1] + (bottom[1] - top[1]) * t)
        b = int(top[2] + (bottom[2] - top[2]) * t)
        draw.line([(0, y), (w, y)], fill=(r, g, b))
    return img

def centered_text(draw, cx, y, text, font, fill):
    bbox = draw.textbbox((0, 0), text, font=font)
    w = bbox[2] - bbox[0]
    draw.text((cx - w / 2, y), text, font=font, fill=fill)
    return bbox[3] - bbox[1]

def draw_rotor_swoosh(draw, cx, cy, r, color, width):
    # simple abstract rotor-blade arc motif, echoes the pilot-guide branding without
    # needing a real photo (none available / no stock imagery access in this session)
    draw.arc([cx - r, cy - r, cx + r, cy + r], start=200, end=340, fill=color, width=width)
    draw.arc([cx - r*0.7, cy - r*0.7, cx + r*0.7, cy + r*0.7], start=200, end=340, fill=color, width=width)

def build_cover():
    W, H = 1600, 900
    img = gradient_bg(W, H, NAVY, NAVY_DARK)
    draw = ImageDraw.Draw(img)

    draw_rotor_swoosh(draw, 230, 450, 260, LIGHT_BLUE, 14)
    draw_rotor_swoosh(draw, 1370, 450, 260, LIGHT_BLUE, 14)

    title_font = ImageFont.truetype(DEJAVU_BOLD, 84)
    sub_font = ImageFont.truetype(DEJAVU, 34)
    tag_font = ImageFont.truetype(DEJAVU_BOLD, 28)
    site_font = ImageFont.truetype(DEJAVU, 26)

    centered_text(draw, W/2, 230, "HELICOPTER PILOT", title_font, WHITE)
    centered_text(draw, W/2, 330, "CAREER LAUNCH KIT", title_font, ORANGE)

    draw.line([(W/2 - 260, 445), (W/2 + 260, 445)], fill=LIGHT_BLUE, width=3)

    centered_text(draw, W/2, 480, "18 pages of checklists, worksheets & a real career roadmap", sub_font, WHITE)
    centered_text(draw, W/2, 530, "from zero experience to your first paid helicopter job", sub_font, WHITE)

    # small feature pills
    pills = ["Interview Checklist", "Cost Worksheet", "Aerodynamics Glossary", "Job Prep Sheet"]
    pf = ImageFont.truetype(DEJAVU_BOLD, 22)
    total_w = 0
    paddings = []
    for p in pills:
        bbox = draw.textbbox((0,0), p, font=pf)
        w = bbox[2]-bbox[0] + 44
        paddings.append(w)
        total_w += w + 20
    x = W/2 - total_w/2
    y = 640
    for p, w in zip(pills, paddings):
        draw.rounded_rectangle([x, y, x+w-20, y+50], radius=25, outline=LIGHT_BLUE, width=2)
        bbox = draw.textbbox((0,0), p, font=pf)
        tw = bbox[2]-bbox[0]
        draw.text((x + (w-20-tw)/2, y+12), p, font=pf, fill=WHITE)
        x += w

    centered_text(draw, W/2, 800, "helipadusa.com  ·  America's #1 Helicopter Resource", site_font, LIGHT_BLUE)

    img.save("gumroad_cover.png")
    print("cover saved", img.size)

def build_thumbnail():
    S = 1000
    img = gradient_bg(S, S, NAVY, NAVY_DARK)
    draw = ImageDraw.Draw(img)
    draw_rotor_swoosh(draw, 500, 330, 300, LIGHT_BLUE, 16)

    title_font = ImageFont.truetype(DEJAVU_BOLD, 62)
    sub_font = ImageFont.truetype(DEJAVU_BOLD, 62)
    tag_font = ImageFont.truetype(DEJAVU, 30)

    centered_text(draw, S/2, 300, "HELICOPTER", title_font, WHITE)
    centered_text(draw, S/2, 375, "PILOT", title_font, WHITE)
    centered_text(draw, S/2, 470, "CAREER LAUNCH", sub_font, ORANGE)
    centered_text(draw, S/2, 545, "KIT", sub_font, ORANGE)

    draw.line([(S/2 - 180, 650), (S/2 + 180, 650)], fill=LIGHT_BLUE, width=3)
    centered_text(draw, S/2, 690, "helipadusa.com", tag_font, LIGHT_BLUE)

    img.save("gumroad_thumbnail.png")
    print("thumbnail saved", img.size)

if __name__ == "__main__":
    build_cover()
    build_thumbnail()
