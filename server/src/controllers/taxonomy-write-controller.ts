/*
 * Title: Taxonomy Write Handlers
 * Description: update / delete / impact for all five taxonomy kinds. One
 *              implementation parameterised by kind, because the propagation and
 *              cascade rules are identical and a preview that disagreed with its
 *              own delete would be worse than no preview at all. The five
 *              taxonomy controllers re-export these under their own names, so the
 *              routes are unchanged.
 * Author: Naimur Rahman
 * Date: 2026-08-17
 */

import { Request, Response } from "express";
import mongoose from "mongoose";
import {
  cascadeDelete,
  collectImpact,
  deriveAncestors,
  ImpactReport,
  IntegrityError,
  isReparent,
  resyncSubtree,
  SyncReport,
  TaxonomyKind,
  taxonomyModel,
} from "../services/taxonomy-integrity.service";

const LABEL: Record<TaxonomyKind, string> = {
  level: "Level",
  background: "Background",
  subject: "Subject",
  chapter: "Chapter",
  topic: "Topic",
};

// The parents each kind resolves in its responses, mirroring the populate chains
// the read handlers already use.
const POPULATE: Record<TaxonomyKind, string[]> = {
  level: [],
  background: ["levelId"],
  subject: ["levelId", "backgroundId"],
  chapter: ["levelId", "backgroundId", "subjectId"],
  topic: ["levelId", "backgroundId", "subjectId", "chapterId"],
};

const populated = (kind: TaxonomyKind, id: string) =>
  POPULATE[kind].reduce(
    (query, path) => query.populate(path, "name"),
    taxonomyModel(kind).findById(id),
  );

// IntegrityError carries the status the caller should see (404 for a missing
// parent, 409 for a move that cannot be made coherent); anything else is a bug.
const fail = (res: Response, error: unknown) => {
  if (error instanceof IntegrityError) {
    res.status(error.status).json({
      success: false,
      message: error.message,
      details: error.details,
      data: null,
    });
    return;
  }
  console.error(error);
  res
    .status(500)
    .json({ success: false, message: "Server error.", data: null });
};

const notFound = (res: Response, kind: TaxonomyKind) => {
  res
    .status(404)
    .json({ success: false, message: `${LABEL[kind]} not found.`, data: null });
};

const plural = (count: number, one: string) =>
  `${count} ${count === 1 ? one : `${one}s`}`;

// "Topic deleted. Also removed 42 questions, 18 saved questions."
const deleteMessage = (kind: TaxonomyKind, report: ImpactReport) => {
  const removed: string[] = [];
  const add = (count: number, one: string) => {
    if (count) removed.push(plural(count, one));
  };
  add(report.descendants.backgrounds, "background");
  add(report.descendants.subjects, "subject");
  add(report.descendants.chapters, "chapter");
  add(report.descendants.topics, "topic");
  add(report.questions, "question");
  add(report.savedQuestions, "saved question");

  const head = `${LABEL[kind]} deleted.`;
  const body = removed.length
    ? ` Also removed ${removed.join(", ")}.`
    : " Nothing else referenced it.";

  const exams = report.generatedExams;
  const tail =
    exams.pruned || exams.deleted
      ? ` ${plural(exams.pruned + exams.deleted, "unfinished exam")} adjusted.`
      : "";

  return head + body + tail;
};

// PUT /:id — a rename skips the subtree walk; a re-parent derives the doc's
// ancestors from its new parent and pushes them down, all in one transaction.
export const updateTaxonomy =
  (kind: TaxonomyKind) => async (req: Request, res: Response) => {
    const { id } = req.params;
    const body = (req.body ?? {}) as Record<string, unknown>;
    try {
      if (!isReparent(kind, body)) {
        const updated = await taxonomyModel(kind).findByIdAndUpdate(id, body, {
          new: true,
          runValidators: true,
        });
        if (!updated) return notFound(res, kind);

        res.status(200).json({
          success: true,
          message: `${LABEL[kind]} updated successfully.`,
          data: await populated(kind, id),
        });
        return;
      }

      const session = await mongoose.startSession();
      let synced: SyncReport | undefined;
      try {
        await session.withTransaction(async () => {
          const current = await taxonomyModel(kind)
            .findById(id)
            .session(session)
            .lean();
          if (!current)
            throw new IntegrityError(404, `${LABEL[kind]} not found.`);

          // The body's own values for ancestor fields are deliberately overwritten:
          // a topic cannot sit under a chapter of some other subject.
          const ancestors = await deriveAncestors(kind, body, current);
          await taxonomyModel(kind).findByIdAndUpdate(
            id,
            { ...body, ...ancestors },
            { runValidators: true, session },
          );
          synced = await resyncSubtree(kind, id, session);
        });
      } finally {
        await session.endSession();
      }

      res.status(200).json({
        success: true,
        message: `${LABEL[kind]} updated successfully.`,
        data: await populated(kind, id),
        synced,
      });
    } catch (error) {
      fail(res, error);
    }
  };

// DELETE /:id — counts the subtree and removes it in the same transaction, so the
// numbers reported back are the numbers that were written.
export const deleteTaxonomy =
  (kind: TaxonomyKind) => async (req: Request, res: Response) => {
    const { id } = req.params;
    const session = await mongoose.startSession();

    try {
      let report: ImpactReport | undefined;
      await session.withTransaction(async () => {
        report = await cascadeDelete(kind, id, session);
      });

      res.status(200).json({
        success: true,
        message: deleteMessage(kind, report!),
        data: report,
      });
    } catch (error) {
      fail(res, error);
    } finally {
      await session.endSession();
    }
  };

// GET /:id/impact — the same walk, read-only, for the confirm dialog.
export const impactTaxonomy =
  (kind: TaxonomyKind) => async (req: Request, res: Response) => {
    try {
      const { report } = await collectImpact(kind, req.params.id);
      res.status(200).json({
        success: true,
        message: "Impact calculated.",
        data: report,
      });
    } catch (error) {
      fail(res, error);
    }
  };
