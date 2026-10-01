import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanQuestion } from '../src/services/studyService.js';
import { hashPassword } from '../src/services/studentService.js';
import { analyzeResume } from '../src/services/resumeService.js';

test('cleanQuestion removes parenthetical text and trims whitespace', () => {
  const dirty = "What is recursion (in computer science)?  ";
  const cleaned = cleanQuestion(dirty);
  assert.equal(cleaned, "What is recursion?");
});

test('hashPassword produces deterministic SHA-256 hex string', async () => {
  const hash1 = await hashPassword("SecretP@ssword2026");
  const hash2 = await hashPassword("SecretP@ssword2026");
  const hashDiff = await hashPassword("DifferentPassword");

  assert.ok(hash1.length === 64, "SHA-256 hash must be 64 hex chars");
  assert.equal(hash1, hash2, "Identical passwords must produce identical hashes");
  assert.notEqual(hash1, hashDiff, "Different passwords must produce different hashes");
});

test('analyzeResume returns scored ATS report with recommendations', async () => {
  const sampleResume = "Software Engineer experienced in React, Node.js, AWS, and Docker.";
  const result = await analyzeResume(sampleResume, "Cloud & DevOps Solutions Architect");

  assert.ok(result.atsScore >= 0 && result.atsScore <= 100, "ATS score must be between 0 and 100");
  assert.ok(Array.isArray(result.matchedKeywords), "matchedKeywords must be an array");
  assert.ok(Array.isArray(result.recommendations), "recommendations must be an array");
});
