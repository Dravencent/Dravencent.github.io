import contextlib
import io
from pathlib import Path
import shutil
import unittest

from PIL import Image

from scripts.optimize_profile_image import main


class ProfileImageCliTests(unittest.TestCase):
    def setUp(self):
        self.root = Path(__file__).resolve().parents[1]
        self.output = self.root / ".test-output" / "image-cli-tests"
        if self.output.exists():
            shutil.rmtree(self.output)
        self.output.mkdir(parents=True)
        self.source = self.output / "source.png"
        Image.new("RGB", (800, 1000), (240, 235, 225)).save(self.source)
        self.destination = self.output / "profile.webp"

    def tearDown(self):
        if self.output.exists():
            shutil.rmtree(self.output)

    def test_create_then_check(self):
        out = io.StringIO()
        with contextlib.redirect_stdout(out):
            result = main([
                str(self.source.relative_to(self.root)),
                str(self.destination.relative_to(self.root)),
            ])
        self.assertEqual(result, 0)
        self.assertTrue(self.destination.exists())
        self.assertIn("Verified profile WebP", out.getvalue())

        checked = io.StringIO()
        with contextlib.redirect_stdout(checked):
            result = main(["--check", str(self.source.relative_to(self.root)), str(self.destination.relative_to(self.root))])
        self.assertEqual(result, 0)
        self.assertIn("Verified profile WebP", checked.getvalue())


if __name__ == "__main__":
    unittest.main()
