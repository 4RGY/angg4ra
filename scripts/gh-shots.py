"""Tarik social preview repo GitHub -> public/shots/<nama>.webp (1200x600).

Kartu OG GitHub itu putih terang. Di situs gelap, gambar putih berjejer jadi
blok nyala. Warna dibalik di CSS (.gimg), bukan di sini: nol byte tambahan,
dan gampang dibalik lagi kalau ternyata tidak cocok.

Jalankan manual: npm run gh:shots
"""
from io import BytesIO
from pathlib import Path
from urllib.request import Request, urlopen

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "shots"
os_ua = "Mozilla/5.0 (compatible; angg4ra-portfolio build)"

REPOS = [
    "pantau-dbd",
    "ihsg-idx-analytics",
    "cuaca-indonesia",
    "kataloji-crm",
    "analisis-gempa-indonesia",
    "olist-commerce-analysis",
]


def grab(name):
    url = f"https://opengraph.githubassets.com/1/4RGY/{name}"
    req = Request(url, headers={"User-Agent": os_ua, "Accept": "image/png,image/*"})
    with urlopen(req, timeout=30) as r:
        return Image.open(BytesIO(r.read())).convert("RGB")


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    total = 0
    for name in REPOS:
        img = grab(name)
        # 1200x600 native, tapi jaga-jaga kalau GitHub ganti rasio.
        if img.size != (1200, 600):
            img = img.resize((1200, 600), Image.LANCZOS)
        dest = OUT / f"{name}.webp"
        img.save(dest, "WEBP", quality=80, method=6)
        size = dest.stat().st_size
        total += size
        print(f"{name:32} {img.size[0]}x{img.size[1]}  {size / 1024:5.1f} KB")
    print(f"{'total':32} {'':11}  {total / 1024:5.1f} KB")


if __name__ == "__main__":
    main()
