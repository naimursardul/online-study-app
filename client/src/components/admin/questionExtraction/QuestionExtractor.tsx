import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, FileQuestion } from "lucide-react";
import { FileUploader } from "./FileUploader";
import { client } from "@/utils/utils";
import { toast } from "sonner";
import MCQCard from "./MCQCard";
import CQCard from "./CQCard";
import GlobalMetadataPanel from "./GlobalMetadataPanel";
import type {
  IBaseQuestion,
  ICQ,
  IExtractionResponse,
  IMCQ,
} from "@/types/types";
import { validateAll } from "@/utils/validateQuestion";
import BulkUploadButton from "./BulkUploadButton";

// -------------------------
// Default meta state
// -------------------------
const defaultMeta: IBaseQuestion = {
  questionType: "MCQ",
  levelId: "",
  backgroundId: [],
  subjectId: "",
  chapterId: "",
  topicId: "",
  record: [],
  recordId: [],
  marks: 0,
  timeRequired: 0,
  difficulty: "Medium",
};

// -------------------------
// Map raw API response → IMCQ | ICQ[]
// -------------------------
function enrichQuestions(
  response: IExtractionResponse,
  meta: IBaseQuestion,
): IMCQ[] | ICQ[] {
  if (response.questionType === "MCQ") {
    return (response.questions as IExtractionResponse["questions"]).map(
      (q) => ({
        ...(q as IMCQ),
        ...meta,
        questionType: "MCQ" as const,
      }),
    );
  }

  return (response.questions as IExtractionResponse["questions"]).map((q) => {
    const cq = q as ICQ;
    return {
      ...cq,
      ...meta,
      questionType: "CQ" as const,
      subQuestions: cq.subQuestions.map((sq) => ({
        ...sq,
        chapterId: meta.chapterId ?? "",
        topicId: meta.topicId ?? "",
      })),
    };
  });
}

// const data = [
//   {
//     statement:
//       "চালানো শুরু করে। 10 মিনিট নদী পার AD বরাবর D বিন্দুতে পৌঁছে। কিন্তু রোহান AD বরাবর $10 \text{ kmh}^{-1}$ বেগে নৌকা চালানো শুরু করে AC বরাবর C বিন্দুতে পৌঁছে।\n" +
//       "[Figure: river diagram with points B, D, C, A and text labels: 4 kmh$^{-1}$ বেগ প্রবাহিত স্রোতের গতি, 8 kmh$^{-1}$ বেগ AB বরাবর নৌকা, A স্রোতের দিক]",
//     subQuestions: [
//       {
//         questionNo: "2",
//         question: "নৌকার বেগ ও স্রোতের বেগের লব্ধি বেগের মান নির্ণয় কর।",
//         answer:
//           "উদ্দীপক থেকে প্রাপ্ত তথ্য অনুযায়ী, স্রোতের বেগ $u = 4 \text{ kmh}^{-1}$ এবং নৌকার বেগ $v = 8 \text{ kmh}^{-1}$। যদি স্রোতের বেগ ও নৌকার বেগের মধ্যবর্তী কোণ $\alpha$ হয় এবং নৌকা AB বরাবর যাত্রা করে AD বরাবর D বিন্দুতে পৌঁছায়, তাহলে স্রোত বরাবর অতিক্রান্ত দূরত্ব শূন্য হবে। এর অর্থ হলো, স্রোত বরাবর নৌকার বেগের উপাংশ $v \cos \alpha$ এর সাথে স্রোতের বেগ $u$ এর যোগফল শূন্য। অর্থাৎ, $(u + v \cos \alpha) \times t = 0$, যা থেকে $\alpha = \cos^{-1} \left( \frac{-u}{v} \right) = \cos^{-1} \left( \frac{-4}{8} \right) = 120^\circ$ পাওয়া যায়।\n" +
//           "নৌকা ও স্রোতের বেগের লব্ধি বেগের মান $R = \sqrt{u^2 + v^2 + 2uv \cos \alpha} = \sqrt{4^2 + 8^2 + 2 \times 4 \times 8 \times \cos(120^\circ)} = \sqrt{16 + 64 + 64 \times (-0.5)} = \sqrt{16 + 64 - 32} = \sqrt{48} = 4\sqrt{3} \text{ kmh}^{-1}$।",
//         chapterId: "",
//         topicId: "",
//       },
//       {
//         questionNo: "3",
//         question:
//           "নদীর প্রস্থ AD ও রোহানের দৈর্ঘ্য বরাবর অতিক্রান্ত দূরত্ব DC সমান হবে কি-না? গাণিতিক বিশ্লেষণপূর্বক মতামত দাও।",
//         answer:
//           "নদীর প্রস্থ AD নির্ণয়ের জন্য, উদ্দীপকের প্রথম অংশ থেকে পাই, সময় $t = 10 \text{ min} = \frac{10}{60} \text{ hr} = \frac{1}{6} \text{ hr}$ এবং নৌকার বেগ $v = 8 \text{ kmh}^{-1}$। (গ) থেকে প্রাপ্ত স্রোত ও নৌকার বেগের মধ্যবর্তী কোণ $\alpha = 120^\circ$।\n" +
//           "নদীর প্রস্থ $AD = t \times v \sin \alpha = \frac{1}{6} \times 8 \times \sin(120^\circ) = \frac{1}{6} \times 8 \times \frac{\sqrt{3}}{2} = \frac{2\sqrt{3}}{3} \text{ km}$।\n" +
//           "\n" +
//           "রোহানের ক্ষেত্রে, তার নৌকার বেগ $v_R = 10 \text{ kmh}^{-1}$ এবং স্রোতের বেগ $u = 4 \text{ kmh}^{-1}$। যদি রোহান নদীর প্রস্থ বরাবর (AD) নৌকা চালায়, তবে স্রোতের সাথে তার নৌকার বেগের কোণ $\theta = 90^\circ$।\n" +
//           "নদীর অপর পাড়ে পৌঁছাতে প্রয়োজনীয় সময় $t' = \frac{AD}{v_R \sin \theta} = \frac{AD}{10 \sin 90^\circ} = \frac{AD}{10}$।\n" +
//           "নদীর দৈর্ঘ্য বরাবর অতিক্রান্ত দূরত্ব (drift) $DC = (u + v_R \cos \theta) \times t' = (4 + 10 \cos 90^\circ) \times t' = (4 + 0) \times t' = 4t'$।\n" +
//           "$DC = 4 \times \frac{AD}{10} = \frac{2AD}{5}$।\n" +
//           "এখন, $AD = \frac{2\sqrt{3}}{3} \text{ km}$ হলে, $DC = \frac{2}{5} \times \frac{2\sqrt{3}}{3} = \frac{4\sqrt{3}}{15} \text{ km}$।\n" +
//           "যেহেতু $AD = \frac{2\sqrt{3}}{3} \text{ km} \approx 1.1547 \text{ km}$ এবং $DC = \frac{4\sqrt{3}}{15} \text{ km} \approx 0.4619 \text{ km}$।\n" +
//           "সুতরাং, নদীর প্রস্থ AD এবং রোহানের দৈর্ঘ্য বরাবর অতিক্রান্ত দূরত্ব DC সমান হবে না।",
//         chapterId: "",
//         topicId: "",
//       },
//     ],
//     questionType: "CQ",
//     levelId: "",
//     backgroundId: [],
//     subjectId: "",
//     chapterId: "",
//     topicId: "",
//     record: [],
//     recordId: [],
//     marks: 0,
//     timeRequired: 0,
//     difficulty: "Medium",
//   },
//   {
//     statement:
//       "AB বরাবর সুজনের নৌকার বেগ = $6 \text{ ms}^{-1}$\n" +
//       "AC বরাবর ফাহাদের নৌকার বেগ = $5.5 \text{ ms}^{-1}$\n" +
//       "CB বরাবর স্রোতের বেগ = $1.2 \text{ ms}^{-1}$\n" +
//       "নদীর প্রস্থ, AB = $400 \text{ m}$\n" +
//       "[Figure: river diagram with points A, B, C and an angle $120^\circ$ at B, between BC and BA]",
//     subQuestions: [
//       {
//         questionNo: "2",
//         question:
//           "সুজন ও ফাহাদের মধ্যে কে অপর পাড়ে পৌঁছাবে? গাণিতিক বিশ্লেষণসহ মতামত দাও।",
//         answer:
//           "উদ্দীপক অনুযায়ী, সুজনের নৌকার বেগ $v_1 = 6 \text{ ms}^{-1}$ এবং স্রোতের সাথে তার নৌকার বেগের মধ্যবর্তী কোণ $\alpha_1 = 90^\circ$। ফাহাদের নৌকার বেগ $v_2 = 5.5 \text{ ms}^{-1}$ এবং স্রোতের সাথে তার নৌকার বেগের মধ্যবর্তী কোণ $\alpha_2 = 120^\circ$। নদীর প্রস্থ $d = AB = 400 \text{ m}$।\n" +
//           "নদীর অপর পাড়ে পৌঁছাতে প্রয়োজনীয় সময় নির্ণয়ের সূত্র হলো $t = \frac{d}{v \sin \alpha}$।\n" +
//           "সুজনের ক্ষেত্রে, $t_1 = \frac{d}{v_1 \sin \alpha_1} = \frac{400}{6 \sin(90^\circ)} = \frac{400}{6 \times 1} = 66.67 \text{ sec}$।\n" +
//           "ফাহাদের ক্ষেত্রে, $t_2 = \frac{d}{v_2 \sin \alpha_2} = \frac{400}{5.5 \sin(120^\circ)} = \frac{400}{5.5 \times 0.866} \approx 83.978 \text{ sec}$।\n" +
//           "যেহেতু $t_1 < t_2$ (অর্থাৎ $66.67 \text{ sec} < 83.978 \text{ sec}$), তাই সুজন ফাহাদের আগে অপর পাড়ে পৌঁছাবে।",
//         chapterId: "",
//         topicId: "",
//       },
//     ],
//     questionType: "CQ",
//     levelId: "",
//     backgroundId: [],
//     subjectId: "",
//     chapterId: "",
//     topicId: "",
//     record: [],
//     recordId: [],
//     marks: 0,
//     timeRequired: 0,
//     difficulty: "Medium",
//   },
//   {
//     statement:
//       "1 km প্রস্থ একটি নদীর তীর বরাবর $4 \text{ ms}^{-1}$ বেগে একটি বাস গতিশীল। নদীর অপর তীর হতে এক ব্যক্তি সোজা সোজাসুজি বাসটিকে দেখতে পেয়ে বাসটি ধরার জন্য স্রোতের সাথে $70^\circ$ কোণে $6 \text{ ms}^{-1}$ বেগে নৌকাযোগে রওনা দিলো। নদীতে স্রোতের বেগ $2 \text{ ms}^{-1}$।",
//     subQuestions: [
//       {
//         questionNo: "2",
//         question: "নৌকার লব্ধি বেগ কত ছিল?",
//         answer: "",
//         chapterId: "",
//         topicId: "",
//       },
//     ],
//     questionType: "CQ",
//     levelId: "",
//     backgroundId: [],
//     subjectId: "",
//     chapterId: "",
//     topicId: "",
//     record: [],
//     recordId: [],
//     marks: 0,
//     timeRequired: 0,
//     difficulty: "Medium",
//   },
// ];

export default function QuestionExtractor() {
  const [files, setFiles] = useState<File[] | null>(null);
  const [questionType, setQuestionType] =
    useState<IBaseQuestion["questionType"]>("MCQ");
  const [extractAll, setExtractAll] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Global metadata state
  const [meta, setMeta] = useState<IBaseQuestion>(defaultMeta);

  // Enriched questions state
  const [questions, setQuestions] = useState<(IMCQ | ICQ)[]>([]);

  // console.log(questions);
  // Extracted question type — drives which card to render
  const [extractedQuestionType, setExtractedQuestionType] =
    useState<IBaseQuestion["questionType"]>("CQ");

  console.log(questions);
  const [uploadLoading, setUploadLoading] = useState(false);
  const validationResults = useMemo(() => validateAll(questions), [questions]);
  const allValid = validationResults?.every((r) => r.valid);

  // -------------------------
  // Propagate global meta changes to all questions
  // -------------------------
  function handleMetaChange(updatedMeta: IBaseQuestion) {
    setMeta(updatedMeta);
    setQuestions((prev) =>
      prev.map((q) => {
        return {
          ...q,
          ...updatedMeta,
          questionType: q.questionType,
          // preserve CQ subQuestions chapter/topic overrides
          ...(q.questionType === "CQ" && {
            subQuestions: (q as ICQ).subQuestions.map((sq) => ({
              ...sq,
              chapterId: updatedMeta.chapterId || sq.chapterId,
              topicId: updatedMeta.topicId || sq.topicId,
            })),
          }),
        } as IMCQ | ICQ;
      }),
    );
  }

  // -------------------------
  // Extract handler
  // -------------------------
  async function handleExtract() {
    if (!files || files.length <= 0) return;

    try {
      setLoading(true);

      const formData = new FormData();

      files.forEach((file) => {
        formData.append("files", file); // same key "files" for each file
      });

      formData.append("questionType", questionType);
      formData.append("extractAll", String(extractAll));

      const res = await client.post("/extraction/extract-questions", formData);

      // console.log(res);
      if (!res.data.success) {
        toast.error(res.data.message || "Failed to extract questions");
        return;
      }

      const response: IExtractionResponse = res.data;
      setExtractedQuestionType(response.questionType);
      setQuestions(enrichQuestions(response, meta));
    } catch (err: any) {
      console.log(err);
      toast.error(err.response?.data?.error || "Failed to extract questions");
    } finally {
      setLoading(false);
    }
  }

  function handleClearMeta() {
    setMeta(defaultMeta);
    setQuestions((prev) =>
      prev.map(
        (q) =>
          ({
            ...q,
            ...defaultMeta,
            questionType: q.questionType,
            ...(q.questionType === "CQ" && {
              statement: (q as ICQ).statement,
              subQuestions: (q as ICQ).subQuestions.map((sq) => ({
                ...sq,
                chapterId: "",
                topicId: "",
              })),
            }),
          }) as IMCQ | ICQ,
      ),
    );
  }

  // -------------------------
  // Build upload payload
  // -------------------------
  function buildPayload(q: IMCQ | ICQ) {
    if (q.questionType === "MCQ") {
      const mcq = q as IMCQ;
      return {
        questionType: "MCQ",
        levelId: mcq.levelId,
        backgroundId: mcq.backgroundId,
        subjectId: mcq.subjectId,
        chapterId: mcq.chapterId,
        topicId: mcq.topicId,
        record: mcq.record,
        recordId: mcq.recordId,
        marks: mcq.marks,
        timeRequired: mcq.timeRequired,
        difficulty: mcq.difficulty,
        question: mcq.question,
        options: mcq.options,
        correctAnswer: mcq.correctAnswer,
        explanation: mcq.explanation,
      };
    }

    const cq = q as ICQ;
    return {
      questionType: "CQ",
      levelId: cq.levelId,
      backgroundId: cq.backgroundId,
      subjectId: cq.subjectId,
      chapterId: cq.chapterId,
      topicId: cq.topicId,
      record: cq.record,
      recordId: cq.recordId,
      marks: cq.marks,
      timeRequired: cq.timeRequired,
      difficulty: cq.difficulty,
      statement: cq.statement,
      subQuestions: cq.subQuestions.map((sq) => ({
        questionNo: sq.questionNo,
        question: sq.question,
        answer: sq.answer,
        chapterId: sq.chapterId,
        topicId: sq.topicId,
      })),
    };
  }

  async function handleBulkUpload() {
    if (!allValid) return;

    try {
      setUploadLoading(true);

      const payload = questions.map(buildPayload);

      const res = await client.post("/question/bulk-create", {
        questions: payload,
      });

      if (!res.data.success) {
        toast.error(res.data.message || "Upload failed.");
        return;
      }

      const { inserted, failed } = res.data;

      if (inserted > 0) {
        toast.success(
          `${inserted} question${inserted > 1 ? "s" : ""} uploaded successfully.`,
        );
      }

      if (failed > 0) {
        toast.warning(
          `${failed} question${failed > 1 ? "s" : ""} failed to upload.`,
        );
      }

      // Clear uploaded questions that succeeded
      if (failed === 0) {
        setQuestions([]);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Bulk upload failed.");
    } finally {
      setUploadLoading(false);
    }
  }

  // const allValid = validationResults.every((r) => r.valid);
  return (
    <div className=" py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <FileQuestion className="text-primary" size={34} />
        <div>
          <h1 className="text-3xl font-bold">Question Extractor</h1>
          <p className="text-muted-foreground">
            Extract MCQ & CQ from images and PDFs
          </p>
        </div>
      </div>
      <GlobalMetadataPanel
        meta={meta}
        setMeta={(updated) => handleMetaChange(updated as IBaseQuestion)}
        onClear={handleClearMeta}
      />
      {/* File + options */}
      <Card className="p-6 space-y-6">
        <FileUploader files={files} setFiles={setFiles} />

        <div className="grid md:grid-cols-2 gap-4">
          <Select
            value={questionType}
            onValueChange={
              setQuestionType as React.Dispatch<React.SetStateAction<string>>
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MCQ">MCQ</SelectItem>
              <SelectItem value="CQ">CQ</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={String(extractAll)}
            onValueChange={(v) => setExtractAll(v === "true")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="false">Single Question</SelectItem>
              <SelectItem value="true">Extract All</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleExtract}
          disabled={!files || (files && files?.length <= 0) || loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Extracting...
            </>
          ) : (
            "Extract Questions"
          )}
        </Button>
      </Card>
      {/* Question cards */}
      {questions.length > 0 && (
        <div className="space-y-6">
          {questions.map((q, i) => {
            return extractedQuestionType === "MCQ" ? (
              <MCQCard
                key={crypto.randomUUID()}
                setQuestions={
                  setQuestions as React.Dispatch<React.SetStateAction<IMCQ[]>>
                }
                index={i}
                question={q as IMCQ}
                validationResult={validationResults[i]}
              />
            ) : (
              <CQCard
                key={crypto.randomUUID()}
                setQuestions={
                  setQuestions as React.Dispatch<React.SetStateAction<ICQ[]>>
                }
                index={i}
                question={q as ICQ}
                validationResult={validationResults[i]}
              />
            );
          })}
        </div>
      )}
      {questions.length > 0 && (
        <BulkUploadButton
          allValid={allValid}
          loading={uploadLoading}
          total={questions.length}
          onUpload={handleBulkUpload}
        />
      )}
    </div>
  );
}
