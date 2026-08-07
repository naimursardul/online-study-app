import { z } from "zod";
import { objectId, objectIdList, safeSearch } from "./common";

const name = z.string().trim().min(1).max(200);

// The update controllers pass their whole body to findByIdAndUpdate, so these
// schemas double as the field whitelist — anything not listed is stripped.
const updateBody = <T extends z.ZodRawShape>(shape: T) =>
  z.object({
    params: z.object({ id: objectId }),
    body: z.object(shape).partial().strict(),
  });

export const backgroundUpdateSchema = updateBody({
  name,
  levelId: objectId,
});

export const levelUpdateSchema = updateBody({
  name,
  details: z.string().trim().min(1).max(1000),
});

export const recordUpdateSchema = updateBody({
  recordType: z.string().trim().min(1).max(100),
  institution: z.string().trim().min(1).max(200),
  year: z.string().trim().min(1).max(20),
});

export const subjectUpdateSchema = updateBody({
  name,
  levelId: objectId,
  backgroundId: objectIdList,
});

export const chapterUpdateSchema = updateBody({
  name,
  levelId: objectId,
  backgroundId: objectIdList,
  subjectId: objectId,
});

export const topicUpdateSchema = updateBody({
  name,
  levelId: objectId,
  backgroundId: objectIdList,
  subjectId: objectId,
  chapterId: objectId,
});

// Search params feed a $regex; bounding them stops operator objects and
// catastrophic-backtracking patterns.
const listQuery = <T extends z.ZodRawShape>(shape: T) =>
  z.object({ query: z.object(shape).partial() });

export const backgroundListSchema = listQuery({
  levelId: objectId,
  search: safeSearch,
});

export const levelListSchema = listQuery({ search: safeSearch });

export const subjectListSchema = listQuery({
  levelId: objectId,
  backgroundId: objectIdList,
  search: safeSearch,
});

export const chapterListSchema = listQuery({
  levelId: objectId,
  backgroundId: objectIdList,
  subjectId: objectId,
  search: safeSearch,
});

export const topicListSchema = listQuery({
  levelId: objectId,
  backgroundId: objectIdList,
  subjectId: objectId,
  chapterId: objectId,
  search: safeSearch,
});

export const recordListSchema = listQuery({
  recordType: z.string().trim().min(1).max(100),
  institution: z.string().trim().min(1).max(200),
  year: z.string().trim().min(1).max(20),
});
