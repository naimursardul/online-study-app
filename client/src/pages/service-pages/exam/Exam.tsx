import QuestionExtractor from "@/components/questionExtraction/QuestionExtraction";

function Exam() {
  return (
    <div>
      <QuestionExtractor
        onSave={(questions) => {
          // questions is the final edited array — save to your DB here
          console.log(questions);
        }}
      />
    </div>
  );
}

export default Exam;
