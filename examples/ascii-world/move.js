#!/usr/bin/env node
// Interactive movement demo for the ASCII world.
// Arrow keys move the player; optional LLM-driven NPC with agency via OpenRouter/OLLAMA.

import path from 'node:path';
import url from 'node:url';
import readline from 'node:readline';
import { loadObservation, render } from './render-lib.js';
import { AsciiLogger } from './logger.js';

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

const NPC_MODE = process.env.NPC_MODE || 'patrol'; // 'patrol' | 'llm' | 'ollama'
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'openrouter/auto';
const OPENROUTER_BASE = process.env.OPENROUTER_BASE || 'https://openrouter.ai/api/v1';
const OPENROUTER_TIMEOUT_MS = Number(process.env.OPENROUTER_TIMEOUT_MS || 10000);

// OLLAMA settings
const OLLAMA_BASE = process.env.OLLAMA_BASE_URL || process.env.OLLAMA_BASE || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'glm-4.7-flash:opencode_slow_max_ctx_thinking';
const OLLAMA_TIMEOUT_MS = Number(process.env.OLLAMA_TIMEOUT_MS || 10000);

// Logging options
const LOG_ENABLED = process.env.LOG_FILE || process.argv.includes('--log-file');
const logger = LOG_ENABLED ? new AsciiLogger() : null;
let tickCounter = 0; // Global tick counter for logging

// NPC Agency Settings
const NPC_GOAL_TYPE = process.env.NPC_GOAL ?? 'protect';
const NPC_GOAL_TARGET = process.env.NPC_GOAL_TARGET ?? 'chest';
const NPC_GOAL_REASONING = process.env.NPC_GOAL_REASONING ?? '';

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

// NPC Memory State
const npcState = {
  npcId: 'npc:guard',
  goal: {
    type: NPC_GOAL_TYPE,
    target: NPC_GOAL_TARGET,
    reasoning: NPC_GOAL_REASONING || getDefaultReasoning(NPC_GOAL_TYPE, NPC_GOAL_TARGET),
    priority: 1
  },
  memory: {
    seen: [],
    attempts: [],
    blockedCount: 0
  },
  currentIntent: 'patrolling'
};

function getDefaultReasoning(goalType, target) {
  const reasoningMap = {
    protect: `Protecting ${target} from unauthorized access`,
    gather: `Collecting needed items: ${target}`,
    patrol: `Patrolling the area and maintaining security`
  };
  return reasoningMap[goalType] || `Working on ${goalType} - ${target}`;
}

function addObservation(observation, npcId) {
  const npc = observation.entities.find(e => e.id === npcId);
  if (!npc) return;

  const snapshot = {
    turn: Date.now(),
    location: `(${npc.x},${npc.y})`,
    visibleEntities: observation.entities.map(e => e.id).filter(id => id !== npcId),
    nearbyObjects: observation.objects.map(o => `${o.type} at (${o.x},${o.y})`).slice(0, 5),
    nearbyEntities: observation.entities
      .filter(e => e.role !== 'player' && e.id !== npcId)
      .map(e => `${e.id} at (${e.x},${e.y})`)
  };

  npcState.memory.seen.push(snapshot);
}

function addAttempt(action, result, reason) {
  npcState.memory.attempts.push({
    turn: Date.now(),
    action: action,
    result: result,
    reason: reason
  });
}

function getObservationHistory(n = 3) {
  const start = Math.max(0, npcState.memory.seen.length - n);
  return npcState.memory.seen.slice(start);
}

function getRecentAttempts(n = 3) {
  const start = Math.max(0, npcState.memory.attempts.length - n);
  return npcState.memory.attempts.slice(start);
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
  if (NPC_MODE === 'llm' && OPENROUTER_API_KEY) {
    console.log(`NPC mode: llm (OpenRouter)`);
  } else if (NPC_MODE === 'ollama' && OLLAMA_BASE) {
    console.log(`NPC mode: ollama (${OLLAMA_BASE}, model: ${OLLAMA_MODEL})`);
  } else {
    console.log(`NPC mode: patrol`);
  }
  if (npcState.goal && npcState.goal.type) {
    console.log(`\nNPC Goal: ${npcState.goal.type} - ${npcState.goal.target}`);
    if (npcState.goal.reasoning) {
      console.log(`  Reasoning: ${npcState.goal.reasoning}`);
    }
  }
  console.log(`Intent: I am ${npcState.currentIntent}`);
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

  tickCounter++;

  addObservation(observation, npcId);
  const correlationId = logger ? logger.setCorrelation(`npc-${npc.id}-tick${tickCounter}`) : null;
  logger?.actionProposed(npc.id, 'llm-decision', null, npcState.currentIntent, tickCounter);

  const startTime = Date.now();

  const rows = observation.terrainRows.map((row, y) => {
    const chars = row.split('');
    for (const obj of observation.objects || []) {
      if (obj.y === y) chars[obj.x] = chars[obj.x];
    }
    for (const ent of observation.entities || []) {
      if (ent.y === y) chars[ent.x] = ent.id === npc.id ? 'N' : ent.id === player.id ? 'P' : 'E';
    }
    return chars.join('');
  });

  const history = getObservationHistory(3);
  const recentAttempts = getRecentAttempts(3);

  const historyLines = history.map(obs => `Turn ${Math.floor(obs.turn/1000)}: I was at ${obs.location} and saw: ${obs.visibleEntities.join(',')}.`).join('\n');
  const attemptsLines = recentAttempts.map(att => `Turn ${Math.floor(att.turn/1000)}: ${att.action} → ${att.result} (${att.reason}).`).join('\n');

  const prompt = `You are an autonomous NPC with a goal to achieve.

YOUR GOAL: ${npcState.goal.type} ${npcState.goal.target}
${npcState.goal.reasoning ? `Reasoning: ${npcState.goal.reasoning}` : ''}

YOUR CURRENT LOCATION: (${npc.x},${npc.y})

RECENT HISTORY:
${historyLines}

RECENT ATTEMPTS:
${attemptsLines}

I am currently ${npcState.currentIntent}.

Capabilities:
- You can move north/south/east/west, stay in place, or attempt dialogue
- Obstacles: walls (#), water (~), impassable terrain
- Actions must be validated: you cannot walk into blocked cells

Action space:
- move: north, south, east, west, or stay
- talk: only if adjacent to player (N/S/E/W or same cell)

Your task: Pick ONE action that makes progress toward your goal. Consider obstacles and past attempts.

Respond ONLY with JSON: {"action":"move|stay|talk","direction":"north|south|east|west" (when move),"intent":"briefly explain what you aim for","note":"why this action makes sense given obstacles and your goal"}.

Grid (N=row0):
${rows.join('\n')}
You (NPC) at (${npc.x},${npc.y}). Player at (${player.x},${player.y}). Adjacent is manhattan distance 1 or same cell.`;

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
          { role: 'system', content: 'You are an autonomous NPC. You have a goal and use memory. You explain your intent. Output JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 120
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!res.ok) return { action: 'fallback', reason: `HTTP ${res.status}` };
    const correlationId = logger ? logger.setCorrelation(`npc-${npc.id}-tick${tickCounter}`) : null;
    const modelName = typeof OPENROUTER_MODEL === 'string' ? OPENROUTER_MODEL : 'openrouter/auto';
    const elapsed = Date.now() - startTime;
    const data = await res.json();
    logger?.backendDecision(correlationId,  'openrouter',  modelName,  plan.action,  plan.intent, tickCounter);
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
    const elapsed = Date.now() - startTime;
    const modelName = typeof OPENROUTER_MODEL === 'string' ? OPENROUTER_MODEL : 'openrouter/auto';
    const fallbackAction = npcState.goal.type === 'patrol' ? { action: 'patrol' } : null;
    logger?.timeout(npc.id, 'openrouter', modelName, OPENROUTER_TIMEOUT_MS, elapsed, fallbackAction, tickCounter);
    logger?.error(npc.id, e.name === 'AbortError' ? 'TIMEOUT' : 'API_ERROR', e.message, { correlationId }, tickCounter);
    return { action: 'fallback', reason: e.name === 'AbortError' ? 'Timeout' : 'Error' };
  }
}

async function planNPCWithOLLAMA(observation) {
  const npc = findNPC(observation);
  const player = findPlayer(observation);
  if (!npc || !player) return { action: 'fallback', reason: 'No NPC or player' };

  tickCounter++;
  const correlationId = logger ? logger.setCorrelation(`npc-${npc.id}-tick${tickCounter}`) : null;
  logger?.actionProposed(npc.id, 'ollama-decision', null, npcState.currentIntent, tickCounter);

  const startTime = Date.now();

  const rows = observation.terrainRows.map((row, y) => {
    const chars = row.split('');
    for (const obj of observation.objects || []) {
      if (obj.y === y) chars[obj.x] = chars[obj.x];
    }
    for (const ent of observation.entities || []) {
      if (ent.y === y) chars[ent.x] = ent.id === npc.id ? 'N' : ent.id === player.id ? 'P' : 'E';
    }
    return chars.join('');
  });

  const history = getObservationHistory(3);
  const recentAttempts = getRecentAttempts(3);

  const historyLines = history.map(obs => `Turn ${Math.floor(obs.turn/1000)}: I was at ${obs.location} and saw: ${obs.visibleEntities.join(',')}.`).join('\n');
  const attemptsLines = recentAttempts.map(att => `Turn ${Math.floor(att.turn/1000)}: ${att.action} → ${att.result} (${att.reason}).`).join('\n');

  const prompt = `You are an autonomous NPC with a goal to achieve.

YOUR GOAL: ${npcState.goal.type} ${npcState.goal.target}
${npcState.goal.reasoning ? `Reasoning: ${npcState.goal.reasoning}` : ''}

YOUR CURRENT LOCATION: (${npc.x},${npc.y})

RECENT HISTORY:
${historyLines}

RECENT ATTEMPTS:
${attemptsLines}

I am currently ${npcState.currentIntent}.

Capabilities:
- You can move north/south/east/west, stay in place, or attempt dialogue
- Obstacles: walls (#), water (~), impassable terrain
- Actions must be validated: you cannot walk into blocked cells

Action space:
- move: north, south, east, west, or stay
- talk: only if adjacent to player (N/S/E/W or same cell)

Your task: Pick ONE action that makes progress toward your goal. Consider obstacles and past attempts.

Respond ONLY with JSON: {"action":"move|stay|talk","direction":"north|south|east|west" (when move),"intent":"briefly explain what you aim for","note":"why this action makes sense given obstacles and your goal"}.

Grid (N=row0):
${rows.join('\n')}
You (NPC) at (${npc.x},${npc.y}). Player at (${player.x},${player.y}). Adjacent is manhattan distance 1 or same cell.`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OPENROUTER_TIMEOUT_MS);
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.2,
          num_predict: 120
        }
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!res.ok) return { action: 'fallback', reason: `HTTP ${res.status}` };
    const correlationId = logger ? logger.setCorrelation(`npc-${npc.id}-tick${tickCounter}`) : null;
    const modelName = typeof OLLAMA_MODEL === 'string' ? OLLAMA_MODEL : 'glm-4.7-flash:opencode_slow_max_ctx_thinking';
    const elapsed = Date.now() - startTime;
    const data = await res.json();
    logger?.backendDecision(correlationId,  'ollama',  modelName,  plan.action,  plan.intent, tickCounter);
    const text = data.response?.trim();
    if (!text) return { action: 'fallback', reason: 'No response' };
    let parsed = null;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      return { action: 'fallback', reason: 'Parse error' };
    }
    return parsed;
  } catch (e) {
    clearTimeout(timeout);
    const elapsed = Date.now() - startTime;
    const modelName = typeof OLLAMA_MODEL === 'string' ? OLLAMA_MODEL : 'glm-4.7-flash:opencode_slow_max_ctx_thinking';
    const fallbackAction = npcState.goal.type === 'patrol' ? { action: 'patrol' } : null;
    logger?.timeout(npc.id, 'ollama', OLLAMA_MODEL, OLLAMA_TIMEOUT_MS, elapsed, fallbackAction, tickCounter);
    logger?.error(npc.id, e.name === 'AbortError' ? 'TIMEOUT' : 'API_ERROR', e.message, { correlationId }, tickCounter);
    return { action: 'fallback', reason: e.name === 'AbortError' ? 'Timeout' : 'Error' };
  }
}

function performNPCAction(observation, action) {
  const npc = findNPC(observation);
  if (!npc) return 'No NPC found';
  if (!action || typeof action !== 'object') return 'NPC action invalid';
  const kind = action.action;
  let result = '';
  if (kind === 'move') {
    const dir = DIRS[action.direction];
    if (!dir) return 'NPC move invalid direction';
    result = moveEntity(observation, npc, dir.dx, dir.dy);
  } else if (kind === 'talk') {
    result = attemptDialogueNPC(observation);
  } else if (kind === 'stay') {
    result = 'NPC stayed';
  } else {
    return 'NPC action ignored';
  }
  return result;
}

async function stepNPC(observation, npcStepIdx) {
  tickCounter++;
  const correlationId = logger ? logger.setCorrelation(`npc-${npc.id}-tick${tickCounter}`) : null;

  if (npcState.goal.type === 'patrol' || !OPENROUTER_API_KEY) {
    logger?.actionProposed(npc.id, 'patrol', null, 'following patrol route', tickCounter);
    return patrolNPC(observation, npcStepIdx);
  }
  if (npcState.goal.type === 'ollama' && OLLAMA_BASE) {
    const plan = await planNPCWithOLLAMA(observation);
    logger?.actionValidated(npc.id, plan.action, plan.direction || 'stay', 'accepted', 'LLM plan validated', tickCounter);
    if (plan.action === 'fallback') {
      return patrolNPC(observation, npcStepIdx) + ` (fallback: ${plan.reason})`;
    }
    const res = performNPCAction(observation, plan);
    if (res.includes('Blocked')) {
      addAttempt(`move ${plan.direction || 'stay'}`, res, 'goal blocked, adapting');
      return `NPC action (${plan.action}${plan.direction ? ' ' + plan.direction : ''}): ${res} (note: ${plan.note || 'moving toward goal'})`;
    }
    logger?.actionExecuted(npc.id, plan.action, plan.direction || 'stay', res, plan.intent || 'moving toward goal', tickCounter);
    return `NPC action (${plan.action}${plan.direction ? ' ' + plan.direction : ''}): ${res} (intent: ${plan.intent || 'moving toward goal'})`;
  }
  if (NPC_MODE !== 'llm') {
    return patrolNPC(observation, npcStepIdx);
  }
  const plan = await planNPCWithLLM(observation);
  logger?.actionValidated(npc.id, plan.action, plan.direction || 'stay', 'accepted', 'LLM plan validated', tickCounter);
  if (plan.action === 'fallback') {
    return patrolNPC(observation, npcStepIdx) + ` (fallback: ${plan.reason})`;
  }
  const res = performNPCAction(observation, plan);
  if (res.includes('Blocked')) {
    addAttempt(`move ${plan.direction || 'stay'}`, res, 'goal blocked, adapting');
    return `NPC action (${plan.action}${plan.direction ? ' ' + plan.direction : ''}): ${res} (note: ${plan.note || 'moving toward goal'})`;
  }
  logger?.actionExecuted(npc.id, plan.action, plan.direction || 'stay', res, plan.intent || 'moving toward goal', tickCounter);
  return `NPC action (${plan.action}${plan.direction ? ' ' + plan.direction : ''}): ${res} (intent: ${plan.intent || 'moving toward goal'})`;
}

async function inspect(observation) {
  const player = findPlayer(observation);
  if (!player) return ['No player entity found'];
  const lines = ['Player at:', `Coordinates: (${player.x}, ${player.y})`];
  const nearby = describeCell(observation, player.x, player.y);
  if (nearby.length > 0) {
    lines.push('Around player:');
    for (const desc of nearby) {
      lines.push(`  - ${desc}`);
    }
  } else {
    lines.push('Empty cell (no terrain, objects, or entities)');
  }
  return lines;
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
        acted = true;
        break;
      case 'space':
        msg = attemptDialoguePlayer(observation);
        acted = true;
        tickCounter++;
        const dialogueCorrId = logger ? logger.setCorrelation(`player-player-tick${tickCounter}`) : null;
        logger?.dialogueAttempt('player', npc.id, 'hello', 'accepted', null, tickCounter);
        break;
      default:
        return;
    }
    let npcMsg = null;
    if (acted) {
      npcMsg = await stepNPC(observation, npcStepIdx);
    }
    printState(observation, msg || npcMsg, extra.concat(npcMsg && msg !== npcMsg ? [npcMsg] : []));
  });
}

start();