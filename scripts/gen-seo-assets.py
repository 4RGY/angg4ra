"""Generate all brand assets in one pass: og-image, apple-touch-icon,
favicon.svg, favicon.ico (multi-size). Palet: base #121417, alt #d9dce1,
blue #2b5bff. Font: Archivo Variable (Bold/Black, wdth ~118).
"""
from PIL import Image, ImageDraw, ImageFont
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
import os

FONT = r"C:\Users\Anggara\AppData\Local\Temp\archivo.ttf"
OUT = r"C:\Users\Anggara\Projects\4RGY-upgrades\angg4ra\public"

BASE = (18, 20, 23)        # #121417
ALT = (217, 220, 225)      # #d9dce1
BLUE = (43, 91, 255)       # #2b5bff
BLUE_BRIGHT = (79, 142, 247)  # #4F8EF7 - lebih cerah untuk favicon kecil
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


# ---------- 1. og-image.png (1200x630) ----------
W, H = 1200, 630
img = Image.new("RGB", (W, H), BASE)
d = ImageDraw.Draw(img)

# subtle dot grid
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

img.save(os.path.join(OUT, "og-image.png"), "PNG", optimize=True)


# ---------- 2. apple-touch-icon.png (180x180) ----------
S = 180
ico = Image.new("RGB", (S, S), BASE)
di = ImageDraw.Draw(ico)
# "a" putih bold, posisi mirip sekarang
di.text((24, 26), "a", font=font(110, "Black", 118), fill=ALT)
# dot biru di baseline
di.ellipse([104, 112, 128, 136], fill=BLUE)
ico.save(os.path.join(OUT, "apple-touch-icon.png"), "PNG", optimize=True)


# ---------- 3 & 4. favicon.svg + favicon.ico ----------
# Favicon pakai PATH VEKTOR asli dari font Archivo (ekstrak glyph 'a' via
# fontTools), BUKAN <text>. Alasan: <text> tergantung font terpasang di
# sistem viewer -> bisa beda render tiap browser/OS. <path> font-independent,
# tampil identik di mana-mana.

# 3a. Ekstrak path glyph 'a' Archivo Bold (wght=700, wdth=120).
# Koordinat font-space (upm=1000, y=UP) ditransform ke viewBox 32x32.
def extract_a_path():
    """Return (svg_path_d, transform_fn) untuk glyph 'a'."""
    tf = TTFont(FONT)
    # Instance ke Bold + width 120 biar stroke lebih tebal, keliatan di 16px.
    inst = instantiateVariableFont(tf, {"wght": 700, "wdth": 120})
    gs = inst.getGlyphSet()
    cmap = inst.getBestCmap()
    glyph = gs[cmap[ord("a")]]

    # Bounds glyph (font-space)
    from fontTools.pens.boundsPen import BoundsPen
    bp = BoundsPen(gs)
    glyph.draw(bp)
    xmin, ymin, xmax, ymax = bp.bounds

    # Transform font-space -> viewBox 32x32.
    # Target: glyph 'a' nyaris mengisi kanvas, dot di kanan-bawah.
    # Skala = 22/32 unit tinggi-kira (em 1000 -> ~ 22 units di 32-viewbox).
    # Lebih presisi: fit berdasarkan tinggi x-height glyph (ymin..ymax).
    h_glyph = ymax - ymin  # ~ 551 units (termasuk overshoot 'a')
    # Ingin tinggi glyph di 32-viewbox ≈ 22 px, sisakan space untuk dot.
    target_h = 22.0
    s = target_h / h_glyph

    # Baseline 'a' target di y=24 (sisakan 8px bawah untuk descender overshoot).
    # y_svg = baseline_target - (y_font - ymin)*s  (flip sumbu Y)
    # x_svg = offset_x + (x_font - xmin)*s
    baseline_target = 24.0
    offset_x = 2.0  # margin kiri kecil

    # Transform matrix: (x*s + tx, -y*s + ty) -> flip Y + scale + translate.
    tx = offset_x - xmin * s
    ty = baseline_target + ymin * s  # karena y_svg = -y*s + ty -> saat y=ymin, y_svg=baseline
    # Verify: saat y_font=ymax, y_svg = baseline - h_glyph*s = baseline - target_h = 2.0
    # Bagus: x-height glyph dari y=2 sampai y=24.

    # SVG path pakai TransformPen + SVGPathPen.
    # Koordinat yang dihasilkan SVGPathPen sudah dalam target space.
    from fontTools.pens.recordingPen import RecordingPen
    from fontTools.pens.transformPen import TransformPen as TP
    import math
    # Matrix fontTools: (xx, xy, yx, yy, dx, dy)
    # (x, y) -> (xx*x + yx*y + dx, xy*x + yy*y + dy)
    # Kita mau: x' = x*s + tx, y' = -y*s + ty
    # => xx=s, xy=0, yx=0, yy=-s, dx=tx, dy=ty
    matrix = (s, 0, 0, -s, tx, ty)
    spen = SVGPathPen(gs)
    glyph.draw(TP(spen, matrix))
    return spen.getCommands()


A_PATH = extract_a_path()

# 3b. favicon.svg (viewBox 32x32, scalable).
# 'a' path putih, dot biru cerah. Background transparan (bukan rect gelap)
# supaya favicon menyatu dengan tab browser gelap/terang.
# Desain dot: lingkaran r≈3.5 di (24.5, 24) — sejajar baseline 'a'.
svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <title>angg4ra favicon</title>
  <path d="{A_PATH}" fill="#FFFFFF"/>
  <circle cx="24.5" cy="24" r="3.5" fill="#4F8EF7"/>
</svg>'''

with open(os.path.join(OUT, "favicon.svg"), "w", encoding="utf-8") as f:
    f.write(svg)

print(f"  favicon.svg path length: {len(A_PATH)} chars")

# 3c. favicon.ico (multi-size 16, 32, 48).
# Render pakai path vektor yang sama via matplotlib Path atau manual scan-line.
# Pendekatan sederhana: render glyph 'a' Archivo pakai PIL + font instancer,
# lalu render dot. Ini cukup akurat untuk icon kecil.
def render_favicon_png(size):
    """Render 'a' + dot biru ke PNG RGBA di ukuran size x size, transparan."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # Load Archivo variable dan instantiate ke Bold+wdth120 biar sama dengan SVG.
    # PIL ImageFont.truetype langsung support variation via set_variation_by_axes.
    a_size = max(10, int(22 * size / 32))
    f_a = ImageFont.truetype(FONT, a_size)
    try:
        f_a.set_variation_by_axes([700, 120])
    except Exception:
        pass

    # Posisi 'a': baseline di y ≈ 24/32 * size, x margin 2/32 * size.
    x_a = int(2 * size / 32)
    y_a = int(24 * size / 32)
    d.text((x_a, y_a), "a", font=f_a, fill=(255, 255, 255, 255), anchor="lb")

    # Dot: cx=24.5, cy=24, r=3.5 di 32-viewbox.
    cx = 24.5 * size / 32
    cy = 24.0 * size / 32
    r = max(1.5, 3.5 * size / 32)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=BLUE_BRIGHT + (255,))
    return img


sizes = [16, 32, 48]
fav_imgs = {s: render_favicon_png(s) for s in sizes}
# Pillow 12: base image harus >= ukuran terbesar di `sizes` (filter, bukan
# daftar render). Tiap ukuran yang disediakan lewat append_images dipakai
# apa adanya kalau size-nya match; kalau tidak, base di-downscale.
fav_imgs[48].save(
    os.path.join(OUT, "favicon.ico"),
    format="ICO",
    sizes=[(s, s) for s in sizes],
    append_images=[fav_imgs[16], fav_imgs[32]],
)

print("written:")
print("  og-image.png        1200x630")
print("  apple-touch-icon.png 180x180")
print("  favicon.svg         32x32 viewBox (vector path, font-independent)")
print("  favicon.ico         16x16, 32x32, 48x48 (transparent)")