#!/usr/bin/env node
// Deterministic ASCII renderer for a sample observation.
// Usage: node render.js [path/to/world.json]

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const inputPath = process.argv[2] || path.join(__dirname, 'world.json');

function loadObservation(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function key(x, y) {
  return `${x},${y}`;
}

function render(observation) {
  const { viewport, legend, terrainRows, objects = [], entities = [] } = observation;
  const { width, height, origin } = viewport;

  // Build terrain grid
  const grid = Array.from({ length: height }, (_, row) => {
    const y = origin.y + row;
    const terrainRow = terrainRows[y]?.slice(origin.x, origin.x + width) || ''.padEnd(width, ' ');
    return Array.from({ length: width }, (_, col) => {
      const x = origin.x + col;
      const glyph = terrainRow[col] ?? ' ';
      return { terrainGlyph: glyph, cell: glyph }; // base glyph
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
        const type = cellObjects[0].type;
        objectGlyph = legend.objects?.[type] || '?';
        used.objects.add(objectGlyph);
      } else if (cellObjects.length > 1) {
        objectGlyph = legend.objects?.stack || '*';
        used.objects.add(objectGlyph);
      }

      // Entities
      const ent = entitiesByCell.get(k);
      let entGlyph = null;
      let emoteGlyph = ' ';
      if (ent) {
        entGlyph = ent.glyph || legend.entities?.[ent.role] || '@';
        used.entities.add(entGlyph);
        if (ent.emote) {
          emoteGlyph = legend.emotes?.[ent.emote] || '!';
          used.emotes.add(emoteGlyph);
        }
      }

      // Resolve layering: terrain -> object -> entity
      if (entGlyph) {
        cell.cell = entGlyph + emoteGlyph; // 2-char cell when entity present
      } else if (objectGlyph) {
        cell.cell = objectGlyph + ' ';
      } else {
        cell.cell = cell.terrainGlyph + ' ';
      }
    }
  }

  const rows = grid.map(row => row.map(c => c.cell.padEnd(2, ' ')).join(''));

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

  return { rows, legendLines };
}

function main() {
  const obs = loadObservation(inputPath);
  const { rows, legendLines } = render(obs);
  console.log(rows.join('\n'));
  console.log('\n' + legendLines.join('\n'));
}

main();
