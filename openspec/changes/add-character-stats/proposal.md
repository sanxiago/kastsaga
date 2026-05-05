# Proposal: Add Character Stats System

## Summary
- Implement a unified character stats system tracking HP (health), hunger, energy, and self preservation across all characters.
- Stats decay over time and can be replenished through actions (eating, resting).
- Low stats damage the character (starvation, exhaustion) and trigger behavior overrides.
- Self preservation dynamically increases as HP decreases, prioritizing survival over mission objectives.
- Provide UI visualization and logging integration for all stats changes.

## Motivation
- Characters need consistent survival mechanics for gameplay depth and challenge.
- HP management creates meaningful decisions (prioritize combat vs. rest vs. food).
- Hunger and energy add resource-management gameplay without complex mechanics.
- Self preservation AI behavior makes NPCs feel more alive and reactive to danger.
- Unified stats system enables player progress tracking and NPC differentiation.

## Scope
- Data structures and interfaces for character stats (HP, hunger, energy, self preservation).
- Stat decay and regeneration systems with configurable rates.
- Energy exhaustion mechanics preventing vigorous actions when depleted.
- Starvation mechanics damaging HP over time.
- Self preservation calculation and decision override logic.
- UI components for stat display (bars, meters, warnings).
- Logging integration for stat changes with correlation IDs.
- NPC AI modifications to consider stats in decision-making (food-seeking, retreat, mission-pausing).
- No engine selection, networking, or persistent storage implementation.

## Non-goals
- Combat system mechanics (damage calculation, weapon types, attack types).
- Role-based ability systems (proficiencies, specialization mechanics).
- Inventory/loot systems for food items and healing potions.
- Multiplayer character syncing for stats.
- Skill-based stat scaling (leveling, XP, character development).

## Success criteria
- Core requirements (HP, hunger, energy, self preservation) implemented and logged.
- Stats decay and regeneration systems functional across character types.
- Self preservation correctly increases as HP decreases and overrides NPC plans.
- Energy exhaustion prevents vigorous actions; starvation damages HP when untreated.
- UI displays all four stats with appropriate feedback (color coding, warnings).
- Log entries include `tick` field for correlation tracing.
- NPCs prioritize food when hungry and retreat from danger when self preservation triggers.