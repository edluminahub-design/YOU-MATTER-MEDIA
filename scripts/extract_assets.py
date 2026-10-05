"""
Rebuilds every image in public/ from the You Matter Media portfolio PDF.

The site ships no invented artwork: the work images are the bitmaps embedded in
the deck, and the client logos are crops of its "Our Clients" page. This script
is the record of how each one was produced, so the assets can be regenerated
if the deck is updated.

    pip install pymupdf pillow numpy
    python scripts/extract_assets.py "path/to/You Matter Media Portfolio.pdf"

Writes:
    public/work/<slug>-lg.webp   (max 1600px)
    public/work/<slug>-sm.webp   (max 800px)
    public/logos/<slug>.webp     (560x320, lossless)
    src/data/images.js           (intrinsic sizes, for width/height attributes)
"""

import os
import sys

import numpy as np
import pymupdf
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WORK_DIR = os.path.join(ROOT, "public", "work")
LOGO_DIR = os.path.join(ROOT, "public", "logos")

# The site's paper ground (--color-paper). Logo tiles in the UI are painted
# this exact colour, so a logo's own background disappears into the tile behind
# it. Change this and the logos must be regenerated, or every mark gains a
# visible rectangle.
PAPER = (255, 255, 255)

# The deck's own ground, which every logo crop arrives sitting on. It is not
# the site's ground, so it has to be shifted — see `reground`.
DECK = (233, 227, 219)

# Work imagery, keyed by the page (0-based) and xref of the embedded bitmap.
# Several deck pages composite a grid into one bitmap; those are split below.
WORK_XREFS = {
    "nest-mark": (5, 411),
    "nest-stationery": (6, 416),
    "nest-letterhead": (6, 419),
    "nest-brochure": (6, 422),
    "izhaar-1": (7, 646),
    "izhaar-2": (7, 649),
    "izhaar-3": (7, 634),
    "izhaar-4": (7, 640),
    "izhaar-5": (7, 643),
    "izhaar-6": (7, 637),
    # Bleeds past its artboard: trimmed of the solid bar along its bottom edge.
    "izzhaar-board": (8, 439),
    "monash-irt": (9, 442),
    "iisc-wellness": (9, 445),
    "rajiv-talreja": (10, 448),
    "master-graphology": (10, 451),
    "truemerit-ias": (11, 454),
    "truemerit-junior": (11, 457),
}

# Composites that are a clean grid of tiles on white, split into named pieces
# in reading order (columns first, then rows within each column).
WORK_GRIDS = {
    (7, 425): ["mulgund-1", "numerology-1", "mulgund-2", "numerology-2", "mulgund-3", "numerology-3"],
    (8, 436): ["edu-1", "edu-4", "edu-2", "edu-5", "edu-3", "edu-6", "edu-7"],
}

# Client logos: (slug, centre x, top of the dashed rule beneath the mark, crop
# height). Both coordinates are read from the PDF's own text layer, so the crop
# always stops above the rule. Bihar gets a shorter crop because the label of
# the row above sits unusually close.
LOGOS = [
    ("iisc", 149, 500.5, 122),
    ("govt-madhya-pradesh", 434, 500.5, 122),
    ("aiims-new-delhi", 746, 500.5, 122),
    ("monash-university", 1061, 500.5, 122),
    ("heinrich-boll-stiftung", 149, 684.5, 122),
    ("rajiv-talreja", 434, 684.7, 122),
    ("ds-group", 746, 684.6, 122),
    ("bahana-corbett", 1061, 685.1, 122),
    ("govt-of-bihar", 149, 871.7, 113),
    ("master-graphology", 435, 871.0, 122),
    ("de-royale", 746, 871.1, 122),
    ("vims-aviation", 1059, 876.4, 122),
    ("kundyoanda-hockey", 149, 1054.9, 122),
    ("sawan-kapoor", 434, 1054.7, 122),
    ("nest", 748, 1062.1, 122),
    ("izhaar", 1061, 1090.7, 122),
    ("tsdsi", 405, 1258.1, 122),
    ("truemerit-ias", 756, 1254.2, 122),
]

# Assets whose source bitmap bleeds past its artboard.
TRIM_EDGES = {"izzhaar-board"}

LOGO_PAGE = 12
LOGO_DPI = 300
LOGO_W, LOGO_H = 560, 320


def reground(img, frm=DECK, to=PAPER, plateau=8, span=42):
    """Shifts a crop's background colour from `frm` to `to`.

    The logo crops are lifted off a rendered PDF page, so they carry the deck's
    cream ground, not the site's paper. Keying on an exact colour would leave a
    hard fringe wherever the artwork is anti-aliased against that ground, so
    each pixel is moved by a weight that falls off with its distance from the
    old ground: pure background travels the whole way, logo ink does not move
    at all, and the blended edge pixels travel proportionally. The flat plateau
    matters — the PDF renders its ground with a level or two of noise, and
    without it those pixels stop just short of paper and the rectangle is still
    faintly visible.
    """
    arr = np.asarray(img.convert("RGB")).astype(np.float32)
    delta = np.array(to, dtype=np.float32) - np.array(frm, dtype=np.float32)
    distance = np.abs(arr - np.array(frm, dtype=np.float32)).max(axis=2)
    weight = np.clip((span - distance) / (span - plateau), 0.0, 1.0)[..., None]
    return Image.fromarray(np.clip(arr + weight * delta, 0, 255).astype(np.uint8))


def flatten(img):
    """Composites any transparency onto the site's paper ground."""
    img = img.convert("RGBA")
    return Image.alpha_composite(Image.new("RGBA", img.size, PAPER + (255,)), img).convert("RGB")


def bands(projection, min_len):
    """Runs of non-empty rows/columns at least `min_len` long."""
    out, start = [], None
    for i, on in enumerate(projection > 0):
        if on and start is None:
            start = i
        elif not on and start is not None:
            if i - start >= min_len:
                out.append((start, i))
            start = None
    if start is not None and len(projection) - start >= min_len:
        out.append((start, len(projection)))
    return out


def split_grid(img, min_side=200):
    """Splits a grid of tiles on white. Columns first: the tiles are staggered,
    so a row-first pass merges vertically offset neighbours into one block."""
    ink = np.asarray(img.convert("RGB")).min(axis=2) < 245
    boxes = []
    for x0, x1 in bands(ink.sum(axis=0), min_side):
        column = ink[:, x0:x1]
        for y0, y1 in bands(column.sum(axis=1), min_side):
            sub = ink[y0:y1, x0:x1]
            ys, xs = np.where(sub.any(axis=1))[0], np.where(sub.any(axis=0))[0]
            boxes.append((x0 + int(xs[0]), y0 + int(ys[0]), x0 + int(xs[-1]) + 1, y0 + int(ys[-1]) + 1))
    return boxes


def trim_flat_edges(img, tol=6):
    """Drops uniform rows/columns from the edges inward.

    One deck bitmap bleeds past its artboard and carries a solid black bar
    along the bottom; a flat edge band like that is always packaging, never
    content. Stops as soon as an edge line varies, and refuses to eat more
    than half the image.
    """
    arr = np.asarray(img.convert("RGB")).astype(int)
    h, w, _ = arr.shape
    top, bottom, left, right = 0, h, 0, w

    def flat(line):
        return line.std(axis=0).max() < tol

    while bottom - top > h // 2 and flat(arr[top, left:right]):
        top += 1
    while bottom - top > h // 2 and flat(arr[bottom - 1, left:right]):
        bottom -= 1
    while right - left > w // 2 and flat(arr[top:bottom, left]):
        left += 1
    while right - left > w // 2 and flat(arr[top:bottom, right - 1]):
        right -= 1

    return img.crop((left, top, right, bottom))


def emit_work(img, slug, manifest):
    large, small = img.copy(), img.copy()
    large.thumbnail((1600, 1600), Image.LANCZOS)
    small.thumbnail((800, 800), Image.LANCZOS)
    for tag, im in (("lg", large), ("sm", small)):
        im.save(os.path.join(WORK_DIR, f"{slug}-{tag}.webp"), "WEBP", quality=80, method=6)
    manifest[slug] = (large.width, large.height, small.width)


def build_logos(doc):
    page = doc[LOGO_PAGE].get_pixmap(dpi=LOGO_DPI)
    sheet = Image.frombytes("RGB", (page.width, page.height), page.samples)
    scale = LOGO_DPI / 72.0

    for slug, cx, rule_y, top in LOGOS:
        tile = sheet.crop(
            (
                int((cx - 105) * scale),
                int((rule_y - top) * scale),
                int((cx + 105) * scale),
                int((rule_y - 3) * scale),
            )
        )
        arr = np.asarray(tile).astype(int)
        mask = np.abs(arr - np.array(DECK)).max(axis=2) > 14
        ys, xs = np.where(mask.any(axis=1))[0], np.where(mask.any(axis=0))[0]
        if len(ys):
            pad = 10
            tile = tile.crop(
                (
                    max(0, xs[0] - pad),
                    max(0, ys[0] - pad),
                    min(tile.width, xs[-1] + pad),
                    min(tile.height, ys[-1] + pad),
                )
            )

        tile = reground(tile)
        tile.thumbnail((LOGO_W - 40, LOGO_H - 40), Image.LANCZOS)
        canvas = Image.new("RGB", (LOGO_W, LOGO_H), PAPER)
        canvas.paste(tile, ((LOGO_W - tile.width) // 2, (LOGO_H - tile.height) // 2))
        # Lossless: a lossy encode shifts the flat cream ground by a level or
        # two, which shows as a visible rectangle against the tile behind it.
        canvas.save(os.path.join(LOGO_DIR, f"{slug}.webp"), "WEBP", lossless=True, method=6)


def main(pdf_path):
    os.makedirs(WORK_DIR, exist_ok=True)
    os.makedirs(LOGO_DIR, exist_ok=True)

    doc = pymupdf.open(pdf_path)
    manifest = {}

    for slug, (page_no, xref) in WORK_XREFS.items():
        data = doc.extract_image(xref)
        img = flatten(Image.open(pymupdf.io.BytesIO(data["image"])))
        if slug in TRIM_EDGES:
            img = trim_flat_edges(img)
        emit_work(img, slug, manifest)

    for (page_no, xref), slugs in WORK_GRIDS.items():
        composite = Image.open(pymupdf.io.BytesIO(doc.extract_image(xref)["image"]))
        boxes = split_grid(composite)
        if len(boxes) != len(slugs):
            raise SystemExit(f"grid {xref}: expected {len(slugs)} tiles, found {len(boxes)}")
        for slug, box in zip(slugs, boxes):
            emit_work(flatten(composite.crop(box)), slug, manifest)

    build_logos(doc)

    lines = "\n".join(
        f"  '{slug}': {{ w: {w}, h: {h}, smw: {smw} }}," for slug, (w, h, smw) in sorted(manifest.items())
    )
    with open(os.path.join(ROOT, "src", "data", "images.js"), "w", encoding="utf-8") as fh:
        fh.write(
            "/**\n"
            " * Intrinsic dimensions of every work image, emitted by the asset build.\n"
            " * Used to set width/height on <img> so the masonry never shifts while\n"
            " * images stream in.\n"
            " *\n"
            " * Generated by scripts/extract_assets.py — do not edit by hand.\n"
            " */\n"
            "export default {\n" + lines + "\n}\n"
        )

    print(f"{len(manifest)} work images, {len(LOGOS)} logos")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    main(sys.argv[1])
