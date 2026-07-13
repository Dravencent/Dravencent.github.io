import io
import unittest

from PIL import Image

from scripts.optimize_profile_image import encode_webp, fit_dimensions


class ProfileImageOptimizerTests(unittest.TestCase):
    def test_fit_dimensions_preserves_aspect_ratio(self):
        self.assertEqual(fit_dimensions(1024, 1536, 640), (427, 640))
        self.assertEqual(fit_dimensions(320, 480, 640), (320, 480))

    def test_encoder_produces_valid_budgeted_webp(self):
        image = Image.new("RGBA", (900, 1200), (245, 240, 230, 255))
        payload = encode_webp(image, max_dimension=640, max_bytes=250000)
        self.assertLess(len(payload), 250000)
        decoded = Image.open(io.BytesIO(payload))
        self.assertLessEqual(max(decoded.size), 640)
        self.assertEqual(decoded.format, "WEBP")


if __name__ == "__main__":
    unittest.main()
