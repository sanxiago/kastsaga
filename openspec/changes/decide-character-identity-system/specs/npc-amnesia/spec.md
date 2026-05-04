## ADDED Requirements

### Requirement: NPCs can enter different states of memory loss with varying severity
The system SHALL enable four amnesia types: full_amnesia, selective_amnesia, transient_amnesia, and identity_crisis, each affecting NPCs differently.

**Acceptance Criteria**:
- Four amnesia types: full_amnesia, selective_amnesia, transient_amnesia, identity_crisis
- NPCs have `amnesiaState` field marking type and severity
- Amnesia triggered by: magical events, trauma, game mechanics (potion, artifact)

#### Scenario: Full amnesia loses all long-term memory
- **GIVEN** an NPC with long-term memory containing 50 events
- **WHEN** full_amnesia state is triggered
- **THEN** long-term memory is cleared to empty array
- **AND** immutables remain: name, role, core_identity

#### Scenario: Transient amnesia recovers over time
- **GIVEN** an NPC in transient_amnesia state (recovers in 100 ticks)
- **WHEN** 100 ticks pass
- **THEN** npc.amnesiaState = null and long-term memory is restored

### Requirement: NPCs recovering from amnesia use immutable traits and ally help to rebuild identity
The system SHALL enable amnesiac NPCs to use immutable identity and social support to reconstruct their context after memory loss.

**Acceptance Criteria**:
- `recoverFromAmnesia(npc, knowledgeBase, allies)` function rebuilds context
- Uses immutable traits: name, species, role, core identity for baseline
- Asks allies (NPCs who interacted before amnesia) for help
- Allies provide: shared relevant traits, recounted events
- Recovery can be gradual (ticks) vs instant (if configured)
- Progress shown with visual indicator on screen

#### Scenario: Ally helps recover role identity
- **GIVEN** an NPC "Alaric" with role = "guard" and coreIdentity = ["protector"]
- **GIVEN** ally "Gareth" who says "Alaric, you were meant to protect this village"
- **WHEN** Alaric recovers from amnesia
- **THEN** newContext.role = "guard" and newContext.core_identity = ["protector"]
- **AND** Alaric acts as protector despite lost memory

### Requirement: NPCs can recognize other NPCs' amnesia state and react appropriately
The system SHALL enable NPCs to recognize amnesiac NPCs of other entities and respond with help, protection, skepticism, or caution.

**Acceptance Criteria**:
- NPCs have awareness of `otherNPC.amnesiac` state
- NPCs respond differently to amnesiacs:
  - **Help**: Offer explanations of who they are
  - **Protect**: Guard them from dangers
  - **Skeptic**: Question if they are truly who they say
  - **Stranger**: Act with caution until trust is established
- Responses influence trait changes (trust, familiarity)

#### Scenario: Altruistic response to amnesiac ally
- **GIVEN** an NPC "Gareth" with high trust in ally "Alaric"
- **GIVEN** ally "Alaric" enters full_amnesia state
- **WHEN** Gareth encounters amnesiac Alaric
- **THEN** Gareth helps Alaric recover by saying: "You're Alaric, the protector"
- **AND** Gareth.trust.increase_by(5)

### Requirement: NPCs with identity crisis use role archetype to guide behavior
The system SHALL enable NPCs with amnesia to fall back on role archetype and core identity to determine their actions.

**Acceptance Criteria**:
- `identityCrisisBehavior()` function uses role archetype and core identity
- Examples:
  - **Guard**: "I protect, so I must protect the chest"
  - **Merchant**: "I trade, so I check for valuable goods"
  - **Scholar**: "I learn, so I observe the world"
- Reasoning is simpler: role-based responses instead of memory-informed
- Trust in role archetype drives behavior

#### Scenario: Guard identity crisis protects target
- **GIVEN** an NPC "Alaric" with role = "guard", identity = ["protector"]
- **GIVEN** Alaric's memory is cleared
- **WHEN** Alaric reasons about what to do
- **THEN** Alaric's plan includes: protecting the chest
- **AND** Because role archetype says "protector acts to protect"