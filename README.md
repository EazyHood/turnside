# Turnside

**Study cards, ready for paper.**

Turnside is a small, local-first workspace for students who want to turn a set of
questions and answers into usable, two-sided paper cards. It makes the hidden part
of printing visible: which answer belongs behind which question, and how that
position changes when the sheet turns on its long or short edge.

This is a new project built for **Hyperbloom October — UI/UX and Web Design** on
October 17–18, 2026. It is not a reskin of an earlier submission. AI-assisted
development was used and is disclosed below.

## Try it

Requires Node.js 22 or later. There are **no package dependencies** to install.

```sh
npm start
```

Open <http://127.0.0.1:4193>. The eight-card ecology deck is illustrative content,
not a real student's record or evidence of learning outcomes.

1. Edit a question in the list or on the sheet. Both faces remain paired.
2. Add a ninth card to see how a partially filled second sheet is handled.
3. Switch between **Questions** and **Answers**, then choose a different binding edge.
4. Select **Prepare to print**. Download the numbered alignment test first.
5. Download the print sheets, open the HTML file in a desktop browser, then print
   or save as PDF using the exact settings shown.

Use **Save a copy** to download an editable JSON deck, or **Import deck** to restore it.
You can paste two spreadsheet columns using **Paste a list**. Each row must contain
exactly one tab separating the question and answer; ambiguous rows are rejected.

## What works

- Create, edit and delete cards, with undo after deletion or deck replacement.
- Paste paired questions/answers; validation preserves the existing deck on failure.
- Local browser persistence and JSON import/export, up to 120 cards.
- A4 or US Letter, portrait, eight cards per sheet.
- Long-edge and short-edge duplex imposition, including blank slots on the last sheet.
- Linked list/sheet selection and a whole-sheet turn that follows the chosen edge.
- Explicit print preparation, missing-text checks, and a rendered overflow check
  against the real print dimensions before the print export is enabled.
- Standalone, escaped HTML print output with embedded CSS and no network dependency.
- A separate numbered alignment test that does not include the deck's card content.
- Keyboard-operable controls, native modal focus containment, Escape dismissal,
  visible focus, reduced motion, and responsive layouts.

## What it does not claim

Turnside does not connect to a printer or guarantee physical registration. Printer
drivers, duplex feed paths, browser settings, margins and paper handling can change
the result. Print the test page first. The model and digital output have been tested;
**no physical printer test has been performed**.

The sheet preview is a scaled orientation aid, not an exact typography proof. The
download uses print-specific CSS; review it before printing. The overflow guard
measures the current browser's layout, not every printer or browser combination.

There is no spaced repetition, AI content generation, OCR, PDF import, cloud sync,
collaboration, native mobile print support, or measured learning benefit. Mobile
editing and preview are supported; desktop printing is recommended.

## Privacy and cost

The app has no backend, analytics, cookies, external fonts, API keys or paid services.
It stores the current deck in `localStorage`. This is not encrypted; use caution on
shared devices. Exported JSON and HTML include the deck's content. Browser storage
can be cleared, so keep an exported backup. A fresh deck replaces the current local
copy. The hosting provider may process ordinary access logs outside the app's code.

No money was spent to build or test the project. Printing physical paper is optional
and outside the app's operation.

## Test

```sh
npm test
npm run check
```

The deterministic tests cover both imposition maps, paired positions after two
turns, multiple and partial sheets, malformed imports, duplicate IDs, oversized
content, Unicode, ambiguous pasted rows, missing sides, HTML escaping and calibration.
`QA.md` records the checks actually executed and their limits.

## Structure and deployment

The runtime is intentionally small: plain HTML, CSS and ES modules. It needs no
framework, installation, build step or server-side data. This keeps a student tool
easy to inspect, host cheaply and continue after the hackathon.

Publish these five files to any static HTTPS host:

```text
index.html
style.css
app.js
model.js
icon.svg
```

The HTML loads four local assets. The development
server and the `qa/` folder are not required by the hosted app. Use HTTP locally
rather than opening `index.html` through `file://`, because ES modules require it.

`model.js` owns validation, imposition and safe output. `app.js` handles DOM and
storage. `style.css` defines the workbench and reduced-motion behavior.
`server.mjs` only serves an allowlist of files on localhost.

## Design and provenance

See `DESIGN.md` for the problem, alternatives, interaction decisions and rubric
mapping. See `ELIGIBILITY.md` for current contest evidence and unresolved submission
requirements. `SUBMISSION.md` contains a factual Devpost draft; it is not proof of
registration or submission. `DEMO.md` is a recording plan, not a produced video.

Source code and original interface were created with OpenAI Codex under Jhonatan's
direction. No third-party UI template, stock image, proprietary dataset or previous
project implementation was reused. The sample cards were written for this prototype.
No real users, interviews, results, awards or paper savings are invented.

MIT licensed. See `LICENSE`.
