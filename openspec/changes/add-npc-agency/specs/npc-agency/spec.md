## ADDED Requirements

### Requirement: NPCs have identifiable goals
The system SHALL enable NPCs to have designer-defined goals that guide their behavior, providing a basis for autonomous action selection.

#### Scenario: Goal configuration via environment
- **GIVEN** a designer wants a guard NPC to protect a specific location
- **WHEN** the `NPC_GOAL` and `NPC_GOAL_TARGET` environment variables are set to "protect" and "chest" respectively
- **THEN** the NPC's prompt includes the goal description with the specific target
- **AND** the LLM decisions are informed to take actions toward that goal

#### Scenario: Goal reasoning is seeded by designers
- **GIVEN** a designer has configured `NPC_GOAL_REASONING` as "Prevent theft from the valuable chest"
- **WHEN** the NPC is presented with the goal
- **THEN** the LLM decisions include reasoning about why the goal matters
- **AND** the NPC's actions are consistent with that purpose

### Requirement: NPCs maintain short-term memory
The system SHALL enable NPCs to remember recent observations and actions, providing context for decision-making across time steps.

#### Scenario: Observation history tracking
- **GIVEN** an NPC takes multiple actions in succession
- **WHEN** the NPC makes its next decision
- **THEN** the LLM prompt includes observations from the last N turns
- **AND** the NPC can reference what it has seen (e.g., "The player is at (2,5), I was at (5,5)")

#### Scenario: Attempt history tracking
- **GIVEN** an NPC tried to move and was blocked by a wall
- **WHEN** the NPC makes another decision
- **THEN** the LLM prompt includes the failed attempt
- **AND** the NPC avoids repeating the same futile action

### Requirement: NPCs reason about their actions
The system SHALL enable NPCs to explain their intent and the reasoning behind their actions, demonstrating agency rather than random decision-making.

#### Scenario: Intent field in LLM response
- **GIVEN** an LLM generates a response for an NPC action
- **WHEN** the response is parsed
- **THEN** the response includes an `intent` field (e.g., "Getting closer to the chest")
- **AND** this intent is displayed to the player for transparency

#### Scenario: Note field for reasoning
- **GIVEN** an LLM response includes a `note` field explaining the action
- **WHEN** the NPC executes the action
- **THEN** the action message includes the explanatory note
- **AND** the player understands why the NPC chose that action

### Requirement: NPCs plan for multiple steps
The system SHALL enable NPCs to consider more than the immediate next action when making decisions.

#### Scenario: Three-to-five step planning request
- **GIVEN** the LLM is prompted for NPC decision-making
- **WHEN** the prompt includes instructions for multi-step planning
- **THEN** the LLM output includes intent and note fields that reflect consideration of near-term future
- **AND** the NPC's visible behavior shows consistent progress toward goals

### Requirement: NPCs adapt when goals are blocked
The system SHALL enable NPCs to gracefully handle situations where their goals cannot be immediately achieved, switching to adaptive fallback behaviors.

#### Scenario: Blocked-goal detection
- **GIVEN** an NPC's current plan repeatedly fails (e.g., blocked path, target unreachable)
- **WHEN** the failure occurs beyond a threshold (e.g., 3 consecutive blocked attempts)
- **THEN** the NPC switches to an exploration/adaptive mode
- **AND** the NPC tries alternative directions or actions to make progress

#### Scenario: Adaptive wandering
- **GIVEN** an NPC is in blocked-goal mode with no clear alternative
- **WHEN** the NPC needs to act
- **THEN** the NPC selects wandering directions through adaptive selection
- **AND** this behavior continues until an unblocked path or new goal emerges

### Requirement: Agent state is visible in display
The system SHALL make the NPC's internal state (goal, current intent) visible to the player, enabling trust and understanding of NPC behavior.

#### Scenario: Display goal and intent
- **GIVEN** an NPC with a goal and intent is visible on the grid
- **WHEN** the world is rendered
- **THEN** the display includes the goal description (e.g., "Goal: Protect the chest")
- **AND** shows the current intent (e.g., "I am: Guarding the area")

#### Scenario: Intent precedes action message
- **GIVEN** an NPC takes an action (e.g., moves west)
- **WHEN** the action completes
- **THEN** the system outputs the action followed by its intent (e.g., "Moved west to get closer to target")
- **AND** the player understands the NPC's purpose behind the action

### Requirement: Backward compatibility with patrol mode
The system SHALL maintain existing patrol behavior for NPCs when `NPC_MODE=patrol`, ensuring stability for unchanged configurations.

#### Scenario: Patrol mode unchanged
- **GIVEN** `NPC_MODE=patrol` is set
- **WHEN** the demo runs without goal configuration
- **THEN** the NPC uses existing patrol behavior without goal or memory
- **AND** no errors are thrown from missing configuration

### Requirement: World validation remains authoritative
The system SHALL ensure that all NPC actions continue to pass through the same validation as player actions, maintaining world-state as the single source of truth.

#### Scenario: LLM output is advisory only
- **GIVEN** an LLM generates an action for an NPC
- **WHEN** the action is executed
- **THEN** the action validates against world-state rules (bounds, passability, adjacency)
- **AND** invalid recommendations from the LLM are ignored
- **AND** the response clearly shows the validation result

#### Scenario: Validated action succeeds or fails with reason
- **GIVEN** an LLM recommends a move that passes validation
- **WHEN** the action executes
- **THEN** the action succeeds and the new position is rendered
- **GIVEN** an LLM recommends a move that fails validation
- **WHEN** the action executes
- **THEN** the action fails and the failure reason is logged (e.g., "Blocked by wall")