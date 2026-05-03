#!/usr/bin/env node
// Interactive movement demo for the ASCII world.
// Arrow keys move the player; optional LLM-driven NPC via OpenRouter.

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

const NPC_PATROL = [
  { dx: 1, dy: 0 },
  { dx: 0, dy: -1 },
  { dx: -1, dy: 0 },
  { dx: 0, dy: 1 }
];

const NPC_MODE = process.env.NPC_MODE || 'patrol'; // 'patrol' | 'llm'
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'openrouter/auto';
const OPENROUTER_BASE = process.env.OPENROUTER_BASE || 'https://openrouter.ai/api/v1';
const OPENROUTER_TIMEOUT_MS = Number(process.env.OPENROUTER_TIMEOUT_MS || 10000);

function findPlayer(observation) {
  return observation.entities.find(e => e.role === 'player') || observation.entities[0];
}

function findNPC(observation, id = 'npc:guard') {
  return observation.entities.find(e => e.id === id);
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

function moveEntity(observation, ent, dx, dy) {
  const targetX = ent.x + dx;
  const targetY = ent.y + dy;
  if (!inBounds(observation, targetX, targetY)) return 'Blocked (out of bounds)';
  if (!isPassable(observation, targetX, targetY)) return 'Blocked (terrain)';
  if (cellHasOtherEntity(observation, targetX, targetY, ent.id)) return 'Blocked (entity present)';
  ent.x = targetX;
  ent.y = targetY;
  return 'Moved';
}

function adjacent(a, b) {
  const dx = Math.abs(a.x - b.x);
  const dy = Math.abs(a.y - b.y);
  return (dx + dy === 1) || (dx === 0 && dy === 0);
}

function describeCell(observation, x, y) {
  const { descriptions = {}, objects = [], entities = [] } = observation;
  const out = [];
  if (!inBounds(observation, x, y)) return out;
  const terrainGlyph = observation.terrainRows[y][x];
  const terrainDesc = descriptions.terrain?.[terrainGlyph];
  if (terrainDesc) out.push(`Terrain: ${terrainDesc}`);
  for (const obj of objects.filter(o => o.x === x && o.y === y)) {
    out.push(`Object: ${obj.description || descriptions.objects?.[obj.type] || obj.type}`);
  }
  for (const ent of entities.filter(e => e.x === x && e.y === y)) {
    out.push(`Entity: ${ent.description || descriptions.entities?.[ent.role] || ent.id}`);
  }
  return out;
}

function inspect(observation) {
  const player = findPlayer(observation);
  if (!player) return ['No player entity found'];
  const coords = [
    { x: player.x, y: player.y, label: 'Here' },
    { x: player.x + 1, y: player.y, label: 'East' },
    { x: player.x - 1, y: player.y, label: 'West' },
    { x: player.x, y: player.y - 1, label: 'North' },
    { x: player.x, y: player.y + 1, label: 'South' }
  ];
  const lines = [];
  for (const c of coords) {
    const descs = describeCell(observation, c.x, c.y);
    if (descs.length) {
      lines.push(`${c.label}:`);
      lines.push(...descs.map(d => `  ${d}`));
    }
  }
  if (!lines.length) lines.push('Nothing notable nearby.');
  return lines;
}

function attemptDialogue(observation, speaker, listener) {
  if (!speaker || !listener) return 'Dialogue failed: missing actor';
  if (!adjacent(speaker, listener)) return 'Dialogue failed: not adjacent';
  return `Dialogue initiated between ${speaker.id} and ${listener.id}.`;
}

function attemptDialoguePlayer(observation) {
  const player = findPlayer(observation);
  const npc = findNPC(observation);
  return attemptDialogue(observation, player, npc);
}

function attemptDialogueNPC(observation) {
  const player = findPlayer(observation);
  const npc = findNPC(observation);
  return attemptDialogue(observation, npc, player);
}

function printState(observation, message, extraLines = []) {
  const { rows, legendLines } = render(observation);
  console.clear();
  console.log(rows.join('\n'));
  console.log('\n' + legendLines.join('\n'));
  if (message) console.log(`\n${message}`);
  for (const line of extraLines) console.log(line);
  console.log('\nControls: arrows move, i inspect, space talk (adjacent), q quit');
  console.log(`NPC mode: ${NPC_MODE}${NPC_MODE === 'llm' && !OPENROUTER_API_KEY ? ' (no API key; falling back to patrol)' : ''}`);
}

function patrolNPC(observation, stepIdxRef) {
  const guard = findNPC(observation);
  if (!guard) return 'No NPC found';
  const step = NPC_PATROL[stepIdxRef.value % NPC_PATROL.length];
  const res = moveEntity(observation, guard, step.dx, step.dy);
  if (res === 'Moved') stepIdxRef.value++;
  return res;
}

const DIRS = {
  north: { dx: 0, dy: -1 },
  south: { dx: 0, dy: 1 },
  west: { dx: -1, dy: 0 },
  east: { dx: 1, dy: 0 }
};

async function planNPCWithLLM(observation) {
  if (!OPENROUTER_API_KEY) return { action: 'fallback', reason: 'No API key' };
  const npc = findNPC(observation);
  const player = findPlayer(observation);
  if (!npc || !player) return { action: 'fallback', reason: 'No NPC or player' };

  const rows = observation.terrainRows.map((row, y) => {
    const chars = row.split('');
    for (const obj of observation.objects || []) {
      if (obj.y === y) chars[obj.x] = chars[obj.x]; // keep terrain, descriptions are separate
    }
    for (const ent of observation.entities || []) {
      if (ent.y === y) chars[ent.x] = ent.id === npc.id ? 'N' : ent.id === player.id ? 'P' : 'E';
    }
    return chars.join('');
  });

  const prompt = `You control an NPC in a tiny grid. Stay within bounds and avoid walls (#) and water (~). Action space:\n` +
    `- move: north, south, east, west, or stay.\n` +
    `- talk: only if adjacent to player (N/S/E/W or same cell).\n` +
    `Pick ONE action. Respond ONLY with JSON: {"action":"move|stay|talk","direction":"north|south|east|west" (when move)}.\n` +
    `Grid (N=row0):\n${rows.join('\n')}\n` +
    `You (NPC) at (${npc.x},${npc.y}). Player at (${player.x},${player.y}). Adjacent is manhattan distance 1 or same cell.\n`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OPENROUTER_TIMEOUT_MS);
  try {
    const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://example.com',
        'X-Title': 'ascii-world-demo'
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          { role: 'system', content: 'You control movement of an NPC in a small grid world. Obey walls/bounds. Use the provided JSON schema.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 60
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!res.ok) return { action: 'fallback', reason: `HTTP ${res.status}` };
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) return { action: 'fallback', reason: 'No content' };
    let parsed = null;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      return { action: 'fallback', reason: 'Parse error' };
    }
    return parsed;
  } catch (e) {
    clearTimeout(timeout);
    return { action: 'fallback', reason: e.name === 'AbortError' ? 'Timeout' : 'Error' };
  }
}

function performNPCAction(observation, action) {
  const npc = findNPC(observation);
  if (!npc) return 'No NPC found';
  if (!action || typeof action !== 'object') return 'NPC action invalid';
  const kind = action.action;
  if (kind === 'move') {
    const dir = DIRS[action.direction];
    if (!dir) return 'NPC move invalid direction';
    return moveEntity(observation, npc, dir.dx, dir.dy);
  }
  if (kind === 'talk') {
    return attemptDialogueNPC(observation);
  }
  if (kind === 'stay') {
    return 'NPC stayed';
  }
  return 'NPC action ignored';
}

async function stepNPC(observation, npcStepIdx) {
  if (NPC_MODE !== 'llm') {
    return patrolNPC(observation, npcStepIdx);
  }
  if (!OPENROUTER_API_KEY) {
    return patrolNPC(observation, npcStepIdx);
  }
  const plan = await planNPCWithLLM(observation);
  if (plan.action === 'fallback') {
    return patrolNPC(observation, npcStepIdx) + ` (fallback: ${plan.reason})`;
  }
  const res = performNPCAction(observation, plan);
  return `NPC action (${plan.action}${plan.direction ? ' ' + plan.direction : ''}): ${res}`;
}

async function start() {
  const observation = loadObservation(inputPath);
  const npcStepIdx = { value: 0 };
  printState(observation, 'Ready');

  readline.emitKeypressEvents(process.stdin);
  if (process.stdin.isTTY) process.stdin.setRawMode(true);

  process.stdin.on('keypress', async (str, key) => {
    if (key.sequence === '\u0003' || key.name === 'q') {
      console.log('\nQuit');
      process.exit(0);
    }
    let msg = null;
    let extra = [];
    let acted = false;
    const player = findPlayer(observation);
    switch (key.name) {
      case 'up':
        msg = player ? moveEntity(observation, player, 0, -1) : 'No player entity found';
        acted = true;
        break;
      case 'down':
        msg = player ? moveEntity(observation, player, 0, 1) : 'No player entity found';
        acted = true;
        break;
      case 'left':
        msg = player ? moveEntity(observation, player, -1, 0) : 'No player entity found';
        acted = true;
        break;
      case 'right':
        msg = player ? moveEntity(observation, player, 1, 0) : 'No player entity found';
        acted = true;
        break;
      case 'i':
        msg = 'Inspect nearby:';
        extra = inspect(observation);
        acted = true; // advance NPC to keep cadence simple
        break;
      case 'space':
        msg = attemptDialoguePlayer(observation);
        acted = true;
        break;
      default:
        return; // ignore other keys
    }
    let npcMsg = null;
    if (acted) {
      npcMsg = await stepNPC(observation, npcStepIdx);
    }
    printState(observation, msg || npcMsg, extra.concat(npcMsg && msg !== npcMsg ? [npcMsg] : []));
  });
}

start();
