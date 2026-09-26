# Alper Kulturel

Personal portfolio of **Alper Kulturel** — Financial Analyst with 2+ years in financial data
analysis, performance reporting, and KPI-driven decision support. Based in Istanbul, open to
US relocation.

A static site built as an archive: five colour-coded folders, each opening into a dossier of real,
shipped work. Hand-written HTML, CSS, and JavaScript. **No frameworks, no build step, no npm, no
dependencies** beyond the Google Fonts stylesheet.

---

## Pages

| File | Folder | Contents |
| --- | --- | --- |
| `index.html` | — | Hero, bio, folder cabinet, stats bar |
| `quant.html` | 01 · `#1E40AF` | 7 files — derivatives pricing, risk simulation, backtesting |
| `finance.html` | 02 · `#0F766E` | 5 files — credit risk, variance analysis, reporting pipelines |
| `data.html` | 03 · `#B45309` | 3 files — churn modelling, segmentation, streaming ingestion |
| `systems.html` | 04 · `#B91C1C` | 3 files — C++17 pricing, matching engine, feed handler |
| `cv.html` | 05 · `#374151` | Curriculum vitae, with PDF / Google Docs download |
| `contact.html` | — | Contact form that composes a mailto to `kulturelalper@gmail.com` |

Each folder page carries a **back button** at the top of the page head, a compact back arrow in the
sticky header, and a "next folder" card at the bottom.

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
├── index.html              # homepage — hero, bio, cabinet, stats
├── quant.html              # folder 01 — Quantitative Finance
├── finance.html            # folder 02 — Financial Analytics
├── data.html               # folder 03 — Data Analytics
├── systems.html            # folder 04 — Systems & Infrastructure
├── cv.html                 # folder 05 — Curriculum Vitae
├── contact.html            # contact form
├── css/
│   └── style.css           # the entire design system
├── js/
│   └── main.js             # cursor, typewriter, reveals, counters, form
├── assets/
│   ├── Alper-Kulturel-CV.pdf    # one-page CV, generated
│   ├── Alper-Kulturel-CV.docx   # Word version, opens in Google Docs
│   ├── favicon.svg              # five-bar folder mark
│   └── og.png                   # 1200×630 social card
├── robots.txt
├── sitemap.xml
├── .nojekyll               # disable Jekyll on GitHub Pages
└── .gitignore
```

---

## Design system

Defined once as custom properties at the top of `css/style.css`.

**Surfaces** — near-black `#0D0D0D`; off-white paper `#F4EFE4` with an inline SVG
`feTurbulence` grain applied as an overlay.

**Folders** — Quantitative Finance `#1E40AF`, Financial Analytics `#0F766E`, Data Analytics
`#B45309`, Systems & Infrastructure `#B91C1C`, CV `#374151`. Category pages set
`--accent`, `--accent-deep`, and `--accent-lift` via a `.page--*` class on `<body>`, which themes
the drop cap, monogram badge, bullet dots, focus rings, folder cards, and footer background in one
place. Changing a folder's colour means editing one line.

**Typography** — Anton (display), Playfair Display (folder names, file titles), EB Garamond
(body), JetBrains Mono (metadata). Body and display sizes use `clamp()`, so the layout scales
continuously rather than only at breakpoints. Only the weights actually used are requested from
Google Fonts.

**Layout** — folder cards sit in a stack with `perspective: 3000px` and a `-22px` overlap; the
dossier cover folds open with a `rotateX` transition, and the paper beneath slides up behind it.

---

## Performance

The page is designed to stay quiet when nothing is happening:

- The custom cursor's `requestAnimationFrame` loop **stops** once the ring and dot have caught up
  with the pointer, and restarts on the next `pointermove`. It is not a permanent 60fps loop.
- The five rotating footer SVGs **pause** (`animation-play-state`) whenever the footer is off
  screen, via an `IntersectionObserver`.
- Scroll work is throttled to one `requestAnimationFrame` per frame.
- The fixed header uses a shallow blur without a `saturate()` pass, which was the most expensive
  thing on the page during scroll.
- Every `IntersectionObserver` unobserves its target once it has fired — reveals, counters and the
  footer pause each run exactly once.

---

## Adding a project

Each entry in a category page is one `.file` block:

```html
<div class="file">
  <a class="file__link" href="https://github.com/Alper-Kulturel/REPO" target="_blank" rel="noopener noreferrer">
    <span class="file__dot" aria-hidden="true"></span>
    <span class="file__body">
      <span class="file__title">Repo name</span>
      <span class="file__stack">Language &middot; Library &middot; Tool</span>
      <span class="file__desc">One line on what it does.</span>
    </span>
    <span class="file__arrow" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7"/><path d="M8 7h9v9"/></svg></span>
  </a>
</div>
```

Then update the count in three places: the `<dd class="meta__value">` for **Files**, the
`.files__head` item count, and the `aria-label` on that folder's card in `index.html`.

---

## The CV files

`assets/Alper-Kulturel-CV.pdf` and `assets/Alper-Kulturel-CV.docx` are generated, not hand-written.
The `cv.html` page offers both: the PDF downloads in one click, and the `.docx` is what Google Docs
opens natively when uploaded. Keep the two in sync with the page when the CV changes.

---

## Contact form

`contact.html` has no backend. On submit, `js/main.js` validates the four fields and composes a
`mailto:` URL — name, company, purpose and message pre-written in the body — then hands it to the
visitor's mail client. Nothing is sent to or stored by any third party. The recipient address lives
in the `data-recipient` attribute on the `<form>`.

---

## Accessibility

Semantic HTML5 landmarks; a skip link on every page; `aria-label` on all interactive controls;
`aria-live` on the form status; keyboard navigable throughout with visible `:focus-visible` rings;
WCAG AA contrast. All motion respects `prefers-reduced-motion` — the typewriter, the folder
stagger, the cover fold, the counters and the custom cursor all resolve to their final state
without animation. The CV page also carries a print stylesheet, so `Ctrl/Cmd + P` produces a clean
paper copy.

---

## Credits

All design, copy, and code in this repository is original. Fonts are served by Google Fonts under
the SIL Open Font License. No third-party images, logos, or code are included.
