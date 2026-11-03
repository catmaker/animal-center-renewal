"""Optional stdlib-only ZIP delivery checker. Not needed to run the web page."""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
import hashlib
import json
import re
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
errors = []

class Document(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids, self.refs, self.controls, self.images, self.h1 = [], [], [], [], 0
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if 'id' in a: self.ids.append(a['id'])
        if tag == 'h1': self.h1 += 1
        if tag == 'img':
            self.images.append(a)
            if not a.get('alt'): errors.append('Missing image alt')
            if not (a.get('width') and a.get('height')): errors.append('Missing image dimensions')
        for name in ('src', 'href'):
            if a.get(name): self.refs.append(a[name])
        for name in ('aria-controls', 'aria-labelledby'):
            if a.get(name): self.controls.extend(a[name].split())
        if tag == 'script' and a.get('src', '').startswith(('http:', 'https:', '//')):
            errors.append('External runtime script')
        if tag == 'link' and a.get('rel') == 'stylesheet' and a.get('href', '').startswith(('http:', 'https:', '//')):
            errors.append('External runtime stylesheet')

def check_ref(ref, base):
    parts = urlsplit(ref)
    if parts.scheme or ref.startswith('//'): return
    if parts.path and not (base / unquote(parts.path)).is_file(): errors.append('Missing path: ' + ref)
    if not parts.path and parts.fragment and parts.fragment not in doc.ids: errors.append('Missing anchor: ' + ref)

doc = Document()
doc.feed((ROOT / 'index.html').read_text())
if doc.h1 != 1: errors.append('Expected one H1')
errors.extend('Duplicate id: ' + k for k, v in Counter(doc.ids).items() if v > 1)
errors.extend('Missing ARIA target: ' + k for k in doc.controls if k not in doc.ids)
for ref in doc.refs: check_ref(ref, ROOT)
for css in (ROOT / 'css').glob('*.css'):
    for ref in re.findall(r'url\([\'"]?([^\)\'\"]+)', css.read_text()): check_ref(ref, css.parent)
text = (ROOT / 'js/data.js').read_text()
data = json.loads(text[text.index('Object.freeze(') + len('Object.freeze('):text.rindex(');')])
for animal in data['animals']:
    if not (ROOT / f"assets/images/animals/{animal['id']}.jpg").is_file(): errors.append('Missing animal image')
photos = list((ROOT / 'assets/images').rglob('*.jpg'))
digests = [hashlib.sha256(f.read_bytes()).hexdigest() for f in photos]
if len(digests) != len(set(digests)): errors.append('Repeated photo file')
for f in photos:
    if f.read_bytes()[:2] != b'\xff\xd8': errors.append('Invalid JPEG: ' + f.name)
for name in ['README.md', 'DESIGN_NOTES.md', 'ASSET_LICENSES.md', 'assets/fonts/OFL.txt']:
    if not (ROOT / name).is_file(): errors.append('Missing document: ' + name)
result = {'status': 'FAIL' if errors else 'PASS', 'htmlImages': len(doc.images), 'photoFiles': len(photos), 'animalProfiles': len(data['animals']), 'regions': len(data['facilities']), 'errors': errors}
print(json.dumps(result, ensure_ascii=False, indent=2))
raise SystemExit(bool(errors))
