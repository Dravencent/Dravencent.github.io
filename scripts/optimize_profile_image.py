"""Create and verify the public WebP derivative of the profile illustration."""

from __future__ import annotations

import argparse
import io
from pathlib import Path
import sys

from PIL import Image, ImageOps


DEFAULT_MAX_DIMENSION = 640
DEFAULT_MAX_BYTES = 250_000


def fit_dimensions(width: int, height: int, max_dimension: int) -> tuple[int, int]:
    if width <= 0 or height <= 0 or max_dimension <= 0:
        raise ValueError("dimensions must be positive")
    scale = min(1.0, max_dimension / max(width, height))
    return max(1, round(width * scale)), max(1, round(height * scale))


def encode_webp(
    image: Image.Image,
    *,
    max_dimension: int = DEFAULT_MAX_DIMENSION,
    max_bytes: int = DEFAULT_MAX_BYTES,
) -> bytes:
    image = ImageOps.exif_transpose(image)
    size = fit_dimensions(*image.size, max_dimension)
    if image.size != size:
        image = image.resize(size, Image.Resampling.LANCZOS)
    if image.mode not in {"RGB", "RGBA"}:
        image = image.convert("RGBA" if "A" in image.getbands() else "RGB")

    for quality in range(88, 43, -4):
        buffer = io.BytesIO()
        image.save(buffer, format="WEBP", quality=quality, method=6, exact=True)
        payload = buffer.getvalue()
        if len(payload) < max_bytes:
            return payload
    raise ValueError(f"unable to encode WebP below {max_bytes} bytes")


def verify_webp(path: Path, *, max_dimension: int, max_bytes: int) -> tuple[int, int, int]:
    size = path.stat().st_size
    if size >= max_bytes:
        raise ValueError(f"{path}: {size} bytes is not strictly below {max_bytes}")
    with Image.open(path) as image:
        image.load()
        if image.format != "WEBP":
            raise ValueError(f"{path}: expected WEBP, received {image.format}")
        if max(image.size) > max_dimension:
            raise ValueError(f"{path}: longest dimension {max(image.size)} exceeds {max_dimension}")
        return image.width, image.height, size


def confined(path: Path, root: Path) -> Path:
    resolved = path.resolve()
    try:
        resolved.relative_to(root.resolve())
    except ValueError as error:
        raise ValueError(f"path escapes repository root: {resolved}") from error
    return resolved


def optimize(source: Path, destination: Path, *, root: Path, max_dimension: int, max_bytes: int) -> tuple[int, int, int]:
    source = confined(source, root)
    destination = confined(destination, root)
    destination.parent.mkdir(parents=True, exist_ok=True)
    partial = destination.with_name(f"{destination.name}.partial")
    if partial.exists():
        partial.unlink()
    try:
        with Image.open(source) as image:
            image.load()
            payload = encode_webp(image, max_dimension=max_dimension, max_bytes=max_bytes)
        partial.write_bytes(payload)
        verify_webp(partial, max_dimension=max_dimension, max_bytes=max_bytes)
        partial.replace(destination)
        return verify_webp(destination, max_dimension=max_dimension, max_bytes=max_bytes)
    finally:
        if partial.exists():
            partial.unlink()


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", nargs="?", default="images/My.png")
    parser.add_argument("destination", nargs="?", default="images/yu-zhan-illustration.webp")
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--max-dimension", type=int, default=DEFAULT_MAX_DIMENSION)
    parser.add_argument("--max-bytes", type=int, default=DEFAULT_MAX_BYTES)
    args = parser.parse_args(argv)
    root = Path(__file__).resolve().parents[1]
    try:
        destination = confined(root / args.destination, root)
        if args.check:
            width, height, size = verify_webp(
                destination, max_dimension=args.max_dimension, max_bytes=args.max_bytes
            )
        else:
            source = confined(root / args.source, root)
            width, height, size = optimize(
                source,
                destination,
                root=root,
                max_dimension=args.max_dimension,
                max_bytes=args.max_bytes,
            )
        print(f"Verified profile WebP: {width}x{height}, {size} bytes.")
        return 0
    except (OSError, ValueError) as error:
        print(f"Profile image error: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
