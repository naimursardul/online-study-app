// "use client";

// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent } from "@/components/ui/card";
// import {
//   Select,
//   SelectContent,
//   SelectGroup,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { PlusCircle } from "lucide-react";
// import { useState, useEffect, FormEvent } from "react";
// import { QuestionType, RecordType } from "@/lib/type";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Textarea } from "@/components/ui/textarea";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import SubmitBtn from "@/components/submit-btn";

// export default function McqUpload() {
//   const [formData, setFormData] = useState<QuestionType>({
//     questionType: "MCQ",
//     studentClass: "",
//     subject: "",
//     chapter: "",
//     topic: "",
//     appearedInExam: false,
//     record: [],
//     difficulty: "Medium",

//     // statement?: string;
//     question: [],
//     options: [],
//     answer: "",
//     explanation: "",
//     mark: 0,
//     time: 0,
//   });
//   const [subjects, setSubjects] = useState<string[]>([]);
//   const [chapters, setChapters] = useState<string[]>([]);
//   const [topics, setTopics] = useState<string[]>([]);

//   useEffect(() => {
//     if (formData.studentClass) {
//       fetch(`/api/subjects?class=${formData.studentClass}`)
//         .then((res) => res.json())
//         .then((data) => setSubjects(data));
//     } else {
//       setSubjects([]);
//     }
//   }, [formData.studentClass]);

//   useEffect(() => {
//     if (formData.subject) {
//       fetch(`/api/chapters?subject=${formData.subject}`)
//         .then((res) => res.json())
//         .then((data) => setChapters(data));
//     } else {
//       setChapters([]);
//     }
//   }, [formData.subject]);

//   useEffect(() => {
//     if (formData.chapter) {
//       fetch(`/api/topics?chapter=${formData.chapter}`)
//         .then((res) => res.json())
//         .then((data) => setTopics(data));
//     } else {
//       setTopics([]);
//     }
//   }, [formData.chapter]);

//   const handleSubmit = (e: FormEvent) => {
//     e.preventDefault();
//     console.log("Form Data Submitted:", formData);
//   };

//   const recordData: RecordType[] = [
//     {
//       _id: "28349482774",
//       recordType: "Board",
//       institution: "Butex",
//       year: "2021",
//     },
//     {
//       _id: "8494994403",
//       recordType: "Board",
//       institution: "Buet",
//       year: "2021",
//     },
//   ];

//   return (
//     <Card className="w-full mx-auto md:p-4 mt-10 shadow-md">
//       <CardContent>
//         <h2 className="text-xl font-semibold text-center mb-5 flex items-center justify-center gap-2">
//           <PlusCircle />
//           <span>Create a Question</span>
//         </h2>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div className="flex flex-col md:flex-row gap-5 ">
//             <div className="w-full md:w-[300px] space-y-4">
//               {/* Question Type */}
//               <div className="space-y-2">
//                 <Label>Question Type</Label>
//                 <span>MCQ</span>
//               </div>

//               {/* Student Class */}
//               <div className="space-y-2">
//                 <Label htmlFor="studentClass">Student Class</Label>
//                 <Select
//                   onValueChange={(value) =>
//                     setFormData({ ...formData, studentClass: value })
//                   }
//                 >
//                   <SelectTrigger className="w-full">
//                     <SelectValue placeholder="Select Student Class" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectGroup>
//                       <SelectItem value="hsc">HSC</SelectItem>
//                       <SelectItem value="ssc">SSC</SelectItem>
//                     </SelectGroup>
//                   </SelectContent>
//                 </Select>
//               </div>
//               {/* Subject */}
//               <div className="space-y-2">
//                 <Label htmlFor="subject">Subject</Label>
//                 <Select
//                   onValueChange={(value) =>
//                     setFormData({ ...formData, subject: value })
//                   }
//                 >
//                   <SelectTrigger className="w-full">
//                     <SelectValue placeholder="Select Subject" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectGroup>
//                       {subjects.length > 0 ? (
//                         subjects.map((subject) => (
//                           <SelectItem key={subject} value={subject}>
//                             {subject}
//                           </SelectItem>
//                         ))
//                       ) : (
//                         <SelectItem disabled value="none">
//                           Select a class first
//                         </SelectItem>
//                       )}
//                     </SelectGroup>
//                   </SelectContent>
//                 </Select>
//               </div>
//               {/* Chapter */}
//               <div className="space-y-2">
//                 <Label htmlFor="chapter">Chapter</Label>
//                 <Select
//                   onValueChange={(value) =>
//                     setFormData({ ...formData, chapter: value })
//                   }
//                 >
//                   <SelectTrigger className="w-full">
//                     <SelectValue placeholder="Select Chapter" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectGroup>
//                       {chapters.length > 0 ? (
//                         chapters.map((chapter) => (
//                           <SelectItem key={chapter} value={chapter}>
//                             {chapter}
//                           </SelectItem>
//                         ))
//                       ) : (
//                         <SelectItem disabled value="none">
//                           Select a subject first
//                         </SelectItem>
//                       )}
//                     </SelectGroup>
//                   </SelectContent>
//                 </Select>
//               </div>
//               {/* Topic */}
//               <div className="space-y-2">
//                 <Label htmlFor="subject">Topic</Label>
//                 <Select
//                   onValueChange={(value) =>
//                     setFormData({ ...formData, topic: value })
//                   }
//                 >
//                   <SelectTrigger className="w-full">
//                     <SelectValue placeholder="Select tpoic" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectGroup>
//                       {topics.length > 0 ? (
//                         topics.map((topic) => (
//                           <SelectItem key={topic} value={topic}>
//                             {topic}
//                           </SelectItem>
//                         ))
//                       ) : (
//                         <SelectItem disabled value="none">
//                           Select a chapter first
//                         </SelectItem>
//                       )}
//                     </SelectGroup>
//                   </SelectContent>
//                 </Select>
//               </div>
//               {/* Records */}
//               <div className="space-y-2">
//                 <Label htmlFor="subject">Records</Label>
//                 <div className="flex gap-2 flex-wrap">
//                   {formData.record.length > 0 &&
//                     formData.record.map((r) => <div key={r}>{r}</div>)}
//                 </div>
//                 {recordData.map((r) => (
//                   <div key={r?._id} className="flex gap-2">
//                     <Checkbox
//                       onCheckedChange={(change: boolean) =>
//                         setFormData(() => {
//                           const { record } = formData;
//                           if (change) {
//                             if (!record.includes(r.institution)) {
//                               record.push(r.institution);
//                             }
//                           } else {
//                             if (record.includes(r.institution)) {
//                               const index = record.indexOf(r.institution);
//                               record.splice(index, 1);
//                             }
//                           }
//                           return {
//                             ...formData,
//                             record,
//                           };
//                         })
//                       }
//                     />
//                     <Label>{r.institution + "-" + r.year}</Label>
//                   </div>
//                 ))}
//               </div>
//               {/* Difficulty */}
//               <div className="space-y-2">
//                 <Label htmlFor="chapter">Difficulty</Label>
//                 <Select
//                   onValueChange={(value: "Easy" | "Medium" | "Hard") =>
//                     setFormData({ ...formData, difficulty: value })
//                   }
//                 >
//                   <SelectTrigger className="w-full">
//                     <SelectValue placeholder="Select Chapter" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectGroup>
//                       <SelectItem value={"Easy"}>Easy</SelectItem>
//                       <SelectItem defaultChecked value={"Medium"}>
//                         Medium
//                       </SelectItem>
//                       <SelectItem value={"Hard"}>Hard</SelectItem>
//                     </SelectGroup>
//                   </SelectContent>
//                 </Select>
//               </div>
//               {/* Mark */}
//               <div className="space-y-2">
//                 <Label htmlFor="mark">Mark</Label>
//                 <Input
//                   name="mark"
//                   type="number"
//                   placeholder="Enter question mark"
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="time">Time</Label>
//                 <Input
//                   name="time"
//                   type="number"
//                   placeholder="Enter question time"
//                 />
//               </div>
//             </div>
//             {/*  */}
//             {/*  */}
//             {/*  */}
//             {/*  */}
//             <div className="w-full space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="question">Question</Label>
//                 <Textarea
//                   id="question"
//                   name="question"
//                   value={formData.question[0]}
//                   onChange={(e) =>
//                     setFormData(() => {
//                       const { question } = formData;
//                       question[0] = e.target.value;
//                       return {
//                         ...formData,
//                         question,
//                       };
//                     })
//                   }
//                   placeholder="Enter the question"
//                 />
//               </div>

//               {/* Options */}
//               <div className="space-y-2">
//                 <Label>Options</Label>
//                 <div className="flex flex-row gap-2 md:gap-4 items-baseline">
//                   <div className="space-y-2 w-full">
//                     {[1, 2, 3, 4].map((o) => (
//                       <Input
//                         key={o}
//                         id={`option_${o}`}
//                         name={`option_${o}`}
//                         value={formData.options[o - 1]}
//                         onChange={(e) =>
//                           setFormData(() => {
//                             const { options } = formData;
//                             options[o - 1] = e.target.value;
//                             return {
//                               ...formData,
//                               options,
//                             };
//                           })
//                         }
//                         placeholder={`option-${o}`}
//                       />
//                     ))}
//                   </div>

//                   <div className="space-y-4">
//                     <RadioGroup
//                       onValueChange={(value) =>
//                         setFormData({ ...formData, answer: value })
//                       }
//                       className="space-y-4"
//                     >
//                       <RadioGroupItem
//                         value={formData.options[0] || "1"}
//                         id="r1"
//                       />
//                       <RadioGroupItem
//                         value={formData.options[1] || "2"}
//                         id="r2"
//                       />
//                       <RadioGroupItem
//                         value={formData.options[2] || "3"}
//                         id="r3"
//                       />
//                       <RadioGroupItem
//                         value={formData.options[3] || "4"}
//                         id="r4"
//                       />
//                     </RadioGroup>{" "}
//                   </div>
//                 </div>
//               </div>

//               {/* Explanation */}
//               <div className="space-y-2">
//                 <Label htmlFor="explanation">Explanation</Label>
//                 <Textarea
//                   id="explanation"
//                   name="explanation"
//                   value={formData.explanation}
//                   onChange={(e) =>
//                     setFormData({
//                       ...formData,
//                       explanation: e.target.value,
//                     })
//                   }
//                   placeholder="Enter Explanation"
//                 />
//               </div>
//             </div>
//           </div>

//           <SubmitBtn />
//         </form>
//         <div>
//           {"\nquestionType:" +
//             " " +
//             formData?.questionType +
//             "\nstudentClass:" +
//             " " +
//             formData?.studentClass +
//             "\nsubject:" +
//             " " +
//             formData?.subject +
//             "\nchapter:" +
//             " " +
//             formData?.chapter +
//             "\ntopic:" +
//             " " +
//             formData?.topic +
//             "\nappearedInExam:" +
//             " " +
//             formData?.appearedInExam +
//             "\nrecord:" +
//             " " +
//             formData?.record +
//             "\ndifficulty:" +
//             " " +
//             formData?.difficulty +
//             "\nquestion:" +
//             " " +
//             formData?.question +
//             "\noptions:" +
//             " " +
//             formData?.options +
//             "\nanswer:" +
//             " " +
//             formData?.answer +
//             "\nexplanation:" +
//             " " +
//             formData?.explanation +
//             "\nmark:" +
//             " " +
//             formData?.mark +
//             "\n time:" +
//             " " +
//             formData?.time}
//         </div>
//       </CardContent>
//     </Card>
//   );
// }
