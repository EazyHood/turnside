# Turnside — Devpost draft

Status: ready for factual review; this file is not proof of submission.

## Project name

Turnside

## Elevator pitch

Make study cards that belong together. Turnside pairs questions and answers on
both sides of a print sheet, so the layout is visible before the first cut.

## Inspiration

The last step between a study note and a useful paper card is easy to overlook:
the answer has to land behind the right question. A page can look attractive on a
screen and still be confusing to print. Turnside focuses on that small but
consequential handoff from digital editing to physical use.

We chose a student workflow that can be demonstrated completely without invented
user metrics, an expensive service, or a complex backend.

## What it does

Start with a question and an answer. Edit either through the card list or the
sheet, paste a two-column list from your notes, and keep an editable copy locally.
The preview shows the same paired cards on both faces. Switching from a book-like
long-edge turn to a notepad-like short-edge turn changes their actual positions.

Before downloading, Turnside checks for missing text and measures overflow using
the print layout. It gives you a numbered alignment test and a standalone HTML
file with alternating front and back pages. Open that file in a desktop browser
to print or save as PDF. The app does not connect to a printer or print anything
automatically.

## How we built it

Turnside is a new HTML, CSS and JavaScript application with no external runtime
dependencies. A pure model owns validation, page grouping, back-side imposition
and escaped output. The UI renders the same data into the editing list and the
paper preview. Local storage retains the current deck; JSON export makes it
portable without cloud sync.

We used OpenAI Codex for AI-assisted development. The interface, logic, tests and
sample content were created for this project. No previous completed submission
or third-party UI template was reused.

## Challenges we ran into

The subtle challenge was preserving pairing when there are unused spaces on the
last sheet. The back must mirror physical positions, not simply reverse a list of
existing cards. We tested partial sheets as well as both binding edges.

Another challenge was avoiding a good-looking preview that hides a bad export.
The printable layout has its own dimensions, so the preflight measures that layout
and blocks cards that overflow. Printer registration remains a separate physical
variable, which is why the alignment test is part of the main flow.

## Accomplishments

The main workflow ends in an actual editable deck and printable file. The page
turn explains a real change in the output. The app handles empty decks, malformed
input, storage failures, partial pages and oversized text without pretending that
everything succeeded.

It also stays small enough to run without installation, accounts or paid services.

## What we learned

Showing a transformation is often clearer than describing it. Card numbers,
linked selection and the direction of the sheet turn make duplex pairing visible.
The most useful polish was not another animation: it was a recovery path when a
file or card was not ready to print.

## What's next

The next validation step is a small physical-printer study across common duplex
drivers, followed by offset calibration if the evidence justifies it. We would
also test the workflow with students using assistive technology. These are plans,
not completed validation.

## Built with

HTML5, CSS, JavaScript, Node.js (local development and tests), OpenAI Codex.

## Reviewer notes

- The example deck is illustrative. No real student data or learning-outcome claim.
- No physical printer test has been performed. Run the supplied alignment test.
- No AI service runs in the product; Codex was a development tool.
- Current automated/browser evidence is documented in QA.md.
- Public app URL, repository URL and video URL: add only after independently opening
  the final published artifacts. Do not submit placeholder URLs.
