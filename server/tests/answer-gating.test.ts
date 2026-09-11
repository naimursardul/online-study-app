import { describe, expect, it } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { getApp } from "./app";
import { createUser, sessionCookie } from "./factories";

/**
 * A5.5 — the public question API must not hand out the answer key. Anonymous
 * callers get the question, options and metadata; the answer fields are
 * projected out at the query so they never leave Mongo. A logged-in user
 * (any role — the bank is the signup funnel, not an admin surface) still
 * sees them.
 */

// A minimal but schema-valid question, with a levelId the list endpoint can
// filter on. The ids are plain strings in the schema, so arbitrary ObjectIds
// work without creating taxonomy rows.
async function createQuestion(type: "MCQ" | "SQ" | "CQ") {
  const { questionModels } = await import("../src/models/question-model");
  const oid = () => String(new mongoose.Types.ObjectId());
  const base = {
    backgroundId: [oid()],
    levelId: oid(),
    subjectId: oid(),
    chapterId: oid(),
    topicId: oid(),
    recordId: [oid()],
    marks: 1,
    timeRequired: 1,
    difficulty: "Easy" as const,
  };

  if (type === "SQ") {
    const doc = await questionModels.SQ.create({
      ...base,
      questionType: "SQ",
      question: "Name the largest planet.",
      answer: "Jupiter.",
    });
    return { id: String(doc._id), levelId: base.levelId };
  }

  if (type === "CQ") {
    const doc = await questionModels.CQ.create({
      ...base,
      questionType: "CQ",
      statement: "Answer the following parts.",
      subQuestions: [1, 2, 3, 4].map((n) => ({
        questionNo: String(n),
        question: `Part ${n}?`,
        answer: `Answer ${n}.`,
        chapterId: base.chapterId,
        topicId: base.topicId,
      })),
    });
    return { id: String(doc._id), levelId: base.levelId };
  }

  const doc = await questionModels.MCQ.create({
    ...base,
    questionType: "MCQ",
    question: "What is 2+2?",
    options: ["3", "4", "5", "6"],
    correctAnswer: "1",
    explanation: "Basic arithmetic.",
  });
  return { id: String(doc._id), levelId: base.levelId };
}

describe("answer gating", () => {
  it("anonymous GET /question/:id omits every answer field", async () => {
    const app = await getApp();

    for (const type of ["MCQ", "SQ", "CQ"] as const) {
      const q = await createQuestion(type);
      const res = await request(app).get(`/question/${q.id}`);
      expect(res.status, type).toBe(200);
      expect(res.body.success, type).toBe(true);

      // The question itself is public — only the answers are gated.
      expect(res.body.data.questionType).toBe(type);

      // mcq: correctAnswer/explanation; simple: answer; cq: subQuestions[].answer
      expect(res.body.data, type).not.toHaveProperty("correctAnswer");
      expect(res.body.data, type).not.toHaveProperty("explanation");
      expect(res.body.data, type).not.toHaveProperty("answer");
      const subQuestions = res.body.data.subQuestions;
      if (Array.isArray(subQuestions)) {
        for (const sq of subQuestions) {
          expect(sq, type).not.toHaveProperty("answer");
          expect(sq.question, type).toBeTypeOf("string");
        }
      }
    }
  });

  it("a logged-in user still gets the answers", async () => {
    const app = await getApp();
    const user = await createUser();
    const cookie = await sessionCookie(user.id);
    const q = await createQuestion("MCQ");

    const res = await request(app).get(`/question/${q.id}`).set("Cookie", cookie);
    expect(res.status).toBe(200);
    expect(res.body.data.correctAnswer).toBe("1");
    expect(res.body.data.explanation).toBe("Basic arithmetic.");
  });

  it("anonymous GET /question/ (the list) omits answers too — the list is the other bypass", async () => {
    const app = await getApp();
    const q = await createQuestion("MCQ");

    const res = await request(app).get(
      `/question?questionType=MCQ&levelId=${q.levelId}`,
    );
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    for (const item of res.body.data) {
      expect(item).not.toHaveProperty("correctAnswer");
      expect(item).not.toHaveProperty("explanation");
    }

    // …and the same filter, authenticated, still carries them.
    const user = await createUser();
    const cookie = await sessionCookie(user.id);
    const authed = await request(app)
      .get(`/question?questionType=MCQ&levelId=${q.levelId}`)
      .set("Cookie", cookie);
    expect(authed.status).toBe(200);
    expect(authed.body.data.length).toBe(res.body.data.length);
    for (const item of authed.body.data) {
      expect(item).toHaveProperty("correctAnswer");
    }
  });
});
