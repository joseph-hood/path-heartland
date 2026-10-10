"""Build an Artifact-ready copy of the site for a live preview in Claude.

    python3 tools/build-preview.py <output-dir>

Copies site/ to <output-dir>, and rewrites index.html without its own
doctype/html/head/body wrapper (the Artifact page skeleton supplies those),
keeping the title, stylesheets, and scripts. Prints the supporting files to
publish alongside index.html.
"""
import pathlib
import re
import shutil
import sys

site = pathlib.Path(__file__).resolve().parent.parent / "site"
out = pathlib.Path(sys.argv[1]).resolve()

shutil.rmtree(out, ignore_errors=True)
shutil.copytree(site, out)

html = (site / "index.html").read_text()
head = re.search(r"<head>(.*?)</head>", html, re.S).group(1)
body = re.search(r"<body>(.*?)</body>", html, re.S).group(1)
keep = [
    line.strip()
    for line in head.splitlines()
    if re.search(r'<title|<script|<link[^>]*rel="(stylesheet|preconnect)"', line)
]
(out / "index.html").write_text("\n".join(keep) + "\n" + body.strip() + "\n")

for path in sorted(out.rglob("*")):
    if path.is_file() and path.name != "index.html":
        print(path.relative_to(out))
