import SingleQuestionBank from "@/components/single-question-bank/single-question-bank";
import SingleQuestionBankSidebar from "@/components/single-question-bank/single-question-bank-sidebar";

export interface QuestionType {
  detail: string;
  options: string[];
  answer: string;
  toughness: number;
  explanation: string;
  tag: string[];
  class: string;
  subject: string;
  chapter: number;
  topic: string;
}
const allQuestions: QuestionType[] = [
  {
    detail:
      "Why do objects fall down lorme hello how are you. Ima doing well how are you So What re you doin now are you. Ima doing well how are you So What re you doin now?",
    options: [
      "magnetic force",
      "gravitational force",
      "friction",
      "internal energy",
    ],
    answer: "gravitational force",
    toughness: 5,
    explanation:
      "Allah asehi banaiya hee vai. Tu samajta q nehi hee. Na bujhle, Mukhosto kor.are you. ",
    tag: ["Engr_Model_Test_24", "Engr_Model_Test_24"],
    class: "HSC",
    subject: "Physics",
    chapter: 10,
    topic: "Gravity",
  },
  {
    detail: "Why do objects fall down lorme hello how ?",
    options: [
      "magnetic force",
      "gravitational force",
      "friction",
      "internal energy",
    ],
    answer: "gravitational force",
    toughness: 5,
    explanation:
      "Allah asehi banaiya hee vai. Tu samajta q nehi hee. Na bujhle, Mukhosto kor. Ima doing well how are you So What re you doin now",
    tag: ["Engr_Model_Test_24", "Engr_Model_Test_24"],
    class: "HSC",
    subject: "Physics",
    chapter: 10,
    topic: "Gravity",
  },
  {
    detail: "Why do objects fall down lorme hello how ?",
    options: [
      "magnetic force",
      "gravitational force",
      "friction",
      "internal energy",
    ],
    answer: "gravitational force",
    toughness: 5,
    explanation:
      "Allah asehi banaiya hee vai. Tu samajta q nehi hee. Na bujhle, Mukhosto kor.",
    tag: ["Engr_Model_Test_24", "Engr_Model_Test_24"],
    class: "HSC",
    subject: "Physics",
    chapter: 10,
    topic: "Gravity",
  },
  {
    detail: "Why do objects fall down lorme hello how ?",
    options: [
      "magnetic force",
      "gravitational force",
      "friction",
      "internal energy",
    ],
    answer: "gravitational force",
    toughness: 5,
    explanation:
      "Allah asehi banaiya hee vai. Tu samajta q nehi hee. Na bujhle, Mukhosto kor.",
    tag: ["Engr_Model_Test_24", "Engr_Model_Test_24"],
    class: "HSC",
    subject: "Physics",
    chapter: 10,
    topic: "Gravity",
  },
  {
    detail:
      "Why do objects fall down lorme hello how are you. Ima doing well how are you So What re you doin now?",
    options: [
      "magnetic force",
      "gravitational force",
      "friction",
      "internal energy",
    ],
    answer: "gravitational force",
    toughness: 5,
    explanation:
      "Allah asehi banaiya hee vai. Tu samajta q nehi hee. Na bujhle, Mukhosto kor.",
    tag: ["Engr_Model_Test_24", "Engr_Model_Test_24"],
    class: "HSC",
    subject: "Physics",
    chapter: 10,
    topic: "Gravity",
  },
  {
    detail:
      "Why do objects fall down lorme hello how are you. Ima doing well how are you So What re you doin now?",
    options: [
      "magnetic force",
      "gravitational force",
      "friction",
      "internal energy",
    ],
    answer: "gravitational force",
    toughness: 5,
    explanation:
      "Allah asehi banaiya hee vai. Tu samajta q nehi hee. Na bujhle, Mukhosto kor.",
    tag: ["Engr_Model_Test_24", "Engr_Model_Test_24"],
    class: "HSC",
    subject: "Physics",
    chapter: 10,
    topic: "Gravity",
  },
  {
    detail: "Why do objects fall down lorme hello how ?",
    options: [
      "magnetic force",
      "gravitational force",
      "friction",
      "internal energy",
    ],
    answer: "gravitational force",
    toughness: 5,
    explanation:
      "Allah asehi banaiya hee vai. Tu samajta q nehi hee. Na bujhle, Mukhosto kor.",
    tag: ["Engr_Model_Test_24", "Engr_Model_Test_24"],
    class: "HSC",
    subject: "Physics",
    chapter: 10,
    topic: "Gravity",
  },
];

export default async function page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <div className="flex flex-col md:flex-row gap-3 mt-10">
      <SingleQuestionBankSidebar slug={slug} />
      {/* <div className="w-full"> */}
      <SingleQuestionBank slug={slug} allQuestions={allQuestions} />
      {/* </div> */}
    </div>
  );
}
