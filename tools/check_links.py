#!/usr/bin/env python3
"""Check every internal link on the site.

Walks the HTML pages at the repo root, collects each href/src target, and
reports any that does not resolve to a file in the tree -- plus any #fragment
that does not match an id on the page it points at.

External links (http, https, mailto, tel, data, javascript) are not fetched,
so this runs offline and is safe in CI.

Usage:
    python3 tools/check_links.py             # exit 1 if anything is broken
    python3 tools/check_links.py --verbose
"""

from __future__ import annotations

import argparse
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parent.parent

# Schemes we deliberately do not resolve: they leave the repo, and fetching
# them would make the check depend on the network.
EXTERNAL_SCHEMES = ("http", "https", "mailto", "tel", "data", "javascript", "sms")


class PageParser(HTMLParser):
    """Collects every href/src on a page, and every id it defines."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.targets: list[tuple[str, int]] = []
        self.ids: set[str] = set()

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        seen = dict(attrs)
        if seen.get("id"):
            self.ids.add(seen["id"] or "")
        for attr in ("href", "src"):
            value = seen.get(attr)
            if value:
                self.targets.append((value, self.getpos()[0]))

    # <img ... /> and friends arrive here rather than at handle_starttag.
    def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self.handle_starttag(tag, attrs)


def parse(path: Path) -> PageParser:
    parser = PageParser()
    parser.feed(path.read_text(encoding="utf-8"))
    return parser


def check() -> list[str]:
    pages = sorted(ROOT.glob("*.html"))
    if not pages:
        return [f"no HTML pages found under {ROOT}"]

    ids_by_page = {page.resolve(): parse(page).ids for page in pages}
    problems: list[str] = []
    checked = 0

    for page in pages:
        parser = parse(page)
        for target, line in parser.targets:
            parsed = urlparse(target)

            if parsed.scheme in EXTERNAL_SCHEMES:
                continue

            # Pure fragment: points at this same page.
            if not parsed.path:
                fragment = unquote(parsed.fragment)
                if fragment and fragment not in parser.ids:
                    problems.append(f"{page.name}:{line}: #{fragment} has no matching id")
                checked += 1
                continue

            dest = (page.parent / unquote(parsed.path)).resolve()
            checked += 1

            if not dest.exists():
                problems.append(f"{page.name}:{line}: {target} -> no such file")
                continue

            # A fragment into another page has to land on a real anchor there.
            if parsed.fragment and dest in ids_by_page:
                fragment = unquote(parsed.fragment)
                if fragment not in ids_by_page[dest]:
                    problems.append(
                        f"{page.name}:{line}: {target} -> no #{fragment} in {dest.name}"
                    )

    print(f"checked {checked} internal link(s) across {len(pages)} page(s)")
    return problems


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--verbose", action="store_true", help="list every page scanned")
    args = ap.parse_args()

    if args.verbose:
        for page in sorted(ROOT.glob("*.html")):
            print(f"  scanning {page.name}")

    problems = check()
    if problems:
        print(f"\n{len(problems)} broken link(s):", file=sys.stderr)
        for problem in problems:
            print(f"  {problem}", file=sys.stderr)
        return 1

    print("all internal links resolve")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
