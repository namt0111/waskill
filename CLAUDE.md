# Waskill

Waskill (https://waskill.dev) is a free, no-signup static site on GitHub Pages. A visitor pastes the prompt they are about to send Claude and gets the top 5 matching Claude Agent Skills (SKILL.md), picked from 2,363 skills across 11 top-starred GitHub skill repos. All ranking runs in the browser.

## Rules (always follow)

- **Never delete or change `CNAME`.** It holds the `waskill.dev` custom domain.
- **Keep GoatCounter.** Every page loads `<script data-goatcounter="https://waskill.goatcounter.com/count" async src="//gc.zgo.at/count.js">`. Keep its three events: `search` (index.html `run()`, only on user-triggered searches), `newsletter-signup` (the `form[data-nl]` submit handler), `sponsor-click` (sponsor.js, only for a real active sponsor).
- **Keep the Buttondown signup forms**: `action="https://buttondown.com/api/emails/embed-subscribe/waskill"`, `data-nl` attribute, `name="email"` input, and the hidden `tag` input. Tags in use: `waskill-results`, `waskill-footer`, `waskill-cat-<category>`.
- **Keep the sponsor slot working**: `/sponsor/` page, `sponsor.json`, `sponsor.js` (bottom ticker bar on every page and/or one card after the top 5 results, never above #1). Never invent a sponsor: no made-up company name, logo or claim that a real sponsor exists.

## Sponsor slot (sponsor.json drives everything, no code changes)

Two placements, both rendered by `sponsor.js` from `sponsor.json`:

- **bar** (`"bar": true`, on now): a 48px ticker fixed to the bottom of every page (home, category pages, /sponsor/). Sponsors scroll sideways at a fixed 30px/s (re-measured after web fonts load and on resize), and stay still under reduced motion. **Desktop:** hovering the bar (or clicking/focusing the "Sponsored ⌃" tab) pauses it and opens a panel listing every sponsor. **Phones:** tapping the moving text or the tab opens the same list as a bottom sheet instead of following a link; tapping outside, the tab again, or Esc closes it. Visitors can hide the bar with ×; that choice is kept in localStorage per sponsor set, so new sponsors show again. `body` gets bottom padding so the bar never covers the footer.
- **Several sponsors:** add `"sponsors": [{"name","tagline","url","logo","demo"}]` to `sponsor.json`; all of them scroll in the bar and appear in the expanded list. Without it, the top-level fields are the one sponsor. The results card always uses the top-level fields.
- **card** (`"card": false`, off now): one card after the top 5 results on the home page. `keywords` only apply to the card.

| `sponsor.json` state | What visitors see |
| --- | --- |
| `active: true, demo: true` (current) | Example content: "Your product here", the pitch, an orange (#d97757) "Sponsored" tag and "Example sponsor, slot available", linking to `/sponsor/`. |
| `active: true, demo: false` + `name`, `tagline`, `url` (+ optional `logo`, `keywords`) | The real sponsor replaces the demo in the same places, opening `url` in a new tab with `rel="sponsored noopener"`. |
| `active: false` | No bar; a small plain house card linking to `/sponsor/` after the results. |

To put a real sponsor in: edit `sponsor.json` only (set `demo` to `false`, fill `name`, `tagline`, `url`, optionally `logo` and `keywords`; turn `bar`/`card` on or off), commit, push. Clicks fire the GoatCounter `sponsor-click` event: title `demo` or the sponsor's `name`, with ` (bar)` appended for desktop clicks on the ticker and ` (list)` for clicks in the expanded list. A phone tap that only opens the list fires nothing. Never invent a sponsor name, logo or claim. The footer of every page links to `/sponsor/` ("Sponsor Waskill").

## Structure

| Path | What it is |
| --- | --- |
| `index.html` | The whole app: markup, inline CSS, inline JS (`run()`, chips, copy button, newsletter handler). `?q=` deep-links a search. |
| `match.js` | `SkillMatch`: BM25 index (`build`), hybrid `search(idx,q,k,qvec)`, `attach` (embeddings), `rewrite` (prompt with skill). Works in browser and Node. |
| `semantic.js` | Lazily imports transformers.js 4.3.1 from jsDelivr + loads `embeddings.json`/`embeddings.bin`, wraps `SkillMatch.search`. On failure or 25 s timeout it falls back to BM25 silently. Shows a "refining matches…" hint (`#ws-refining`). |
| `sponsor.js`, `sponsor.json` | Sponsor card. Edit `sponsor.json` (`active`, `name`, `tagline`, `url`, `logo`, `keywords`) to run a sponsor. |
| `sponsor/index.html` | Sponsor sales page (mailto contact). |
| `skills/<category>.html` | Generated category pages (top 40 per category by stars). Do not edit by hand. |
| `skills.json` / `skills.csv` | Skill data: `name, description, repo, repo_stars, path, url, category, when_to_use, example_prompts, keywords, tip_source`. |
| `embeddings.json` / `embeddings.bin` | `Xenova/all-MiniLM-L6-v2`, q8, 384 dims, int8 vectors with one `scale`, in `names` order (same order as `skills.json`). |
| `tools/gen_seo.py` | Generates category pages, sitemap, llms files. |
| `tools/nl_snippet.py` | Newsletter form/CSS/JS used by gen_seo.py. Its `__main__` was a one-time patch of index.html; **do not run it directly again** (it would insert duplicate forms). |
| `test.js` | Ranking regression tests. |
| `llms.txt`, `llms-full.txt`, `sitemap.xml`, `robots.txt`, `og.png`, `.nojekyll`, `CNAME` | SEO/static files. |

## How data and embeddings are built

The scraping and embedding pipeline is **not in this repo** (it lived in a sibling `data-src`/`emb` workspace and was removed from the published site). This repo only receives its outputs: `skills.json`, `skills.csv`, `embeddings.json`, `embeddings.bin`. When updating skills:

1. Replace `skills.json` (and `skills.csv`) with the new export.
2. Rebuild embeddings with the same model (`Xenova/all-MiniLM-L6-v2`, mean pooling, normalized, int8 quantized with a single `scale`) in exactly `skills.json` order, and update `names` in `embeddings.json`. A mismatch silently ruins semantic ranking.
3. Run `node test.js` (hybrid) and `node test.js --bm25`. Both must print `all regression checks passed`. Hybrid mode needs `@huggingface/transformers` installed next to the repo or in `../emb`; without it the test falls back to BM25.
4. Run `tools/gen_seo.py`.

## Run locally

Any static server from the repo root (the page uses `fetch`, so `file://` will not work):

```bash
npx serve .
```

Then open the printed localhost URL. Try `/?q=make%20a%20pitch%20deck`.

Regenerate SEO files. On Windows set UTF-8 mode, because the script writes `—` and `⭐` with the default file encoding:

```bash
PYTHONUTF8=1 python tools/gen_seo.py
```

## Deploy

A push to `main` publishes to GitHub Pages at https://waskill.dev (custom domain via `CNAME`, no build step, `.nojekyll` so files are served as is). Check the live site after pushing.

## Design system

- Tokens (colours, type, spacing) are CSS custom properties, repeated in three places that must stay in sync: the inline `<style>` of `index.html`, `sponsor/index.html`, and the `CSS` string in `tools/gen_seo.py` (newsletter styles in `tools/nl_snippet.py`).
- `sponsor.js` injects its own small stylesheet and reads the page's custom properties with fallbacks.
- JS contracts the markup must keep: `#q` textarea, `#go` button, `.chip` buttons, `#out` results container, `.card` per result, `.copy[data-i]` buttons, `#nl-res` (hidden until results), global `run()`. `semantic.js` and `sponsor.js` depend on these.
