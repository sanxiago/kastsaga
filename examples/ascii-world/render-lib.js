import fs from 'node:fs';
import { wcwidth } from './wcwidth.js';

function key(x, y) {
  return `${x},${y}`;
}

function graphemeClusters(str) {
  const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
  return Array.from(segmenter.segment(str), s => s.segment);
}

function glyphWidth(glyph, displayWidthHint) {
  if (typeof displayWidthHint === 'number') return displayWidthHint;
  if (glyph === '' || glyph == null) return 0;
  let width = 0;
  for (const g of graphemeClusters(glyph)) {
    width += wcwidth(g);
  }
  return width || 1;
}

export function loadObservation(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

export function render(observation) {
  const { viewport, legend, terrainRows, objects = [], entities = [] } = observation;
  const { width, height, origin } = viewport;

  // Build terrain grid
  const grid = Array.from({ length: height }, (_, row) => {
    const y = origin.y + row;
    const terrainRow = terrainRows[y]?.slice(origin.x, origin.x + width) || ''.padEnd(width, ' ');
    return Array.from({ length: width }, (_, col) => {
      const x = origin.x + col;
      const glyph = terrainRow[col] ?? ' ';
      return { terrainGlyph: glyph, cell: glyph, width: glyphWidth(glyph) }; // base glyph
    });
  });

  // Map objects by cell
  const objectsByCell = new Map();
  for (const obj of objects) {
    const k = key(obj.x, obj.y);
    if (!objectsByCell.has(k)) objectsByCell.set(k, []);
    objectsByCell.get(k).push(obj);
  }

  // Map entities by cell (assume at most one per cell per spec profile)
  const entitiesByCell = new Map();
  for (const ent of entities) {
    entitiesByCell.set(key(ent.x, ent.y), ent);
  }

  // Track used glyphs for legend
  const used = { terrain: new Set(), objects: new Set(), entities: new Set(), emotes: new Set() };

  // Overlay objects and entities
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const x = origin.x + col;
      const y = origin.y + row;
      const k = key(x, y);
      const cell = grid[row][col];

      used.terrain.add(cell.terrainGlyph);

      // Objects
      const cellObjects = objectsByCell.get(k) || [];
      let objectGlyph = null;
      if (cellObjects.length === 1) {
        const obj = cellObjects[0];
        const type = obj.type;
        objectGlyph = obj.glyph || legend.objects?.[type] || '?';
        used.objects.add(objectGlyph);
      } else if (cellObjects.length > 1) {
        objectGlyph = legend.objects?.stack || '*';
        used.objects.add(objectGlyph);
      }

      // Entities
      const ent = entitiesByCell.get(k);
      let entGlyph = null;
      let entWidthHint = undefined;
      let emoteGlyph = '';
      let emoteWidthHint = undefined;
      if (ent) {
        entGlyph = ent.glyph || legend.entities?.[ent.role] || '@';
        entWidthHint = ent.displayWidth;
        used.entities.add(entGlyph);
        if (ent.emote) {
          emoteGlyph = legend.emotes?.[ent.emote] || ent.emote;
          emoteWidthHint = ent.emoteWidth ?? undefined;
          used.emotes.add(emoteGlyph);
        }
      }

      // Resolve layering: terrain -> object -> entity
      if (entGlyph) {
        cell.cell = entGlyph + emoteGlyph;
        cell.width = glyphWidth(entGlyph, entWidthHint) + glyphWidth(emoteGlyph, emoteWidthHint || 0);
      } else if (objectGlyph) {
        cell.cell = objectGlyph;
        cell.width = glyphWidth(objectGlyph, undefined);
      } else {
        cell.cell = cell.terrainGlyph;
        cell.width = glyphWidth(cell.terrainGlyph, undefined);
      }
    }
  }

  // Determine uniform cell width for alignment (min 2)
  const maxCellWidth = Math.max(
    2,
    ...grid.flat().map(c => c.width)
  );

  const rows = grid.map(row =>
    row
      .map(c => {
        const pad = Math.max(0, maxCellWidth - c.width);
        return c.cell + ' '.repeat(pad);
      })
      .join('')
  );

  const legendLines = [];
  legendLines.push('Legend:');
  if (used.terrain.size) {
    legendLines.push('  Terrain:');
    for (const g of used.terrain) legendLines.push(`    ${g} = terrain`);
  }
  if (used.objects.size) {
    legendLines.push('  Objects:');
    for (const g of used.objects) legendLines.push(`    ${g} = object/stack`);
  }
  if (used.entities.size) {
    legendLines.push('  Entities:');
    for (const g of used.entities) legendLines.push(`    ${g} = entity`);
  }
  if (used.emotes.size) {
    legendLines.push('  Emotes:');
    for (const g of used.emotes) legendLines.push(`    ${g} = emote`);
  }

  return { rows, legendLines, cellWidth: maxCellWidth };
}

export function renderToText(observation) {
  const { rows, legendLines } = render(observation);
  return rows.join('\n') + '\n\n' + legendLines.join('\n');
}
