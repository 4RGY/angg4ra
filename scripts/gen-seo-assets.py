"""Generate og-image.png (1200x630) + apple-touch-icon.png (180x180).
Palet mengikuti situs: base #121417, alt #d9dce1, blue #2b5bff.
"""
from PIL import Image, ImageDraw, ImageFont

FONT = r"C:\Users\Anggara\AppData\Local\Temp\archivo.ttf"
OUT = r"C:\Users\Anggara\Projects\4RGY-upgrades\angg4ra\public"

BASE = (18, 20, 23)
ALT = (217, 220, 225)
BLUE = (43, 91, 255)
MUTE = (110, 116, 126)


def font(size, weight="Bold", wdth=100):
    f = ImageFont.truetype(FONT, size)
    try:
        f.set_variation_by_axes([wdth, weight_axis(weight)])
    except Exception:
        pass
    return f


def weight_axis(name):
    return {"Regular": 400, "Medium": 500, "SemiBold": 600, "Bold": 700, "Black": 900}[name]


W, H = 1200, 630
img = Image.new("RGB", (W, H), BASE)
d = ImageDraw.Draw(img)

# subtle dot grid, sama seperti hero
for y in range(40, H, 40):
    for x in range(40, W, 40):
        d.point((x, y), fill=(30, 33, 38))

# corner brackets
L = 46
for (cx, cy, sx, sy) in [(56, 56, 1, 1), (W - 56, 56, -1, 1),
                         (56, H - 56, 1, -1), (W - 56, H - 56, -1, -1)]:
    d.line([(cx, cy), (cx + sx * L, cy)], fill=BLUE, width=3)
    d.line([(cx, cy), (cx, cy + sy * L)], fill=BLUE, width=3)

# wordmark
d.text((92, 150), "angg4ra.", font=font(150, "Black", 118), fill=ALT)

# blue rule
d.line([(96, 350), (96 + 260, 350)], fill=BLUE, width=6)

# name + role
d.text((96, 382), "Argy Anggara", font=font(52, "SemiBold"), fill=ALT)
d.text((96, 452), "Data Analyst  /  Web Developer", font=font(34, "Regular"), fill=MUTE)

# status line
d.ellipse([98, 534, 112, 548], fill=BLUE)
d.text((128, 527), "Terbuka untuk magang, freelance, dan work",
       font=font(28, "Regular"), fill=MUTE)

img.save(OUT + r"\og-image.png", "PNG", optimize=True)

# apple touch icon: kotak base + tanda "a." putih besar, sudut membulat manual
S = 180
ico = Image.new("RGB", (S, S), BASE)
di = ImageDraw.Draw(ico)
di.text((24, 26), "a", font=font(110, "Black", 118), fill=ALT)
di.ellipse([104, 112, 128, 136], fill=BLUE)
ico.save(OUT + r"\apple-touch-icon.png", "PNG", optimize=True)

print("written: og-image.png 1200x630, apple-touch-icon.png 180x180")
