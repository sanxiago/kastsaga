#!/usr/bin/env node
// Interactive movement demo for the ASCII world.
// Arrow keys to move, q to quit.

import path from 'node:path';
import url from 'node:url';
import readline from 'node:readline';
import { loadObservation, render } from './render-lib.js';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const inputPath = process.argv[2] || path.join(__dirname, 'world.json');

const PASSABLE_BY_TERRAIN_GLYPH = {
  '#': false,
  '~': false,
  '.': true
};

function findPlayer(observation) {
  return observation.entities.find(e => e.role === 'player') || observation.entities[0];
}

function inBounds(observation, x, y) {
  const { viewport, terrainRows } = observation;
  const maxX = viewport.origin.x + viewport.width - 1;
  const maxY = viewport.origin.y + viewport.height - 1;
  if (x < viewport.origin.x || x > maxX || y < viewport.origin.y || y > maxY) return false;
  return terrainRows[y] && typeof terrainRows[y][x] === 'string';
}

function isPassable(observation, x, y) {
  if (!inBounds(observation, x, y)) return false;
  const glyph = observation.terrainRows[y][x];
  return PASSABLE_BY_TERRAIN_GLYPH[glyph] ?? false;
}

function cellHasOtherEntity(observation, x, y, selfId) {
  return observation.entities.some(e => e.id !== selfId && e.x === x && e.y === y);
}

function movePlayer(observation, dx, dy) {
  const player = findPlayer(observation);
  if (!player) return 'No player entity found';
  const targetX = player.x + dx;
  const targetY = player.y + dy;
  if (!inBounds(observation, targetX, targetY)) return 'Blocked (out of bounds)';
  if (!isPassable(observation, targetX, targetY)) return 'Blocked (terrain)';
  if (cellHasOtherEntity(observation, targetX, targetY, player.id)) return 'Blocked (entity present)';
  player.x = targetX;
  player.y = targetY;
  return 'Moved';
}

function printState(observation, message) {
  const { rows, legendLines } = render(observation);
  console.clear();
  console.log(rows.join('\n'));
  console.log('\n' + legendLines.join('\n'));
  if (message) console.log(`\n${message}`);
  console.log('\nControls: arrows to move, q to quit');
}

function start() {
  const observation = loadObservation(inputPath);
  printState(observation, 'Ready');

  readline.emitKeypressEvents(process.stdin);
  if (process.stdin.isTTY) process.stdin.setRawMode(true);

  process.stdin.on('keypress', (str, key) => {
    if (key.sequence === '\u0003' || key.name === 'q') {
      console.log('\nQuit');
      process.exit(0);
    }
    let msg = null;
    switch (key.name) {
      case 'up':
        msg = movePlayer(observation, 0, -1);
        break;
      case 'down':
        msg = movePlayer(observation, 0, 1);
        break;
      case 'left':
        msg = movePlayer(observation, -1, 0);
        break;
      case 'right':
        msg = movePlayer(observation, 1, 0);
        break;
      default:
        return; // ignore other keys
    }
    printState(observation, msg);
  });
}

start();
