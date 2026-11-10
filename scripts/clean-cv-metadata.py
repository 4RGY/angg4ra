"""Bersihkan metadata PDF CV dari sisa Canva + idempoten.

Masalah: ekspor Canva membawa metadata internal yang tidak perlu:
  /Title    (CV_Argy Anggara)              <- underscore, beda branding
  /Author   (Argy Rgyanggara)              <- typo, ada "R" nyempil
  /Keywords (DAGsZF2ixlI,BAD-04a1diw,0)    <- artifact ID internal Canva
  /Creator, /Producer = "Canva"

Script menulis ulang Info dictionary (docinfo) + menghapus XMP Canva.
Isi halaman CV tidak disentuh.

Idempoten: jalankan berkali-kali menghasilkan byte identik. pikepdf
generate /ID acak tiap save; deterministic_id=True menurunkannya dari
konten. Tulis via file temp + os.replace supaya tidak ada PDF setengah
jadi kalau proses mati di tengah.

Cara pakai:
  1. Timpa public/cv-anggara.pdf dengan ekspor Canva terbaru
  2. python scripts/clean-cv-metadata.py   (bersihkan in-place)

Dependensi: python -m pip install pikepdf
"""
import os, sys
from pathlib import Path

try:
    from pikepdf import Pdf, String, Name
except ImportError:
    sys.exit("pikepdf belum terpasang. Jalankan: python -m pip install pikepdf")

PDF = Path(__file__).resolve().parent.parent / "public" / "cv-anggara.pdf"

NEW = {
    "/Title": "Argy Anggara - Data Analyst & Web Developer",
    "/Author": "Argy Anggara",
    "/Subject": "Portfolio CV: data analysis, machine learning, web development",
    "/Keywords": "data analyst, machine learning, web developer, portfolio, argy anggara",
    "/Creator": "angg4ra",
    "/Producer": "angg4ra",
}
# Field tanggal Canva dibuang, bukan ditimpa: tanggal ekspor bukan informasi
# yang berguna dan bocorin kapan CV dibuat.
DROP = {"/CreationDate", "/ModDate"}


def clean(pdf: Pdf) -> None:
    # 1) Kosongkan XMP dulu. XMP dibaca duluan banyak tools, dan kalau
    #    docinfo di-set sebelum XMP dihapus, docinfo ikut ke-reset.
    try:
        with pdf.open_metadata(set_pikepdf_as_editor=False) as meta:
            for k in list(meta.keys()):
                del meta[k]
    except Exception:
        pass  # PDF tanpa XMP: aman, lanjut.
    # 2) Buang field tanggal dari docinfo.
    for k in DROP:
        if k in pdf.docinfo:
            del pdf.docinfo[k]
    # 3) Tulis docinfo yang benar.
    for k, v in NEW.items():
        pdf.docinfo[Name(k)] = String(v)


def main() -> None:
    if not PDF.exists():
        sys.exit(f"Tidak ada {PDF}")

    tmp = PDF.with_suffix(".pdf.tmp")
    with Pdf.open(str(PDF)) as pdf:
        clean(pdf)
        pdf.save(str(tmp), deterministic_id=True)
    # Handle sumber harus sudah tertutup sebelum replace. Di Windows, os.replace
    # ke file yang masih dibuka pembaca gagal dengan WinError 5.
    os.replace(tmp, PDF)

    out = Pdf.open(str(PDF))
    print(f"OK. pages={len(out.pages)} size={PDF.stat().st_size} bytes")
    for k, v in sorted(out.docinfo.items()):
        print(f"  {k}: {v}")


if __name__ == "__main__":
    main()
