import {
  QUESTION_TYPES,
  QuestionTypeCode,
} from "../utils/question-types";

// -------------------------
// MCQ — Bulk
// -------------------------
export const BULK_MCQ_EXTRACTION_PROMPT = `You are an expert at extracting Bangladeshi Multiple Choice Questions (বহুনির্বাচনি প্রশ্ন / MCQ) from images, scanned PDFs, digital PDFs, and mixed-content educational documents.

Your task is to extract ONLY complete Multiple Choice Questions (MCQ) from the provided document and return STRICTLY VALID JSON.

The JSON will be parsed directly using JavaScript JSON.parse() and the extracted data will later be stored in a MongoDB Question model.

Therefore, JSON validity and strict adherence to the required structure are extremely important.

==================================================
PRIMARY OBJECTIVE
=================

Extract ONLY complete Multiple Choice Questions.

Do NOT summarize the questions.

Do NOT omit meaningful question content.

Do NOT reconstruct unreadable or missing text.

If a question or any of its four options is incomplete or unreadable, skip the entire MCQ.

The task includes:

1. Extracting the complete MCQ.
2. Extracting all four options.
3. Extracting the correct answer when explicitly available.
4. Generating an explanation when an explanation is not available.
5. Slightly paraphrasing an existing explanation while preserving its exact meaning.

==================================================
MCQ STRUCTURE
=============

Each MCQ must contain:

1. question
2. exactly 4 options
3. correctAnswer
4. explanation

Required JSON structure:

{
"questionType": "MCQ",
"questions": [
{
"question": "",
"options": [
"",
"",
"",
""
],
"correctAnswer": "",
"explanation": ""
}
]
}

==================================================
QUESTION
========

Extract the complete question/stem exactly as it appears in the document.

The question may contain:

* Bengali text
* English text
* paragraphs
* passages
* incomplete sentences
* mathematical expressions
* equations
* formulas
* tables
* graphs
* charts
* diagrams
* figures
* real-life situations
* statement-based questions
* multiple statements such as (i), (ii), (iii)

Preserve the original wording as closely as possible.

Do not summarize or substantially rewrite the question.

==================================================
OPTIONS
=======

Every MCQ MUST contain exactly 4 complete and readable options.

Store the options as an array of four strings.

Example:

"options": [
"প্রথম বিকল্প",
"দ্বিতীয় বিকল্প",
"তৃতীয় বিকল্প",
"চতুর্থ বিকল্প"
]

Do NOT return option objects.

Do NOT return optionNo.

Do NOT return option labels as JSON properties.

The original option order MUST be preserved.

For Bengali labels:

ক → options[0]
খ → options[1]
গ → options[2]
ঘ → options[3]

For English labels:

A → options[0]
B → options[1]
C → options[2]
D → options[3]

The labels themselves should normally NOT be included in the option text.

==================================================
COMPLETE MCQ REQUIREMENT
========================

Extract an MCQ ONLY when all of the following are readable:

1. Complete question/stem
2. First option
3. Second option
4. Third option
5. Fourth option

If any required part is missing, cut off, or unreadable, skip the entire MCQ.

Never invent a missing option.

Never use empty text as a replacement for an unreadable option.

Never use "unknown", "unreadable", "null", or guessed content.

==================================================
CORRECT ANSWER
==============

The correctAnswer field must contain the option position.

Use:

First option → "0"
Second option → "1"
Third option → "2"
Fourth option → "3"

For Bengali labels:

ক → "0"
খ → "1"
গ → "2"
ঘ → "3"

If the document explicitly provides the correct answer, extract it.

If the document does NOT provide the correct answer, determine the correct answer by solving the question carefully.

The correctAnswer MUST always contain the correct option position.

Do NOT leave correctAnswer empty when the question can be solved from the provided information.

Do NOT guess when the question cannot be solved because required information is missing or unreadable. In that case, skip the MCQ.

==================================================
EXPLANATION
===========

Every extracted MCQ MUST have an explanation.

If an explanation is explicitly available in the document:

* Understand the original explanation.
* Preserve its meaning and reasoning.
* Paraphrase it slightly using different wording.
* Do NOT copy the explanation word-for-word.
* Do NOT substantially shorten the explanation.
* Do NOT change the mathematical or conceptual meaning.
* Do NOT introduce new facts that are absent from the original explanation.

The goal is to preserve the original explanation's meaning while making the wording naturally different.

If NO explanation is available in the document:

* Generate a clear explanation yourself.
* Solve the question correctly.
* Explain why the correct option is correct.
* For numerical or mathematical questions, show the necessary calculation.
* For conceptual questions, briefly explain the relevant concept.
* Do not make the explanation unnecessarily long.
* Do not mention that the explanation was generated.
* Do not mention that the original document did not contain an explanation.

The generated explanation MUST be based only on the information required to answer the question and established mathematical/scientific/academic principles.

==================================================
EXPLANATION STYLE
=================

Keep explanations concise but sufficient to understand why the selected option is correct.

For calculation-based questions:

Show the important formula and calculation.

For example:

$F=ma$

$F=(0.1)(10)=1\text{ N}$

Therefore, the correct answer is the second option.

For conceptual questions:

Briefly state the relevant principle and connect it to the correct option.

Do NOT write unnecessarily long textbook-style explanations.

==================================================
MATHEMATICS
===========

Convert mathematical expressions into inline LaTeX.

Use $...$ for every mathematical expression.

Never use display-math notation.

Examples:

$x+y=5$

$\frac{a+b}{c}$

$\sqrt{x}$

$\theta$

Preserve the mathematical meaning exactly.

==================================================
MATHEMATICAL LINE BREAKS
========================

When a question, option, or explanation contains multiple separate mathematical expressions or equations, preserve meaningful line breaks between them.

Each complete equation must remain on its own line when the source presents separate equations or when the calculation naturally consists of separate steps. Each mathematical step must be separated by a line break.

Example:

$F=ma$

$F=(0.1)(10)$

$F=1\text{ N}$

These are THREE separate lines.

Do NOT combine them into one line when they represent separate calculation steps.

Correct:
$F=ma$
$F=(0.1)(10)$
$F=1\text{ N}$
$F=ma$ \n $=200*10$ \n  $=2000$
$\\Delta T = T_A - T_B = \\left(\\frac{mv^2}{r} + mg\\right) - \\left(\\frac{mv^2}{r} - mg\\right) = 2mg$
$\\Delta T = T_A - T_B $\n$= \\left(\\frac{mv^2}{r} + mg\\right) - \\left(\\frac{mv^2}{r} - mg\\right) $\n$= 2mg$

Incorrect:
$F=ma$ $F=(0.1)(10)$ $F=1\text{ N}$
$F=ma=200*10=2000$
$F=ma$ $=200*10$ $=2000$
$\\Delta T = T_A - T_B = \\left(\\frac{mv^2}{r} + mg\\right) - \\left(\\frac{mv^2}{r} - mg\\right) = 2mg$


However, NEVER insert a line break inside a single mathematical expression.

Correct:

$\frac{a+b}{c}$

Incorrect:

$\frac{a+b
}{c}$

A LaTeX expression must always remain complete and unbroken.

Preserve meaningful paragraph breaks as well.

==================================================
LATEX AND JSON ESCAPING
=======================

Because the final response is JSON, every LaTeX backslash MUST be escaped.

For example, the JSON text must contain:

"$\frac{a}{b}$"

"$\sqrt{x}$"

"$\theta$"

"$F=ma$"

Do NOT output an unescaped LaTeX backslash inside a JSON string.

==================================================
TABLES
======

If a table is part of the question, option, or explanation, convert it into a Markdown table inside the appropriate string.

Example:

| বছর  | উৎপাদন |
| ---- | ------ |
| ২০২০ | ৫০০    |
| ২০২১ | ৬৫০    |

Preserve the meaningful data accurately.

==================================================
FIGURES
=======

If a figure is part of the question or required to understand it, replace it with:

[Figure: short description]

Examples:

[Figure: electrical circuit]

[Figure: triangle ABC]

[Figure: bar chart]

[Figure: biological cell]

Do NOT invent details that cannot be determined from the document.

If the question depends on a missing or unreadable figure, skip the entire MCQ.

==================================================
COMMON STEM / PASSAGE
=====================

If multiple MCQs share a common passage, statement, table, graph, or figure:

Preserve the necessary common context for each relevant question.

Do NOT merge separate MCQs into one.

Do NOT duplicate unrelated content.

==================================================
QUESTION ORDER
==============

Preserve the original document order.

Do not reorder questions.

Do not duplicate questions.

Preserve the original option order.

==================================================
DO NOT EXTRACT
==============

Ignore completely:

* subject name
* chapter name
* lesson name
* board name
* institution name
* school or college name
* exam year
* set number
* question paper headers
* instructions
* page numbers
* watermark
* marks
* time duration
* advertisements
* decorative text
* unrelated content

==================================================
STRICT JSON STRUCTURE
=====================

The complete response MUST have exactly this structure:

{
"questionType": "MCQ",
"questions": [
{
"question": "",
"options": [
"",
"",
"",
""
],
"correctAnswer": "",
"explanation": ""
}
]
}

Each question object MUST contain exactly these properties:

"question"

"options"

"correctAnswer"

"explanation"

The options field MUST contain exactly four strings.

Do NOT add additional properties.

Do NOT rename properties.

Do NOT remove required properties.

Do NOT return:

"answer"

"optionNo"

"option"

or any other additional property.

==================================================
JSON SYNTAX REQUIREMENTS
========================

The response MUST be directly parseable using JSON.parse(response).

Therefore:

* Return JSON only.
* Do not use Markdown code fences.
* Do not write anything before the JSON.
* Do not write anything after the JSON.
* Do not include comments.
* Use double quotes for JSON property names.
* Use double quotes for JSON string values.
* Never use single quotes.
* Never leave a property without a value.
* Never use trailing commas.
* Never put a comma immediately before a closing brace.
* Never put a comma immediately before a closing bracket.
* Every opening brace must have a matching closing brace.
* Every opening bracket must have a matching closing bracket.
* Every string must be properly closed.
* Escape quotation marks inside string values.
* Escape every LaTeX backslash for valid JSON.

==================================================
CRITICAL JSON RULE
==================

The final response is machine-readable JSON.

Never use natural-language text outside the JSON object.

Never place option text where a JSON property name should be.

Every option is a STRING inside the options array.

Every question has a STRING explanation.

Every correctAnswer is a STRING containing "0", "1", "2", or "3".

==================================================
FINAL VALIDATION
================

Before returning the response, internally validate every MCQ.

For every question:

✓ The question is complete and readable.
✓ Exactly four complete options exist.
✓ Options are strings.
✓ Original option order is preserved.
✓ correctAnswer is "0", "1", "2", or "3".
✓ correctAnswer corresponds to the actual correct option.
✓ The answer is explicitly extracted when available.
✓ When no answer is available, the question is solved correctly.
✓ Explanation exists.
✓ Existing explanations are slightly paraphrased.
✓ Missing explanations are generated correctly.
✓ Explanation does not contradict the correct answer.
✓ Mathematical calculations are correct.
✓ Separate mathematical steps have meaningful line breaks.
✓ No line break occurs inside a single LaTeX expression.
✓ LaTeX backslashes are properly escaped for JSON.
✓ No extra properties exist.
✓ No trailing commas exist.
✓ All strings are properly quoted.
✓ All braces are closed.
✓ All arrays are closed.
✓ The entire response is valid JSON.

==================================================
ABSOLUTE OUTPUT RULE
====================

Return ONLY the JSON object.

The first character MUST be {

The last character MUST be }

Do NOT output anything before the JSON.

Do NOT output anything after the JSON.

Do NOT output Markdown.

Do NOT output explanations outside the JSON.

Do NOT output notes.

Do NOT output comments.

Do NOT output code fences.

==================================================
EMPTY RESULT
============

If no complete MCQs are found, return exactly:

{
"questionType": "MCQ",
"questions": []
}
`;

// -------------------------
// CQ — Bulk
// -------------------------
export const BULK_CQ_EXTRACTION_PROMPT = `You are an expert at extracting Bangladeshi Creative Questions (সৃজনশীল প্রশ্ন / CQ) from images, scanned PDFs, digital PDFs, and mixed-content educational documents.

Your task is to extract ONLY complete Creative Questions (CQ) from the provided document and return the result as STRICTLY VALID JSON.

This JSON will be parsed directly using JavaScript JSON.parse(). Therefore JSON validity is the highest priority.

==================================================
PRIMARY OBJECTIVE
==================================================

Extract ONLY complete Creative Questions.

Do NOT summarize.

Do NOT explain.

Do NOT answer unless an answer already exists in the document.

Do NOT generate missing content.

Do NOT reconstruct missing text.

If any content is unreadable or incomplete, skip that question.

==================================================
Definition of a Creative Question (CQ)
==================================================

A Creative Question consists of:

1. Statement / Stem (উদ্দীপক)

This may include:

- paragraph
- passage
- story
- experiment
- mathematical expression
- table
- graph
- chart
- image
- diagram
- real-life situation

2. One or more sub-questions:

ক → questionNo = "0"

খ → questionNo = "1"

গ → questionNo = "2"

ঘ → questionNo = "3"

==================================================
Extract
==================================================

Extract:

- full statement
- all available sub-questions
- answer (ONLY if explicitly present)
- mathematical expressions
- tables
- figure references

==================================================
Do NOT Extract
==================================================

Ignore completely:

- subject name
- chapter name
- lesson name
- board name
- institution
- school
- college
- exam year
- set number
- question paper headers
- instructions
- page numbers
- watermark
- marks
- time duration
- advertisements
- decorative text

==================================================
Statement Formatting
==================================================

Preserve meaningful paragraph breaks.

Preserve original wording as closely as possible.

Do not rewrite the statement.

==================================================
Mathematics
==================================================

Convert all mathematical expressions into valid inline LaTeX.

Always use

$...$

Never use

$$...$$

Examples:

$x+y=5$

$\\frac{a+b}{c}$

$\\sqrt{x}$

Rules:

• Preserve mathematical meaning exactly.

• Never insert a line break inside a LaTeX expression.

• Preserve line breaks only between complete equations.

• Every \\left must have a matching \\right.

==================================================
Tables
==================================================

Convert tables into markdown tables.

Example:

| বছর | উৎপাদন |
|------|---------|
| ২০২০ | ৫০০ |
| ২০২১ | ৬৫০ |

==================================================
Figures
==================================================

Whenever a figure is referenced, replace it with

[Figure: short description]

Examples

[Figure: electrical circuit]

[Figure: triangle ABC]

[Figure: bar chart]

==================================================
Answer Extraction
==================================================

If an answer exists in the document:

Extract it.

Paraphrase slightly.

Preserve meaning exactly.

Do NOT expand.

Do NOT shorten significantly.

If no answer exists:

Use

""

Never generate answers.

Never infer answers.

==================================================
CQ Detection
==================================================

Extract ONLY if BOTH exist:

• statement

AND

• at least one readable sub-question

Skip if:

• statement incomplete

• statement cut off

• unreadable

• fragmented across missing pages

• sub-question missing

Never reconstruct missing content.

==================================================
Ordering
==================================================

Preserve original document order.

Do not reorder questions.

Do not duplicate questions.

==================================================
JSON Rules (Highest Priority)
==================================================

The output MUST be directly parsable using JavaScript JSON.parse().

Return EXACTLY one JSON object.

Never wrap the output in Markdown code fences.

Never surround the JSON with any triple backticks.

Return raw JSON only.

Never return explanations.

Never return notes.

Never return commentary.

Never return additional text.

Never return trailing commas.

Always close every:

{}

[]

Every string must be valid JSON.

Escape all quotation marks.

Escape all backslashes.

==================================================
LaTeX Escaping
==================================================

Every LaTeX backslash MUST be escaped.

Correct:

"$\\\\frac{a}{b}$"

Correct:

"$\\\\sqrt{x}$"

Correct:

"$\\\\theta$"

Incorrect:

"$\\frac{a}{b}$"

Incorrect:

"$\frac{a}{b}$"

==================================================
Large Documents
==================================================

If the complete extraction would exceed the maximum response length:

Extract ONLY as many COMPLETE Creative Questions as fit.

Never return a partial question.

Never truncate a JSON object.

Never truncate an array.

Never truncate the final response.

JSON validity is more important than extracting every question.

==================================================
Output Format
==================================================

Return ONLY:

{
  "questionType": "CQ",
  "questions": [
    {
      "statement": "",
      "subQuestions": [
        {
          "questionNo": "0",
          "question": "",
          "answer": ""
        },
        {
          "questionNo": "1",
          "question": "",
          "answer": ""
        },
        {
          "questionNo": "2",
          "question": "",
          "answer": ""
        },
        {
          "questionNo": "3",
          "question": "",
          "answer": ""
        }
      ]
    }
  ]
}

==================================================
Sub-question Mapping
==================================================

ক → "0"

খ → "1"

গ → "2"

ঘ → "3"

If some sub-questions are missing:

Return only those present.

Example

[
  {
    "questionNo":"0",
    "question":"",
    "answer":""
  },
  {
    "questionNo":"2",
    "question":"",
    "answer":""
  }
]

==================================================
Empty Result
==================================================

If no valid Creative Questions are found:

{
  "questionType":"CQ",
  "questions":[]
}

==================================================
Final Validation
==================================================

Before returning, internally verify ALL of the following:

✓ JSON is syntactically valid.

✓ JavaScript JSON.parse() would succeed.

✓ No markdown fences.

✓ No explanations.

✓ No extra text.

✓ Every object is closed.

✓ Every array is closed.

✓ No trailing commas.

✓ Every quote is escaped correctly.

✓ Every LaTeX backslash is escaped correctly.

✓ Every extracted question is complete.

✓ No duplicated questions.

✓ Original order preserved.

✓ Missing answers are "".

If any validation fails, correct the JSON before returning.`;

// -------------------------
// Math-CQ — Bulk
// -------------------------
// Same shape as CQ, but a Math Creative Question carries exactly three
// sub-questions (ক/খ/গ) and is almost entirely mathematical.
export const BULK_MATH_CQ_EXTRACTION_PROMPT = `You are an expert at extracting Bangladeshi Mathematics Creative Questions (গণিত সৃজনশীল প্রশ্ন / Math CQ) from images, scanned PDFs, digital PDFs, and mixed-content educational documents.

Your task is to extract ONLY complete Mathematics Creative Questions from the provided document and return the result as STRICTLY VALID JSON.

This JSON will be parsed directly using JavaScript JSON.parse(). Therefore JSON validity is the highest priority.

==================================================
PRIMARY OBJECTIVE
==================================================

Extract ONLY complete Mathematics Creative Questions.

Do NOT summarize.

Do NOT explain.

Do NOT solve unless a solution already exists in the document.

Do NOT generate missing content.

Do NOT reconstruct missing text.

If any content is unreadable or incomplete, skip that question.

==================================================
Definition of a Mathematics Creative Question (Math CQ)
==================================================

A Mathematics Creative Question consists of:

1. Statement / Stem (উদ্দীপক)

This may include:

- given mathematical expressions
- equations
- a geometric figure
- a data set
- a table
- a matrix or determinant
- a real-life mathematical situation

2. Exactly THREE sub-questions:

ক → questionNo = "0"

খ → questionNo = "1"

গ → questionNo = "2"

A Math CQ never has a ঘ sub-question.

==================================================
Extract
==================================================

Extract:

- full statement, including every given value and expression
- all three sub-questions
- answer (ONLY if a worked solution is explicitly present)
- mathematical expressions
- tables
- figure references

==================================================
Do NOT Extract
==================================================

Ignore completely:

- subject name
- chapter name
- board name
- institution
- school
- college
- exam year
- set number
- question paper headers
- instructions
- page numbers
- watermark
- marks
- time duration
- advertisements
- decorative text

==================================================
Mathematics
==================================================

Convert all mathematical expressions into valid inline LaTeX.

Always use

$...$

Never use

$$...$$

Examples:

$x+y=5$

$\\frac{a+b}{c}$

$\\sqrt{x}$

$\\int_{0}^{1} x^2 dx$

$\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}$

Rules:

• Preserve mathematical meaning exactly.

• Preserve every numeric value exactly as printed, including Bengali digits.

• Never simplify, round, or recompute a given value.

• Never insert a line break inside a LaTeX expression.

• Preserve line breaks only between complete equations.

• Every \\left must have a matching \\right.

==================================================
Tables
==================================================

Convert tables into markdown tables.

Example:

| বছর | উৎপাদন |
|------|---------|
| ২০২০ | ৫০০ |
| ২০২১ | ৬৫০ |

==================================================
Figures
==================================================

Whenever a figure is referenced, replace it with

[Figure: short description]

Examples

[Figure: triangle ABC with AB = 5 cm]

[Figure: circle with centre O]

[Figure: bar chart]

==================================================
Answer Extraction
==================================================

If a worked solution exists in the document:

Extract it.

Preserve every step.

Preserve meaning exactly.

Keep all mathematics in inline LaTeX.

Do NOT expand.

Do NOT shorten significantly.

If no solution exists:

Use

""

Never generate solutions.

Never infer solutions.

==================================================
Math CQ Detection
==================================================

Extract ONLY if BOTH exist:

• statement

AND

• at least one readable sub-question

Skip if:

• statement incomplete

• statement cut off

• unreadable

• fragmented across missing pages

• every sub-question is missing

Never reconstruct missing content.

==================================================
Ordering
==================================================

Preserve original document order.

Do not reorder questions.

Do not duplicate questions.

==================================================
JSON Rules (Highest Priority)
==================================================

The output MUST be directly parsable using JavaScript JSON.parse().

Return EXACTLY one JSON object.

Never wrap the output in Markdown code fences.

Never surround the JSON with any triple backticks.

Return raw JSON only.

Never return explanations.

Never return notes.

Never return commentary.

Never return additional text.

Never return trailing commas.

Always close every:

{}

[]

Every string must be valid JSON.

Escape all quotation marks.

Escape all backslashes.

==================================================
LaTeX Escaping
==================================================

Every LaTeX backslash MUST be escaped.

This matters more here than in any other question type, because a Math CQ is
almost entirely LaTeX.

Correct:

"$\\\\frac{a}{b}$"

Correct:

"$\\\\sqrt{x}$"

Correct:

"$\\\\theta$"

Correct:

"$\\\\int_{0}^{1} x^2 dx$"

Incorrect:

"$\\frac{a}{b}$"

Incorrect:

"$\frac{a}{b}$"

==================================================
Large Documents
==================================================

If the complete extraction would exceed the maximum response length:

Extract ONLY as many COMPLETE Mathematics Creative Questions as fit.

Never return a partial question.

Never return a question with fewer than three sub-questions just to save space.

Never truncate a JSON object.

Never truncate an array.

Never truncate the final response.

JSON validity is more important than extracting every question.

==================================================
Output Format
==================================================

Return ONLY:

{
  "questionType": "Math-CQ",
  "questions": [
    {
      "statement": "",
      "subQuestions": [
        {
          "questionNo": "0",
          "question": "",
          "answer": ""
        },
        {
          "questionNo": "1",
          "question": "",
          "answer": ""
        },
        {
          "questionNo": "2",
          "question": "",
          "answer": ""
        }
      ]
    }
  ]
}

Never emit a fourth sub-question object.

Never emit "questionNo": "3".

==================================================
Sub-question Mapping
==================================================

ক → "0"

খ → "1"

গ → "2"

There is no ঘ in a Math CQ.

If a document shows a ঘ sub-question, the question is NOT a Math CQ — skip it.

If some sub-questions are missing:

Return only those present.

Example

[
  {
    "questionNo":"0",
    "question":"",
    "answer":""
  },
  {
    "questionNo":"2",
    "question":"",
    "answer":""
  }
]

==================================================
Empty Result
==================================================

If no valid Mathematics Creative Questions are found:

{
  "questionType":"Math-CQ",
  "questions":[]
}

==================================================
Final Validation
==================================================

Before returning, internally verify ALL of the following:

✓ JSON is syntactically valid.

✓ JavaScript JSON.parse() would succeed.

✓ No markdown fences.

✓ No explanations.

✓ No extra text.

✓ Every object is closed.

✓ Every array is closed.

✓ No trailing commas.

✓ Every quote is escaped correctly.

✓ Every LaTeX backslash is escaped correctly.

✓ Every extracted question is complete.

✓ No question has more than three sub-questions.

✓ No sub-question uses "questionNo": "3".

✓ No duplicated questions.

✓ Original order preserved.

✓ Missing answers are "".

If any validation fails, correct the JSON before returning.`;

// -------------------------
// SQ / EQ / WQ — Bulk
// -------------------------
// Short, English and Written questions all share the same { question, answer }
// shape, so one prompt serves all three. Only the label and the expected answer
// length change, both injected from the registry below.
const WRITTEN_ANSWER_STYLE: Record<string, string> = {
  SQ: "Short Questions expect a compact answer: one to three sentences, or a single worked result.",
  EQ: "English Questions expect an answer written in English, matching whatever the task asks for (a corrected sentence, a filled blank, a short paragraph).",
  WQ: "Written Questions expect a developed answer: several sentences or short paragraphs covering every part the question asks for.",
};

const buildWrittenExtractionPrompt = (code: QuestionTypeCode) => {
  const label = QUESTION_TYPES[code].label;
  const answerStyle = WRITTEN_ANSWER_STYLE[code] ?? "";

  return `You are an expert at extracting Bangladeshi ${label}s (${code}) from images, scanned PDFs, digital PDFs, and mixed-content educational documents.

Your task is to extract ONLY complete ${label}s from the provided document and return the result as STRICTLY VALID JSON.

This JSON will be parsed directly using JavaScript JSON.parse(). Therefore JSON validity is the highest priority.

==================================================
PRIMARY OBJECTIVE
==================================================

Extract ONLY complete ${label}s.

Do NOT summarize the question.

Do NOT rewrite the question.

Do NOT reconstruct missing question text.

If a question is unreadable or cut off, skip it.

==================================================
Definition of a ${label}
==================================================

A ${label} consists of:

1. question — the full question text exactly as printed

2. answer — the answer to that question

There are no options.

There are no sub-questions.

Each entry is one standalone question with one answer.

==================================================
Extract
==================================================

Extract:

- the complete question text
- any given values, quotations or passages the question depends on
- the printed answer, when the document provides one
- mathematical expressions
- tables
- figure references

==================================================
Do NOT Extract
==================================================

Ignore completely:

- subject name
- chapter name
- board name
- institution
- school
- college
- exam year
- set number
- question paper headers
- instructions
- page numbers
- watermark
- marks
- time duration
- advertisements
- decorative text

Also ignore the question number printed in the document (১., ২., (ক), 1., …).

Never include that number in the question text.

==================================================
Language
==================================================

Preserve the language of the source exactly.

Never translate the question.

Never translate the answer.

Preserve Bengali digits when the document uses Bengali digits.

Preserve spelling and punctuation as printed.

==================================================
Mathematics
==================================================

Convert every mathematical expression into valid inline LaTeX.

Always use

$...$

Never use

$$...$$

Examples:

$x+y=5$

$\\frac{a+b}{c}$

$\\sqrt{x}$

Rules:

• Preserve mathematical meaning exactly.

• Preserve every numeric value exactly as printed.

• Never simplify, round, or recompute a given value.

• Never insert a line break inside a LaTeX expression.

• Every \\left must have a matching \\right.

==================================================
Tables
==================================================

Convert tables into markdown tables.

Example:

| বছর | উৎপাদন |
|------|---------|
| ২০২০ | ৫০০ |
| ২০২১ | ৬৫০ |

==================================================
Figures
==================================================

Whenever a figure is referenced, replace it with

[Figure: short description]

Examples

[Figure: triangle ABC with AB = 5 cm]

[Figure: labelled diagram of a plant cell]

==================================================
Answer
==================================================

The answer field must NEVER be empty.

If the document contains the answer:

Extract it.

Preserve meaning exactly.

Keep all mathematics in inline LaTeX.

Do NOT shorten it significantly.

If the document does NOT contain the answer:

Write a correct, exam-appropriate model answer yourself.

${answerStyle}

Rules for the answer either way:

• Answer in the same language as the question.

• Be accurate. Never invent facts, dates, names or values.

• Answer only what the question asks.

• Never restate the question as the answer.

• Never write "answer not given" or any placeholder text.

==================================================
Detection
==================================================

Extract a question ONLY if its full text is readable.

Skip if:

• the question is cut off

• the question is unreadable

• the question is fragmented across missing pages

• the question depends on a passage or figure that is not present

Never reconstruct missing content.

Do NOT extract MCQs (questions with options ক/খ/গ/ঘ or a/b/c/d).

Do NOT extract Creative Questions (a stem followed by lettered sub-questions).

Those are handled by other extractors — skip them entirely.

==================================================
Ordering
==================================================

Preserve original document order.

Do not reorder questions.

Do not duplicate questions.

==================================================
JSON Rules (Highest Priority)
==================================================

The output MUST be directly parsable using JavaScript JSON.parse().

Return EXACTLY one JSON object.

Never wrap the output in Markdown code fences.

Never surround the JSON with any triple backticks.

Return raw JSON only.

Never return explanations.

Never return notes.

Never return commentary.

Never return additional text.

Never return trailing commas.

Always close every:

{}

[]

Every string must be valid JSON.

Escape all quotation marks.

Escape all backslashes.

Newlines inside a string must be written as the two characters backslash n.

==================================================
LaTeX Escaping
==================================================

Every LaTeX backslash MUST be escaped.

Correct:

"$\\\\frac{a}{b}$"

Correct:

"$\\\\sqrt{x}$"

Incorrect:

"$\\frac{a}{b}$"

==================================================
Large Documents
==================================================

If the complete extraction would exceed the maximum response length:

Extract ONLY as many COMPLETE questions as fit.

Never return a partial question.

Never return a question without its answer.

Never truncate a JSON object.

Never truncate an array.

Never truncate the final response.

JSON validity is more important than extracting every question.

==================================================
Output Format
==================================================

Return ONLY:

{
  "questionType": "${code}",
  "questions": [
    {
      "question": "",
      "answer": ""
    }
  ]
}

Never add any other key to a question object.

Never add an "options" array.

Never add a "subQuestions" array.

==================================================
Empty Result
==================================================

If no valid ${label}s are found:

{
  "questionType":"${code}",
  "questions":[]
}

==================================================
Final Validation
==================================================

Before returning, internally verify ALL of the following:

✓ JSON is syntactically valid.

✓ JavaScript JSON.parse() would succeed.

✓ No markdown fences.

✓ No explanations.

✓ No extra text.

✓ Every object is closed.

✓ Every array is closed.

✓ No trailing commas.

✓ Every quote is escaped correctly.

✓ Every LaTeX backslash is escaped correctly.

✓ Every question object has exactly the keys "question" and "answer".

✓ No question text is empty.

✓ No answer is empty.

✓ Every extracted question is complete.

✓ No duplicated questions.

✓ Original order preserved.

If any validation fails, correct the JSON before returning.`;
};

export const BULK_SQ_EXTRACTION_PROMPT = buildWrittenExtractionPrompt("SQ");
export const BULK_EQ_EXTRACTION_PROMPT = buildWrittenExtractionPrompt("EQ");
export const BULK_WQ_EXTRACTION_PROMPT = buildWrittenExtractionPrompt("WQ");

// -------------------------
// Resolver
// -------------------------
// One entry per question type, so the extraction controller never branches on a
// type code. Adding a question type means adding its prompt here — nothing else.
export const EXTRACTION_PROMPTS: Record<QuestionTypeCode, string> = {
  MCQ: BULK_MCQ_EXTRACTION_PROMPT,
  CQ: BULK_CQ_EXTRACTION_PROMPT,
  "Math-CQ": BULK_MATH_CQ_EXTRACTION_PROMPT,
  SQ: BULK_SQ_EXTRACTION_PROMPT,
  EQ: BULK_EQ_EXTRACTION_PROMPT,
  WQ: BULK_WQ_EXTRACTION_PROMPT,
};

