"""Strip Canva internal IDs dari metadata PDF CV, rewrite /Title + /Author.

PDF ini dibuat via Canva. Metadata asli:
  /Title    (CV_Argy Anggara)
  /Author   (Argy Rgyanggara)
  /Keywords (DAGsZF2ixlI,BAD-04a1diw,0)  <- internal Canva artifact IDs
  /Creator  (Canva)
  /Producer (Canva)

Kita ganti jadi rapi tanpa merusak isi halaman. PDF pakai cross-reference
offset, jadi setiap edit teks harus diikuti re-kalkulasi xref. Cara paling
aman dan standar: pakai pikepdf (QPDF binding).

Cara pakai:
  1. Letakkan file mentah Canva sebagai public/cv-anggara.pdf
  2. Jalankan: python scripts/clean-cv-metadata.py
  3. Script bikin backup .orig lalu timpa public/cv-anggara.pdf

Dependensi: pip install pikepdf
"""
import sys, shutil
from pathlib import Path

try:
    from pikepdf import Pdf, String, Name
except ImportError:
    sys.exit("pikepdf belum terpasang. Jalankan: pip install pikepdf")

PDF = Path(__file__).resolve().parent.parent / "public" / "cv-anggara.pdf"
BACKUP = PDF.with_suffix(".pdf.orig")

NEW = {
    "/Title": "Argy Anggara - Data Analyst & Web Developer",
    "/Author": "Argy Anggara",
    "/Subject": "Portfolio CV: data analysis, machine learning, web development",
    "/Keywords": "data analyst, machine learning, web developer, portfolio, argy anggara",
    "/Creator": "angg4ra",
    "/Producer": "angg4ra",
}

def main():
    if not PDF.exists():
        sys.exit(f"Tidak ada {PDF}")
    if not BACKUP.exists():
        shutil.copy2(PDF, BACKUP)
        print(f"Backup: {BACKUP}")

    pdf = Pdf.open(str(BACKUP))
    # 1) Bersihkan XMP metadata dulu (kalau ada). XMP dibaca duluan oleh
    #    banyak tools, dan kalau docinfo di-set duluan lalu XMP dihapus,
    #    docinfo ikut ke-reset. Urutan ini penting.
    try:
        with pdf.open_metadata(set_pikepdf_as_editor=False) as meta:
            for k in list(meta.keys()):
                del meta[k]
    except Exception:
        pass  # PDF tanpa XMP: aman, lanjut.
    # 2) Baru tulis docinfo (Info dictionary) supaya jadi source of truth.
    for k, v in NEW.items():
        pdf.docinfo[Name(k)] = String(v)
    pdf.save(str(PDF))
    print("Metadata baru (docinfo):")
    for k in NEW:
        print(f"  {k}: {NEW[k]}")
    print(f"OK. Ukuran: {PDF.stat().st_size} bytes")

if __name__ == "__main__":
    main()
