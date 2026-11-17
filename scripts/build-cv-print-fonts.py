"""
Builds the static (fixed-weight) fonts the CV PDF prints with:

    pip install fonttools brotli
    python3 scripts/build-cv-print-fonts.py

Why: Chrome embeds *variable* fonts in a PDF as Type 3 fonts. Text still
extracts, but some older applicant tracking systems parse Type 3 badly.
Static instances embed as ordinary TrueType, and the PDF shrinks to under
half its size (November 2026: 200 KB -> 84 KB).

Reads the site's vendored variable fonts in src/app/fonts and writes one file
per weight the CV uses to src/app/cv/print/fonts. Names are set by hand
(Manrope-Bold, NewsreaderText-Regular, ...) because the instancer's automatic
renaming fails on these Google subsets, and a font named "Manrope-ExtraLight"
at every weight misleads parsers that read weight from the name.

Newsreader has an optical-size axis: the 32pt name uses opsz 42 (Display),
everything else opsz 16 (Text), matching what Chrome picks on screen.

Run it again only if the vendored variable fonts change.
"""

from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src/app/fonts"
OUT = ROOT / "src/app/cv/print/fonts"

STYLE = {400: "Regular", 500: "Medium", 600: "SemiBold", 700: "Bold"}

# (variable source, output file, family name, weight, extra axes)
INSTANCES = [
    ("manrope-latin-var", "manrope-400", "Manrope", 400, {}),
    ("manrope-latin-var", "manrope-500", "Manrope", 500, {}),
    ("manrope-latin-var", "manrope-600", "Manrope", 600, {}),
    ("manrope-latin-var", "manrope-700", "Manrope", 700, {}),
    ("newsreader-latin-var", "newsreader-display-500", "Newsreader Display", 500, {"opsz": 42}),
    ("newsreader-latin-var", "newsreader-text-400", "Newsreader Text", 400, {"opsz": 16}),
    ("newsreader-latin-var", "newsreader-text-600", "Newsreader Text", 600, {"opsz": 16}),
]


def build(src: str, out: str, family: str, weight: int, axes: dict) -> None:
    font = instancer.instantiateVariableFont(
        TTFont(SRC / f"{src}.woff2"), {"wght": weight, **axes}
    )

    style = STYLE[weight]
    names = font["name"]
    for name_id in (16, 17, 25):
        names.removeNames(nameID=name_id)
    records = {
        1: family if weight in (400, 700) else f"{family} {style}",
        2: "Bold" if weight == 700 else "Regular",
        4: f"{family} {style}",
        6: f"{family.replace(' ', '')}-{style}",
        16: family,
        17: style,
    }
    for name_id, value in records.items():
        names.setName(value, name_id, 3, 1, 0x409)
        names.setName(value, name_id, 1, 0, 0)
    font["OS/2"].usWeightClass = weight

    font.flavor = "woff2"
    font.save(OUT / f"{out}.woff2")
    print(f"wrote {out}.woff2 ({records[6]})")


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    for args in INSTANCES:
        build(*args)
