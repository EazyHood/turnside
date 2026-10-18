import test from 'node:test';
import assert from 'node:assert/strict';
import { sampleDeck, validateDeck, parseDeck, parsePairs, sheetsFor, backPosition, preflight, printDocument, printMarkup } from './model.js';

test('long-edge portrait imposition mirrors columns, not rows',()=>{
  assert.deepEqual(Array.from({length:8},(_,i)=>backPosition(i,'long')),[1,0,3,2,5,4,7,6]);
});
test('short-edge portrait imposition mirrors rows, not columns',()=>{
  assert.deepEqual(Array.from({length:8},(_,i)=>backPosition(i,'short')),[6,7,4,5,2,3,0,1]);
});
test('a physical sheet turn twice restores every original position',()=>{
  for(const edge of ['long','short'])for(let rows=1;rows<7;rows++)for(let cols=1;cols<5;cols++)for(let i=0;i<rows*cols;i++)assert.equal(backPosition(backPosition(i,edge,rows,cols),edge,rows,cols),i);
});
test('multiple pages preserve every card and blank position',()=>{
  const cards=Array.from({length:19},(_,i)=>({id:`c${i}`,front:`q${i}`,back:`a${i}`}));
  for(const edge of ['long','short']){
    const sheets=sheetsFor(cards,edge);assert.equal(sheets.length,3);
    assert.deepEqual(sheets.flatMap(s=>s.front.filter(Boolean).map(c=>c.id)),cards.map(c=>c.id));
    for(const sheet of sheets)for(let i=0;i<8;i++)assert.equal(sheet.back[backPosition(i,edge)]?.id,sheet.front[i]?.id);
    assert.equal(sheets[2].back.filter(Boolean).length,3);
  }
});
test('sheet generation never mutates source cards',()=>{
  const deck=sampleDeck(),before=structuredClone(deck);sheetsFor(deck.cards,'short');assert.deepEqual(deck,before);
});
test('invalid positions and edge values are rejected',()=>{
  for(const i of [-1,8,.5,NaN])assert.throws(()=>backPosition(i,'long'),RangeError);
  assert.throws(()=>backPosition(0,'invalid'),RangeError);assert.throws(()=>backPosition(0,'long',0,2),RangeError);
});
test('imports reject malformed or oversized JSON without accepting a partial deck',()=>{
  assert.equal(parseDeck('{broken').ok,false);assert.equal(parseDeck('x'.repeat(200001)).ok,false);
  assert.equal(parseDeck(JSON.stringify({version:999})).ok,false);
});
test('imports reject duplicate identifiers, invalid paper, and oversized text',()=>{
  const deck=sampleDeck();deck.cards[1].id=deck.cards[0].id;assert.equal(validateDeck(deck).ok,false);
  deck.cards[1].id='unique';deck.paper='unknown';assert.equal(validateDeck(deck).ok,false);
  deck.paper='a4';deck.cards[0].front='a'.repeat(141);assert.equal(validateDeck(deck).ok,false);
});
test('own-property paper names only are accepted',()=>{
  const deck=sampleDeck();deck.paper='toString';assert.equal(validateDeck(deck).ok,false);
});
test('export and import preserve Unicode and safe literal markup',()=>{
  const deck=sampleDeck();deck.cards[0].front='¿Qué significa “niño”? <script>alert(1)</script>';
  const result=parseDeck(JSON.stringify(deck));assert.equal(result.ok,true);assert.equal(result.deck.cards[0].front,deck.cards[0].front);
});
test('pasted columns preserve order and handle CRLF and blank lines',()=>{
  assert.deepEqual(parsePairs('Question one\tAnswer one\r\n\r\nQuestion two\tAnswer two').cards,[{front:'Question one',back:'Answer one'},{front:'Question two',back:'Answer two'}]);
});
test('ambiguous pasted text cannot silently shift pairings',()=>{
  for(const input of ['only a question','a\tb\tc','a\t','\tb','   '])assert.equal(parsePairs(input).ok,false);
  assert.equal(parsePairs('valid\tanswer\nbroken').ok,false);
});
test('unfinished cards may be saved but never printed as a complete deck',()=>{
  const deck=sampleDeck();deck.cards[3].back='  ';assert.equal(validateDeck(deck).ok,true);assert.equal(preflight(deck)[0].index,3);assert.throws(()=>printMarkup(deck));
  deck.cards=[];assert.equal(preflight(deck)[0].type,'empty');assert.throws(()=>printMarkup(deck));
});
test('HTML output escapes hostile content in headings and both card faces',()=>{
  const deck=sampleDeck();deck.title='</title><script>alert("x")</script>';deck.cards[0].front='<img src=x onerror=alert(1)>';deck.cards[0].back='<script>evil()</script>';
  const result=printDocument(deck);assert.ok(!result.includes('<script>'));assert.ok(!result.includes('<img'));assert.ok(result.includes('&lt;img'));assert.ok(result.includes('&lt;script&gt;'));
});
test('print output alternates fronts/backs, correct paper geometry and edge',()=>{
  const deck=sampleDeck();deck.paper='letter';deck.edge='short';deck.cards.push({id:'ninth',front:'Ninth',back:'Ninth answer'});
  const result=printDocument(deck);assert.equal((result.match(/<section class="print-page"/g)||[]).length,4);
  assert.ok(result.includes('@page{size:215.9mm 279.4mm;margin:0}'));assert.ok(result.includes('flip on the <strong>short edge</strong>'));
  const sheets=sheetsFor(deck.cards,deck.edge);assert.equal(sheets[1].back[6].id,'ninth');
});
test('alignment test works with an empty deck and never prints private card text',()=>{
  const deck=sampleDeck();deck.cards[0].front='sensitive';const result=printDocument(deck,true);assert.ok(!result.includes('sensitive'));
  deck.cards=[];assert.equal((printMarkup(deck,true).match(/<article class="print-card calibration"/g)||[]).length,16);
});
test('unexpected imported fields are not carried into the stored deck',()=>{
  const deck=sampleDeck();deck.secret='remove';deck.cards[0].unknown='remove';const result=validateDeck(deck);assert.equal(result.deck.secret,undefined);assert.equal(result.deck.cards[0].unknown,undefined);
});
