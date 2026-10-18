# Executed checks and limits

Tested locally on Windows, 2026-10-18 UTC / 2026-10-17 Colombia.

## Executed

- `npm test`: 17/17 tests pass. One initial test exposed inherited-object paper names
  being accepted; validation was changed to own properties and the suite was rerun.
- `npm run check`: syntax checks for app, model and localhost server pass.
- Browser: created a ninth card, reloaded, and observed all nine cards persisted.
- Browser: invalid pasted row rejected with the deck unchanged; two valid TSV rows
  appended successfully, producing eleven cards.
- Browser: Start fresh produced the empty state; Undo restored the eleven cards.
- Browser: long/short binding changes visibly update answer order and explanation.
- Browser: Prepare to print passed for the nine-card example and an actual four-page
  HTML print file was downloaded. The browser's download-event wait timed out, but
  the file was independently found and preserved as `qa/downloaded-print.html`.
  SHA-256: `1057be7a20cee2f367d71ec3d259319053d05746c9f48d41a98dd73d6523cae6`.
  This is historical download evidence from before the physical-page centering fix,
  not the final print artifact. `qa/print-example.html` was regenerated from the
  corrected print engine.
- Browser: a 24-line answer was blocked as overflowing; the print download button
  was disabled. Evidence: `qa/overflow-blocked.png`.
- Browser: Escape closed the print dialog. Card-editor focus restoration is explicit
  in the implementation; full keyboard/screen-reader testing remains limited.
- Same-origin responsive harness checked 375, 768 and 1280 px frames. Content width
  was 360 (vertical scrollbar), 768 and 1280 px respectively, with no horizontal
  overflow. No visible enabled non-hidden button measured below 39 px in either
  dimension (CSS minimum target is 40 px). The harness excludes the inert back face.
- Mobile and tablet screenshots were visually inspected. The 1280 px screenshot
  from the harness shows only the part visible in the host browser; it is not a
  full-width marketing image. The browser full-page screenshot attempt timed out;
  no full-page result is claimed. Temporary viewport override was reset.
- Independent review found that unequal header/footer heights and a shortened
  page height displaced the print grid from the physical sheet midpoint. The print
  engine now uses the full A4/Letter height, equal 8 mm header/footer space, equal
  12 mm outer margins and symmetric card borders. The 17 tests and syntax checks
  passed again after this change. A separate reviewer then checked A4 and Letter,
  each with long-edge and short-edge binding: all 32 numbered pairings and their
  reflections passed. Maximum pair-center discrepancy was 0.010651 CSS px
  (about 0.00282 mm); grid centering discrepancy was below 0.000611 px. Evidence:
  `D:/IA/agentes/codex-cuenta3/2026-10-18-turnside-review/geometry-result.json`
  and `model-tested.sha256`. This confirms browser geometry, not physical printer
  registration.

## Evidence

`qa/workspace.png`, `qa/print-preflight.png`, `qa/overflow-blocked.png`,
`qa/mobile-375.png`, `qa/tablet-768.png`, `qa/desktop-1280.png`.

The UI was restored to the eight-card sample deck after the destructive test cases.
All data used in these checks was synthetic/example material created for the app.

## Limits requiring honest presentation

- No physical paper or printer was used. The calibration file asks the user to test
  registration before printing a full deck.
- The app's digital overflow guard measures its current browser. Different print
  engines or user settings may vary.
- No Safari/Firefox hardware test, screen-reader user study, formal accessibility
  certification or learning-outcome experiment was performed.
- Reduced motion is implemented with a CSS media query, not yet tested with a
  separate OS accessibility-setting change.
- No public hosting, video publication or Devpost submission was performed by the
  implementation agent. Those are separate completion gates.
