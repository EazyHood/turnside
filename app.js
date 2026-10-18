import { sampleDeck, validateDeck, parseDeck, parsePairs, sheetsFor, preflight, escapeHTML as esc, printDocument, printMarkup, PRINT_CSS, PAPER, LIMITS } from './model.js';

const $ = selector => document.querySelector(selector);
const STORAGE = 'turnside.deck.v1';
let deck = sampleDeck(), selected = deck.cards[0]?.id, sheetIndex = 0, side = 'front', editing = null, toastTimer, undoAction = null;
let isExample = true;
$('#save-status').textContent = 'Example · not saved yet';
try {
  const stored = localStorage.getItem(STORAGE);
  if (stored) {
    const parsed = parseDeck(stored);
    if (parsed.ok) { deck = parsed.deck; selected = deck.cards[0]?.id; isExample = false; $('#save-status').textContent = 'Saved on this device'; }
    else showStorageWarning('The saved deck could not be loaded. Your saved data was not replaced. Export a new copy when you are ready.');
  }
} catch { showStorageWarning('This browser does not allow local saving. Your deck still works here. Use “Save a copy” to keep it before leaving.'); }

function showStorageWarning(message) { $('#storage-warning').textContent = message; $('#storage-warning').classList.remove('hidden'); }
function save() {
  try {
    const valid = validateDeck(deck);
    if (!valid.ok) { $('#save-status').textContent = 'Add a deck name to save'; return; }
    localStorage.setItem(STORAGE, JSON.stringify(valid.deck));
    $('#save-status').textContent = 'Saved on this device';
  } catch { $('#save-status').textContent = 'Not saved — export a copy'; showStorageWarning('Your browser could not save the latest changes. Use “Save a copy” to keep the deck.'); }
}
function notify(message, undo = null) {
  clearTimeout(toastTimer); undoAction = undo;
  $('#toast').innerHTML = `${esc(message)}${undo ? '<button id="undo-action">Undo</button>' : ''}`;
  $('#toast').classList.remove('hidden');
  if (undo) $('#undo-action').addEventListener('click', () => { const action = undoAction; undoAction = null; action?.(); $('#toast').classList.add('hidden'); });
  toastTimer = setTimeout(() => $('#toast').classList.add('hidden'), undo ? 10000 : 5000);
}
function showDialog(id) { const d = $(id); d.showModal(); }
document.querySelectorAll('.close-dialog').forEach(b => b.addEventListener('click', () => b.closest('dialog').close()));
document.querySelectorAll('dialog').forEach(d => d.addEventListener('click', event => { if (event.target === d) { const r=d.getBoundingClientRect(); if (event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom) d.close(); } }));
$('#edit-dialog').addEventListener('close',()=>{
  const target = [...$('#card-list').querySelectorAll('[data-id]')].find(b=>b.dataset.id===selected);
  (target||$('#add-button')).focus();
});

function render() {
  $('#deck-title').value = deck.title;
  $('#paper-size').value = deck.paper; $('#binding-edge').value = deck.edge;
  $('#card-count').textContent = `${deck.cards.length} ${deck.cards.length === 1 ? 'card' : 'cards'}`;
  $('#example-note').classList.toggle('hidden', !isExample);
  $('#add-button').disabled = deck.cards.length >= LIMITS.cards;
  $('#paste-button').disabled = deck.cards.length >= LIMITS.cards;
  $('#card-list').innerHTML = deck.cards.length ? deck.cards.map((c, i) => `<button class="card-row" data-id="${esc(c.id)}" aria-current="${c.id === selected}" aria-label="Edit card ${i + 1}: ${esc(c.front || 'Untitled question')}"><span class="card-number">${String(i + 1).padStart(2,'0')}</span><span class="card-copy"><strong>${esc(c.front || 'Untitled question')}</strong><small>${esc(c.back || 'Add an answer')}</small>${!c.front.trim() || !c.back.trim() ? '<span class="incomplete-mark">Needs both sides</span>' : ''}</span><span class="edit-mark" aria-hidden="true">↗</span></button>`).join('') : '<div class="empty-list">No cards yet.<br>Add a question and its answer below.</div>';
  $('#card-list').querySelectorAll('[data-id]').forEach(b => b.addEventListener('click', () => openEditor(b.dataset.id)));
  renderPreview();
}
function renderPreview() {
  const sheets = sheetsFor(deck.cards, deck.edge);
  sheetIndex = Math.max(0, Math.min(sheetIndex, sheets.length - 1));
  const sheet = sheets[sheetIndex];
  $('#paper-wrap').classList.toggle('hidden', !sheet);
  $('#empty-preview').classList.toggle('hidden', !!sheet);
  $('#paper-stage').classList.toggle('short-edge', deck.edge === 'short');
  $('#paper-wrap').style.aspectRatio = `${PAPER[deck.paper].width} / ${PAPER[deck.paper].height}`;
  $('#sheet-description').textContent = sheets.length ? `Sheet ${sheetIndex + 1} of ${sheets.length} · 8 cards per sheet` : 'Your print preview will appear here';
  $('#page-count').textContent = `${sheets.length ? sheetIndex + 1 : 0} / ${sheets.length}`;
  $('#prev-sheet').disabled = sheetIndex <= 0; $('#next-sheet').disabled = sheetIndex >= sheets.length - 1;
  $('#front-button').disabled = !sheet; $('#back-button').disabled = !sheet;
  for (const face of ['front','back']) {
    $(`#${face}-sheet`).innerHTML = sheet ? `<div class="sheet-heading"><strong>${esc(deck.title || 'Untitled deck')}</strong><span>${face === 'front' ? 'QUESTIONS' : 'ANSWERS'}</span></div><div class="preview-grid">${sheet[face].map(c => c ? `<button class="preview-card ${c.id === selected ? 'selected' : ''}" data-id="${esc(c.id)}" aria-label="Edit card ${c.number}: ${esc(c[face] || 'Incomplete card')}"><span class="preview-label">${face === 'front' ? 'QUESTION' : 'ANSWER'} <b>${String(c.number).padStart(2,'0')}</b></span><p class="${c[face].length > 130 ? 'small-copy' : c[face].length > 70 ? 'medium-copy' : ''}">${esc(c[face] || 'Add text to this side')}</p><span class="preview-card-footer">${face === 'front' ? 'turn to remember' : 'make it your own'}</span></button>` : '<div class="preview-card blank" aria-label="Unused card space"></div>').join('')}</div><div class="sheet-bottom"><span>Turnside · ${PAPER[deck.paper].label}</span><span>${deck.edge}-edge flip · sheet ${sheetIndex + 1}</span></div>` : '';
    $(`#${face}-sheet`).querySelectorAll('[data-id]').forEach(b => b.addEventListener('click', () => openEditor(b.dataset.id)));
  }
  applySide();
  $('#dimensions').textContent = `8 cards per sheet. Cut along the dotted guides.`;
}
function applySide() {
  $('#sheet').classList.toggle('is-back', side === 'back');
  $('#front-sheet').inert = side !== 'front'; $('#back-sheet').inert = side !== 'back';
  $('#front-sheet').setAttribute('aria-hidden', side !== 'front'); $('#back-sheet').setAttribute('aria-hidden', side !== 'back');
  $('#front-button').setAttribute('aria-pressed', side === 'front'); $('#back-button').setAttribute('aria-pressed', side === 'back');
  $('#pairing-note').innerHTML = `<span class="tiny-square" aria-hidden="true"></span>${side === 'front' ? 'The answer travels with its question.' : deck.edge === 'long' ? 'Columns swap so each pair lines up.' : 'Rows swap so each pair lines up.'}`;
}
$('#front-button').addEventListener('click', () => { side='front';applySide(); });
$('#back-button').addEventListener('click', () => { side='back';applySide(); });
$('#prev-sheet').addEventListener('click', () => { sheetIndex--;renderPreview(); });
$('#next-sheet').addEventListener('click', () => { sheetIndex++;renderPreview(); });
$('#deck-title').addEventListener('input', e => { deck.title=e.target.value;save();renderPreview(); });
$('#deck-title').addEventListener('blur', () => { if (!deck.title.trim()) notify('Give this deck a name before exporting or printing.'); });
$('#paper-size').addEventListener('change', e => { deck.paper=e.target.value;save();renderPreview(); });
$('#binding-edge').addEventListener('change', e => { deck.edge=e.target.value;save();renderPreview();notify(`Preview updated for ${deck.edge}-edge printing.`); });

function openEditor(id = null) {
  editing = id;
  const card = deck.cards.find(c => c.id === id);
  if (card) { selected=id;sheetIndex=Math.floor(deck.cards.indexOf(card)/8);render(); }
  $('#edit-number').textContent = card ? `CARD ${deck.cards.indexOf(card) + 1}` : 'NEW CARD';
  $('#edit-title').textContent = card ? 'One thought at a time.' : 'Start with a good question.';
  $('#card-front').value = card?.front ?? ''; $('#card-back').value = card?.back ?? '';
  $('#edit-error').classList.add('hidden'); $('#delete-card').classList.toggle('hidden', !card);
  updateCounters();showDialog('#edit-dialog');$('#card-front').focus();
}
function updateCounters() { $('#front-counter').textContent = `${$('#card-front').value.length} / 140`;$('#back-counter').textContent = `${$('#card-back').value.length} / 300`; }
$('#card-front').addEventListener('input',updateCounters);$('#card-back').addEventListener('input',updateCounters);
$('#add-button').addEventListener('click',()=>openEditor());
$('#card-form').addEventListener('submit',e=>{
  e.preventDefault();const front=$('#card-front').value.trim(),back=$('#card-back').value.trim();
  if(!front||!back){$('#edit-error').textContent='Add a question and an answer before saving.';$('#edit-error').classList.remove('hidden');return;}
  if(editing){const card=deck.cards.find(c=>c.id===editing);if(!card)return;card.front=front;card.back=back;}
  else{if(deck.cards.length>=LIMITS.cards)return;selected=crypto.randomUUID();deck.cards.push({id:selected,front,back});sheetIndex=Math.floor((deck.cards.length-1)/8);}
  isExample=false;save();render();$('#edit-dialog').close();notify('Card saved. Both sides are paired.');
});
$('#delete-card').addEventListener('click',()=>{
  const index=deck.cards.findIndex(c=>c.id===editing);if(index<0)return;const [removed]=deck.cards.splice(index,1);
  selected=deck.cards[Math.min(index,deck.cards.length-1)]?.id;isExample=false;save();render();$('#edit-dialog').close();
  notify('Card deleted.',()=>{if(deck.cards.length<LIMITS.cards){deck.cards.splice(index,0,removed);selected=removed.id;save();render();}});
});

$('#paste-button').addEventListener('click',()=>{$('#paste-text').value='';$('#paste-error').classList.add('hidden');showDialog('#paste-dialog');});
$('#paste-form').addEventListener('submit',e=>{
  e.preventDefault();const parsed=parsePairs($('#paste-text').value);
  if(parsed.ok&&parsed.cards.length+deck.cards.length>LIMITS.cards){parsed.ok=false;parsed.errors.push(`There is room for ${LIMITS.cards-deck.cards.length} more cards in this deck.`);}
  if(!parsed.ok){$('#paste-error').textContent=parsed.errors.slice(0,5).join('\n');$('#paste-error').classList.remove('hidden');return;}
  const newCards=parsed.cards.map(c=>({...c,id:crypto.randomUUID()}));deck.cards.push(...newCards);selected=newCards[0].id;sheetIndex=Math.floor((deck.cards.length-newCards.length)/8);isExample=false;save();render();$('#paste-dialog').close();notify(`${newCards.length} cards added. Your existing cards are still here.`);
});

function download(name,text,type){const blob=new Blob([text],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function filename(){return (deck.title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60)||'turnside-deck');}
$('#export-button').addEventListener('click',()=>{const valid=validateDeck(deck);if(!valid.ok){notify(valid.errors[0]);$('#deck-title').focus();return;}download(`${filename()}.turnside.json`,JSON.stringify(valid.deck,null,2),'application/json');notify('Deck copy downloaded. Import it on another device.');});
$('#import-button').addEventListener('click',()=>{$('#file-input').value='';$('#file-input').click();});
$('#file-input').addEventListener('change',async e=>{
  const file=e.target.files?.[0];if(!file)return;
  if(file.size>LIMITS.importBytes){notify('File too large. Choose a Turnside JSON deck under 200 KB.');return;}
  $('#import-button').disabled=true;$('#import-button').setAttribute('aria-busy','true');
  try{
    const result=parseDeck(await file.text());
    if(!result.ok){showInfo('This deck could not be imported.',`<p>${result.errors.map(esc).join('<br>')}</p><p>Your current deck has not changed. Choose a Turnside JSON export and try again.</p>`);return;}
    const previous=structuredClone(deck);deck=result.deck;selected=deck.cards[0]?.id;sheetIndex=0;isExample=false;save();render();
    notify(`Imported ${deck.cards.length} cards.`,()=>{deck=previous;selected=deck.cards[0]?.id;sheetIndex=0;save();render();});
  }catch{notify('The file could not be read. Your current deck has not changed.');}
  finally{$('#import-button').disabled=false;$('#import-button').removeAttribute('aria-busy');}
});
$('#new-button').addEventListener('click',()=>showDialog('#confirm-dialog'));
$('#cancel-fresh').addEventListener('click',()=>$('#confirm-dialog').close());
$('#confirm-fresh').addEventListener('click',()=>{const previous=structuredClone(deck);deck={version:1,title:'My new study deck',paper:deck.paper,edge:deck.edge,cards:[]};selected=null;sheetIndex=0;isExample=false;save();render();$('#confirm-dialog').close();notify('Your fresh deck is ready.',()=>{deck=previous;selected=deck.cards[0]?.id;save();render();});});
$('#example-button').addEventListener('click',()=>{deck=sampleDeck();selected=deck.cards[0].id;sheetIndex=0;isExample=true;save();render();notify('Example loaded. Edit any card to make it yours.');});

function showInfo(title,content){$('#info-title').textContent=title;$('#info-content').innerHTML=content;showDialog('#info-dialog');}
$('#help-button').addEventListener('click',()=>showInfo('From a thought to a card.', '<ol><li><strong>Write both sides.</strong> Edit the example or start fresh. Click any question on the list or sheet. You can paste two columns from a spreadsheet.</li><li><strong>Choose how it turns.</strong> Long-edge is like a book; short-edge is like a notepad. The answers change position to meet their questions.</li><li><strong>Test, then print.</strong> Download the alignment test first. Then download the print sheets and open them in a desktop browser. Choose double-sided printing with the same paper and binding edge.</li></ol><p>There is no spaced repetition, content generation or printer connection here. Turnside does one job: make a clear, paired set of paper cards.</p>'));
$('#privacy-button').addEventListener('click',()=>showInfo('Your notes stay here.', '<p>Turnside stores this deck in this browser’s local storage. It does not upload your notes, call an AI model, use analytics, or require an account.</p><p>“Save a copy” downloads a JSON file. “Prepare to print” downloads an HTML file. These files contain your notes; share them only with people you intend to see them.</p><p>Browser storage is not encrypted and may be cleared. Avoid sensitive information on shared devices. Start a fresh deck to replace the current local copy, and keep an exported backup of work you want to retain.</p><p>The starter ecology deck is illustrative content created for this prototype. No real student records or measured learning outcomes are used.</p>'));
function layoutIssues() {
  // Measure the real print markup at CSS print dimensions, not the scaled visual preview.
  const host=document.createElement('div');host.style.cssText='position:fixed;left:-100000px;top:0;visibility:hidden;pointer-events:none';host.inert=true;
  const shadow=host.attachShadow({mode:'open'});shadow.innerHTML=`<style>${PRINT_CSS}</style>${printMarkup(deck)}`;document.body.append(host);
  const issues=[];
  shadow.querySelectorAll('.print-card:not(.blank)').forEach(card=>{if(card.scrollHeight>card.clientHeight+1||card.scrollWidth>card.clientWidth+1){const number=card.querySelector('.print-label b').textContent;issues.push(`Card ${number} is too long for this paper layout. Shorten its text or remove extra line breaks.`);}});
  host.remove();return [...new Set(issues)];
}
$('#prepare-button').addEventListener('click',async()=>{
  const validation=validateDeck(deck),issues=preflight(deck);let valid=validation.ok&&issues.length===0;
  if(valid){await document.fonts.ready;for(const message of layoutIssues())issues.push({type:'layout',message});valid=issues.length===0;}
  $('#preflight-output').innerHTML=valid?`<p class="preflight-pass">✓ ${deck.cards.length} cards, both sides filled. The digital layout is ready.</p>`:`<div class="preflight-fail">${[...validation.errors,...issues.map(i=>i.message)].map(esc).join('<br>')}</div>`;
  $('#print-settings-summary').textContent=`${PAPER[deck.paper].label} paper · double-sided · flip on the ${deck.edge} edge.`;
  const count=Math.ceil(deck.cards.length/8);$('#print-total').textContent=`${count} ${count===1?'sheet':'sheets'} · ${count*2} printed sides`;
  $('#print-download').disabled=!valid;$('#test-download').disabled=!validation.ok;showDialog('#print-dialog');
});
$('#test-download').addEventListener('click',()=>{try{download('turnside-alignment-test.html',printDocument(deck,true),'text/html');notify('Alignment test downloaded. Open it in a browser to print.');}catch(error){notify(error.message);}});
$('#print-download').addEventListener('click',()=>{try{download(`${filename()}-print.html`,printDocument(deck),'text/html');notify('Print sheets downloaded. Open the file to print or save as PDF.');}catch(error){notify(error.message);}});
render();
