export const VERSION = 1;
export const LIMITS = Object.freeze({ cards: 120, title: 80, front: 140, back: 300, importBytes: 200000 });
export const PAPER = Object.freeze({ a4: { label: 'A4', width: 210, height: 297 }, letter: { label: 'US Letter', width: 215.9, height: 279.4 } });
export const GRID = Object.freeze({ columns: 2, rows: 4, capacity: 8 });

export function sampleDeck() {
  return {
    version: VERSION,
    title: 'Small things, big ecosystems',
    paper: 'a4', edge: 'long',
    cards: [
      ['What is a keystone species?', 'A species whose effect on its ecosystem is large relative to its abundance.'],
      ['Why do mangroves matter?', 'Their roots shelter young marine life, help stabilize shorelines, and store carbon.'],
      ['What is mutualism?', 'An interaction in which both species benefit, such as a pollinator and a flowering plant.'],
      ['What does biodiversity describe?', 'Variation in living things, including genes, species, and ecosystems.'],
      ['What is an ecological niche?', 'The conditions and resources a species uses, and its interactions in an ecosystem.'],
      ['What happens during succession?', 'The composition of a community changes over time following disturbance or new habitat.'],
      ['What is a food web?', 'A network of feeding relationships connecting organisms in an ecosystem.'],
      ['What is habitat fragmentation?', 'The division of a continuous habitat into smaller, separated areas.']
    ].map(([front, back], i) => ({ id: `example-${i + 1}`, front, back }))
  };
}

export function validateDeck(input) {
  const errors = [];
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { ok: false, errors: ['The file must contain a Turnside deck object.'] };
  if (input.version !== VERSION) errors.push('This deck version is not supported. Use a Turnside version 1 export.');
  if (typeof input.title !== 'string' || !input.title.trim() || input.title.length > LIMITS.title) errors.push('Give the deck a title of 1–80 characters.');
  if (typeof input.paper !== 'string' || !Object.hasOwn(PAPER, input.paper)) errors.push('Choose A4 or US Letter paper.');
  if (!['long', 'short'].includes(input.edge)) errors.push('Choose long-edge or short-edge duplex printing.');
  if (!Array.isArray(input.cards) || input.cards.length > LIMITS.cards) errors.push('A deck can contain up to 120 cards.');
  else {
    const ids = new Set();
    input.cards.forEach((card, i) => {
      if (!card || typeof card !== 'object') { errors.push(`Card ${i + 1} is not a card object.`); return; }
      if (typeof card.id !== 'string' || !card.id || card.id.length > 100 || ids.has(card.id)) errors.push(`Card ${i + 1} has an invalid or repeated identifier.`);
      ids.add(card.id);
      for (const side of ['front', 'back']) if (typeof card[side] !== 'string' || card[side].length > LIMITS[side]) errors.push(`Card ${i + 1}: ${side} must be text of at most ${LIMITS[side]} characters.`);
    });
  }
  if (errors.length) return { ok: false, errors };
  return { ok: true, deck: { version: VERSION, title: input.title.trim(), paper: input.paper, edge: input.edge, cards: input.cards.map(({id,front,back}) => ({id,front,back})) }, errors: [] };
}

export function parseDeck(text) {
  if (new TextEncoder().encode(text).length > LIMITS.importBytes) return { ok: false, errors: ['This file is too large. The limit is 200 KB.'] };
  try { return validateDeck(JSON.parse(text)); }
  catch { return { ok: false, errors: ['This is not valid JSON. Select a deck previously exported by Turnside.'] }; }
}

export function backPosition(frontPosition, edge, rows = GRID.rows, columns = GRID.columns) {
  if (!Number.isInteger(rows) || !Number.isInteger(columns) || rows < 1 || columns < 1 || !Number.isInteger(frontPosition) || frontPosition < 0 || frontPosition >= rows * columns) throw new RangeError('Invalid sheet position.');
  if (!['long', 'short'].includes(edge)) throw new RangeError('Unknown binding edge.');
  const row = Math.floor(frontPosition / columns), column = frontPosition % columns;
  return edge === 'long' ? row * columns + (columns - column - 1) : (rows - row - 1) * columns + column;
}

export function sheetsFor(cards, edge) {
  if (!Array.isArray(cards) || !['long','short'].includes(edge)) throw new TypeError('Invalid deck or edge.');
  const sheets = [];
  for (let offset = 0; offset < cards.length; offset += GRID.capacity) {
    const front = Array.from({ length: GRID.capacity }, (_, slot) => cards[offset + slot] ? { ...cards[offset + slot], number: offset + slot + 1 } : null);
    const back = Array(GRID.capacity).fill(null);
    front.forEach((card, slot) => { back[backPosition(slot, edge)] = card; });
    sheets.push({ front, back });
  }
  return sheets;
}

export function preflight(deck) {
  const issues = [];
  if (!deck.cards.length) issues.push({ type: 'empty', message: 'Add at least one card before printing.' });
  for (let i = 0; i < deck.cards.length; i++) {
    if (!deck.cards[i].front.trim() || !deck.cards[i].back.trim()) issues.push({ type: 'incomplete', index: i, message: `Card ${i + 1} needs a question and an answer.` });
  }
  return issues;
}

export function parsePairs(text) {
  if (new TextEncoder().encode(text).length > LIMITS.importBytes) return { ok: false, errors: ['Pasted text is too large. Use fewer than 200 KB.'] };
  const cards = [], errors = [];
  const lines = text.replace(/\r\n?/g, '\n').split('\n');
  lines.forEach((line, i) => {
    if (!line.trim()) return;
    const parts = line.split('\t');
    if (parts.length !== 2) { errors.push(`Line ${i + 1}: use exactly one tab between the question and answer.`); return; }
    const [front, back] = parts.map(s => s.trim());
    if (!front || !back) errors.push(`Line ${i + 1}: both sides need text.`);
    else if (front.length > LIMITS.front || back.length > LIMITS.back) errors.push(`Line ${i + 1}: the question must be at most 140 characters and the answer at most 300.`);
    else cards.push({ front, back });
  });
  if (!cards.length && !errors.length) errors.push('Paste at least one question and answer.');
  if (cards.length > LIMITS.cards) errors.push('A deck can contain up to 120 cards.');
  return { ok: errors.length === 0, cards, errors };
}

export function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c]);
}

export function printMarkup(deck, calibration = false) {
  const check = validateDeck(deck);
  if (!check.ok) throw new Error(check.errors.join(' '));
  if (!calibration && preflight(deck).length) throw new Error('Complete the deck before printing.');
  const paper = PAPER[deck.paper];
  const cards = calibration ? Array.from({length: 8}, (_,i) => ({ id:`cal-${i}`, front:`${i + 1}`, back:`${i + 1}` })) : deck.cards;
  const sheets = sheetsFor(cards, deck.edge);
  return sheets.map((sheet, index) => ['front','back'].map(side => `<section class="print-page" style="--paper-width:${paper.width}mm;--paper-height:${paper.height}mm"><header class="print-header"><span>${escapeHTML(calibration ? 'Turnside · alignment test' : deck.title)}</span><span>Sheet ${index + 1} · ${side === 'front' ? 'questions' : 'answers'} · ${deck.edge}-edge</span></header><div class="print-grid">${sheet[side].map(card => card ? `<article class="print-card${calibration ? ' calibration' : ''}"><div class="print-label">${calibration ? 'MATCH THIS NUMBER' : (side === 'front' ? 'QUESTION' : 'ANSWER')} <b>${card.number}</b></div><p>${escapeHTML(card[side])}</p><span class="print-card-footer">${calibration ? 'Hold up to a light. The matching number belongs directly behind this card.' : escapeHTML(deck.title)}</span></article>` : '<article class="print-card blank" aria-label="Unused card space"></article>').join('')}</div><footer class="print-footer"><span>100% scale · Portrait · ${paper.label} · Flip on ${deck.edge} edge</span><span>${calibration ? 'Test both sides before printing the full deck.' : 'Cut along the dotted guides.'}</span></footer></section>`).join('')).join('');
}

export const PRINT_CSS = `
*{box-sizing:border-box}body{margin:0;color:#172432;font-family:Arial,sans-serif;background:#fff}
.print-page{width:var(--paper-width);height:var(--paper-height);padding:12mm;page-break-after:always;break-after:page;display:flex;flex-direction:column;overflow:hidden}
.print-page:last-child{page-break-after:auto;break-after:auto}.print-header,.print-footer{display:flex;justify-content:space-between;gap:5mm;font-size:8pt;line-height:1.3}
.print-header{height:8mm;flex-shrink:0}.print-footer{height:8mm;padding-top:3mm;flex-shrink:0}.print-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));grid-template-rows:repeat(4,minmax(0,1fr));flex:1;min-height:0}
.print-card{min-width:0;min-height:0;padding:4mm 5mm;border:.2mm dashed #777;display:flex;flex-direction:column;position:relative;overflow:hidden}
.print-label{font-size:7pt;letter-spacing:.08em;display:flex;justify-content:space-between;color:#394855}.print-label b{letter-spacing:0}.print-card p{font-family:Georgia,serif;font-size:12pt;line-height:1.28;margin:3mm 0;overflow-wrap:anywhere;white-space:pre-wrap;flex:1}.print-card-footer{font-size:7pt;color:#465260;overflow-wrap:anywhere}.calibration p{font-family:Arial,sans-serif;font-weight:700;font-size:32pt;margin:1mm 0}.calibration .print-card-footer{font-size:8pt}.blank{background:#fff}
@media screen{body{background:#e9e8e2}.print-page{background:#fff;margin:16px auto;box-shadow:0 3px 24px #0001}.print-toolbar{padding:20px;max-width:800px;margin:auto;font:16px/1.5 Arial}.print-toolbar button{padding:12px 20px;cursor:pointer}.print-toolbar p{margin:8px 0}}
@media print{.print-toolbar{display:none}.print-page{margin:0}body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
`;

export function printDocument(deck, calibration = false) {
  const paper = PAPER[deck.paper];
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHTML(deck.title)} — Turnside print sheet</title><style>${PRINT_CSS}\n@page{size:${paper.width}mm ${paper.height}mm;margin:0}</style></head><body><div class="print-toolbar"><h1>${calibration ? 'Check your printer alignment' : 'Your Turnside print sheets'}</h1><p>Print ${paper.label}, portrait, actual size / 100%, double-sided, flip on the <strong>${deck.edge} edge</strong>. Disable browser headers and footers. Use matching paper in the printer. Run the alignment test before printing a full deck.</p><p>This file contains alternating fronts and backs. Printer registration varies; Turnside cannot guarantee physical alignment.</p><button onclick="window.print()">Print / save as PDF</button></div>${printMarkup(deck, calibration)}</body></html>`;
}
