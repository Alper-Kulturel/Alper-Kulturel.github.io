# The Kulturel Files

Personal portfolio of **Alper Kulturel** — developer and analyst based in Istanbul, open to relocation.

A static site built as an archive: five colour-coded folders, each opening into a dossier of real,
shipped work. Hand-written HTML, CSS, and JavaScript. **No frameworks, no build step, no npm, no
dependencies** beyond the Google Fonts stylesheet.

---

## Pages

| File | Folder | Contents |
| --- | --- | --- |
| `index.html` | — | Hero, folder cabinet, stats bar |
| `quant.html` | 01 · `#1E40AF` | 8 files — pricing, matching engines, backtesting |
| `data.html` | 02 · `#15803D` | 7 files — credit risk, churn, sentiment, SQL, dashboards |
| `systems.html` | 03 · `#B91C1C` | 4 files — C++ core, market data, live infrastructure |
| `game-dev.html` | 04 · `#C2620E` | 4 files — work experience, certifications, community |
| `about.html` | 05 · `#374151` | Practice, education, tools, contact |

---

## Local preview

Any static file server works. From the project root:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

Opening `index.html` directly via `file://` also works, but a server is recommended so that
relative paths, `robots.txt`, and `sitemap.xml` behave exactly as they will in production.

---

## Deploy

The site is published with **GitHub Pages** from the repository root of
`Alper-Kulturel.github.io`.

```bash
git add .
git commit -m "Update portfolio"
git push origin main
```

GitHub Pages rebuilds automatically within a minute or so. To preview the build locally under the
same path structure, `python3 -m http.server 8000` is sufficient — there is no compilation step.

### Notes

- **`.nojekyll`** is present and must stay. It stops GitHub Pages from running Jekyll, which would
  otherwise ignore files and directories beginning with an underscore.
- **Custom domain** — add a `CNAME` file at the repository root containing the bare domain, then
  point a `CNAME` DNS record at `alper-kulturel.github.io`.
- **Cache busting** — `css/style.css` and `js/main.js` are referenced without a version query. If
  you make a visual change and visitors report a stale page, append `?v=2` to the two references in
  each HTML file.

---

## Structure

```
.
├── index.html              # homepage — hero, cabinet, stats
├── quant.html              # folder 01
├── data.html               # folder 02
├── systems.html            # folder 03
├── game-dev.html           # folder 04
├── about.html              # folder 05
├── css/
│   └── style.css           # the entire design system
├── js/
│   └── main.js             # cursor, typewriter, reveal observers
├── assets/
│   ├── favicon.svg         # five-bar folder mark
│   └── og.png              # 1200×630 social card
├── robots.txt
├── sitemap.xml
├── .nojekyll               # disable Jekyll on GitHub Pages
└── .gitignore
```

---

## Design system

Defined once as custom properties at the top of `css/style.css`.

**Surfaces** — near-black `#0D0D0D`; off-white paper `#F4EFE4` with an inline SVG
`feTurbulence` grain applied as a multiply overlay.

**Folders** — QUANT `#1E40AF`, DATA `#15803D`, SYSTEMS `#B91C1C`, GAME DEV `#C2620E`,
ABOUT `#374151`. Each category page sets `--accent`, `--accent-deep`, and `--accent-lift` on
`<body>`, which themes the drop cap, monogram badge, bullet dots, focus rings, and footer
background in one place. Changing a folder's colour means editing one line.

**Typography** — Anton (display), Playfair Display (folder names, file titles), EB Garamond
(body), JetBrains Mono (metadata). Body and display sizes use `clamp()`, so the layout scales
continuously rather than only at breakpoints.

**Layout** — folder cards sit in a stack with `perspective: 3000px` and a `-22px` overlap; the
dossier cover folds open with a `rotateX` transition clipped by its stage.

---

## Adding a project

Each entry in a category page is one `<li class="file">` block:

```html
<li class="file">
  <a class="file__link" href="https://github.com/Alper-Kulturel/REPO" target="_blank" rel="noopener noreferrer">
    <span class="file__dot" aria-hidden="true"></span>
    <span class="file__body">
      <span class="file__title">Repo name</span>
      <span class="file__stack">Language &middot; Library &middot; Tool</span>
      <span class="file__desc">One line on what it does.</span>
    </span>
    <span class="file__arrow" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h15"/><path d="M13 6l6 6-6 6"/></svg></span>
  </a>
</li>
```

Then update the count in three places: the `<dd class="meta__value">` for **Files**, the
`.files__head` item count, and the `aria-label` on that folder's card in `index.html`.

---

## Accessibility

Semantic HTML5 landmarks; a skip link on every page; `aria-label` on all interactive controls;
keyboard navigable throughout with visible `:focus-visible` rings; WCAG AA contrast. All motion
respects `prefers-reduced-motion` — the typewriter, the folder stagger, the cover fold, and the
custom cursor all resolve to their final state without animation.

---

## Credits

All design, copy, and code in this repository is original. Fonts are served by Google Fonts under
the SIL Open Font License. No third-party images, logos, or code are included.
