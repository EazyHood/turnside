# Design record

## A narrow, testable job

**Person:** a student preparing a small study deck to use away from a screen.

**Moment:** the notes are already written. Before printing, the student needs to
know whether a question and answer will land on the same physical card.

**Transformation:** editable question/answer pairs → a visible imposition plan →
downloadable, two-sided print sheets plus an alignment test.

This is a design hypothesis, not a claim drawn from interviews. No students were
recruited or studied during development.

## Two external alternatives

Reviewed October 18, 2026 using official pages:

| Alternative | Documented capability | Turnside's chosen emphasis |
|---|---|---|
| [Quizlet's printing workflow](https://help.quizlet.com/hc/en-us/articles/360030635472-Printing-sets) | Print an existing set after login; adjust print options. The help page states desktop printing is required. | A standalone, account-free print workspace with explicit front/back slot pairing and a binding-edge preview. |
| [Canva flashcard templates](https://www.canva.com/flashcards/templates/) | Customizable visual flashcard templates for printing. | Keep editing constrained to a question and answer; derive both sheet faces from the same pairs instead of treating each page as an independent design. |

These are capability comparisons, not timed product tests. We did not test paid
plans or assert that either product can never implement duplex printing. Turnside
is not claimed to be the first flashcard printing tool.

## Information architecture

The interface separates **content** from **physical arrangement**. The card list
and deck title occupy the left work area. The sheet occupies the other area.
Selecting either representation opens the same editor. Paper size and edge sit
beside print preparation, where those decisions matter.

The back-side order is intentionally visible. With long-edge portrait printing,
the columns exchange places. With short-edge printing, the rows exchange places.
Card numbers and selection survive the transition. The sheet moves as one object;
individual labels never float away from their cards.

No marketing landing page, statistics dashboard, fake activity feed or elaborate
onboarding stands between the user and their first edit.

## Interaction and recovery

- Whole-sheet rotation explains which edge moves. It is a CSS transition that can
  be interrupted; reduced-motion users receive the state change immediately.
- The hidden face is inert and hidden from assistive technology.
- Input has labels and limits. Import errors leave the current deck intact.
- Missing or overflowing card text blocks the printable export instead of silently
  discarding it. The user can still save an editable JSON copy.
- Deleted cards and replaced decks have a ten-second undo action.
- The empty state offers the example or a new card. Nothing requires an account.
- The preflight ends in a usable file, not a success animation with no output.

## Visual direction

The warm workbench and white paper establish which area is editable and which is
the physical artifact. Indigo is the working ink; terracotta marks the selected
card and sheet corner. The corner is an orientation cue. Georgia gives questions
a quiet reading texture; system sans-serif labels keep controls direct. No remote
fonts or decorative images are loaded.

The design adopts the task-specific discipline of Jhona's accepted FORMA and
TALLER references: controls explain an action, measurements serve the work, and
the content—not a generic dashboard—defines the composition.

## Hyperbloom evidence map

The official page lists areas of interest but does not publish weighted judging
criteria. The mapping below uses those areas without inventing weights or a score.

| Published area | Evidence |
|---|---|
| Thoughtful UX and user flows | Edit → view both sides → preflight → actual print file; invalid-input and empty states. |
| Intuitive, compelling UI | Workbench with list/sheet linkage, visible pairing and print settings beside the output. |
| Accessibility and inclusion | Keyboard controls, modal labels, focus, reduced motion, responsive layout, no account requirement. |
| Interaction and information architecture | One paired data model drives both representations; a binding-edge change changes actual output. |
| Problem-solving and originality | A focused paper-production tool built from scratch, differentiated from general study/template tools. |
| Polished working implementation | Executed logic tests, browser flow checks, downloadable output and stated limitations. |

Accessibility is an implementation and test effort, not a third-party certification.
There has been no screen-reader user study or physical printer validation.
