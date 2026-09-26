"""Check generated news HTML against its embedded full-content snapshots."""
from pathlib import Path
from html.parser import HTMLParser
import json


class Page(HTMLParser):
    def __init__(self, html):
        super().__init__(convert_charrefs=True)
        self.skip = False
        self.snapshot = False
        self.raw = []
        self.text = []
        self.links = []
        self.canonicals = []
        self.headings = 0
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag in ("script", "style"):
            self.skip = True
            self.snapshot = attrs.get("id") == "news-snapshot"
        if tag == "a":
            self.links.append(attrs.get("href"))
        if tag == "h1":
            self.headings += 1
        if tag == "link" and attrs.get("rel") == "canonical":
            self.canonicals.append(attrs.get("href"))

    def handle_endtag(self, tag):
        if tag in ("script", "style"):
            self.skip = self.snapshot = False

    def handle_data(self, data):
        if self.snapshot:
            self.raw.append(data)
        if not self.skip:
            self.text.append(data)


def strings(block):
    if isinstance(block, str):
        yield block
    elif isinstance(block, dict):
        if block.get("heading"):
            yield block["heading"]
        for key in ("paragraphs", "bullets", "subsections"):
            for child in block.get(key, []):
                yield from strings(child)


root = Path(__file__).resolve().parents[1] / "dist"
index = Page((root / "news/index.html").read_text(encoding="utf-8"))
posts = json.loads("".join(index.raw))["posts"]
assert index.headings == 1
count = 0
for summary in posts:
    route = "/news/" + summary["slug"]
    assert route in index.links, route
    html = (root / route.lstrip("/") / "index.html").read_text(encoding="utf-8")
    page = Page(html)
    post = json.loads("".join(page.raw))["post"]
    assert post["slug"] == summary["slug"]
    assert page.canonicals == ["https://smxmuse.com" + route]
    assert page.headings == 1
    assert "display:none!important" not in html
    visible = " ".join("".join(page.text).split())
    for block in post["body"]:
        for text in strings(block):
            assert " ".join(text.split()) in visible, (route, text[:80])
    assert "/news" in page.links
    for entity in post.get("entities", {}).get("riders", []):
        if entity["name"] in visible:
            assert entity["path"] in page.links, (route, entity["name"])
    count += 1
print(f"PASS: {count} full articles, body text, headings, rider links, canonicals and index links")
