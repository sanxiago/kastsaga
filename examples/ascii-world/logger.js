#!/usr/bin/env node
// Structured logging utilities for ASCII world demo
// Meets the logging spec requirements:
// - Structured JSON log entries
// - Correlation IDs for traceability
// - Backend information
// - Action proposals and validations
// - Timeout and error logging
// - Dialogue guardrail decisions
// - Redaction/no-leakage rules

class AsciiLogger {
  constructor(options = {}) {
    this.writeLog = options.write || (str => console.log(str));
    this.playerFacing = options.playerFacing !== false;
    this.correlationId = options.correlationId || this.generateCorrelationId();
  }

  generateCorrelationId() {
    return `cnt-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  setCorrelation(correlationId) {
    this.correlationId = correlationId;
    return this;
  }

  // Action proposal before planning
  actionProposed(actorId, actionType, direction = null, intent = null, tick = null) {
    const entry = {
      timestamp: Date.now(),
      tick: tick,
      event: 'action.proposed',
      correlationId: this.correlationId,
      actor: actorId,
      actionType: actionType,
      direction: direction,
      intent: intent,
      backend: null,
      backendStatus: null
    };
    this.log(entry);
  }

  // Action validation result
  actionValidated(actorId, actionType, direction, validity, reason, tick = null) {
    const entry = {
      timestamp: Date.now(),
      tick: tick,
      event: 'action.validated',
      correlationId: this.correlationId,
      actor: actorId,
      actionType: actionType,
      direction: direction,
      validity: validity, // 'accepted' or 'rejected'
      reason: reason,
      backend: null
    };
    this.log(entry);
  }

  // Action execution result
  actionExecuted(actorId, actionType, direction, result, note = null, tick = null) {
    const entry = {
      timestamp: Date.now(),
      tick: tick,
      event: 'action.executed',
      correlationId: this.correlationId,
      actor: actorId,
      actionType: actionType,
      direction: direction,
      result: result,
      intent: note,
      backend: null
    };
    this.log(entry);
  }

  // Backend decision result
  backendDecision(correlationId, backend, model, action, reasoning, errorMessage = null, tick = null) {
    const entry = {
      timestamp: Date.now(),
      tick: tick,
      event: 'backend.decision',
      correlationId: correlationId,
      backend: backend,
      model: model,
      action: action,
      reasoning: reasoning,
      error: errorMessage
    };
    this.log(entry);
  }

  // Timeout occurred
  timeout(actorId, backend, model, budgetMs, elapsedMs, fallbackAction, tick = null) {
    const entry = {
      timestamp: Date.now(),
      tick: tick,
      event: 'timeout',
      correlationId: this.correlationId,
      actor: actorId,
      backend: backend,
      model: model,
      budgetMs: budgetMs,
      elapsedMs: elapsedMs,
      fallbackAction: fallbackAction
    };
    this.log(entry);
  }

  // Error occurred
  error(actorId, errorType, errorMessage, context = null, tick = null) {
    const entry = {
      timestamp: Date.now(),
      tick: tick,
      event: 'error',
      correlationId: this.correlationId,
      actor: actorId,
      errorType: errorType,
      errorMessage: errorMessage,
      ...context
    };
    this.log(entry);
  }

  // Dialogue attempt (may be guardrail-rejected)
  dialogueAttempt(speakerId, listenerId, utterance, guardrailResult, guardrailRule = null, tick = null) {
    const entry = {
      timestamp: Date.now(),
      tick: tick,
      event: 'dialogue.attempt',
      correlationId: this.correlationId,
      speaker: speakerId,
      listener: listenerId,
      utterance: utterance, // May be redacted if player-facing
      guardrailResult: guardrailResult, // 'accepted', 'rejected', or 'modified'
      guardrailRule: guardrailRule
    };
    this.log(entry);
  }

  // Redaction event (if sensitive data needs to be redacted)
  redaction(correlationId, originalLocation, redactedField, reason, tick = null) {
    const entry = {
      timestamp: Date.now(),
      tick: tick,
      event: 'redaction',
      correlationId: correlationId,
      originalLocation: originalLocation,
      redactedField: redactedField,
      redactedValue: '[REDACTED]', // Always redacted
      reason: reason
    };
    this.log(entry);
  }

  // New correlation session
  newSession(correlationId) {
    return new AsciiLogger({ ...this, correlationId: correlationId });
  }

  write(entry) {
    const entryStr = JSON.stringify(entry);
    this.writeLog(entryStr);
  }

  log(entry) {
    entry.correlationId = this.correlationId;
    this.write(entry);
  }

  // Print session summary
  summary() {
    console.log(`\n[LOGGER SESSION SUMMARY - ${this.correlationId}]\n`);
  }
}

// File-based logger for persistent logging
class FileLogger {
  constructor(filePath) {
    this.filePath = filePath;
    this.logger = new AsciiLogger({
      write: str => {
        const stream = require('fs').createWriteStream(filePath, { flags: 'a' });
        stream.write(str + '\n');
        stream.end();
      }
    });
  }

  getLogger() {
    return this.logger;
  }

  getCorrelationId() {
    return this.logger.correlationId;
  }
}

module.exports = {
  AsciiLogger,
  FileLogger
};