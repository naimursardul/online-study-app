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
// import { ICQ, IRecord } from "@/lib/type";
// import { Textarea } from "@/components/ui/textarea";
// import SubmitBtn from "@/components/submit-btn";

// import RecordSelector from "@/components/record-selector";

// export default function CqUpload() {
//   const [formData, setFormData] = useState<ICQ>({
//     questionType: "CQ",
//     level: "",
//     subject: "",
//     chapter: "",
//     topic: "",
//     records: [],
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

//   //
//   //
//   // CONVERT OPTION INDEX TO STRING
//   const optionSetting: Record<number, string> = {
//     0: "A",
//     1: "B",
//     2: "C",
//     3: "D",
//   };

//   return (
//     <Card className="w-full mx-auto md:p-4 mt-10 shadow-md">
//       <CardContent>
//         <h2 className="text-xl font-semibold text-center mb-5 flex items-center justify-center gap-2">
//           <PlusCircle />
//           <span>Create a Question</span>
//         </h2>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div className="flex flex-col md:flex-row gap-5 md:gap-7">
//             <div className="w-full md:w-[300px] space-y-4">
//               {/* Question Type */}
//               <div className="space-y-2">
//                 <Label>Question Type</Label>
//                 <span>CQ</span>
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
//                 <Label>Record</Label>
//                 <div className="flex flex-wrap gap-2">
//                   {formData.record.length > 0 &&
//                     formData.record.map((r: string) => (
//                       <div
//                         className="bg-sidebar text-sm font-semibold border-1 border-sidebar-border px-2 py-1 rounded-xl"
//                         key={r}
//                       >
//                         {r}
//                       </div>
//                     ))}
//                 </div>
//                 <RecordSelector
//                   formData={formData}
//                   setFormData={setFormData}
//                   recordData={recordData}
//                 />
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
//                 <Label htmlFor="question">Statement</Label>
//                 <Textarea placeholder="Statemen" />
//               </div>
//               <div className="space-y-4">
//                 <Label htmlFor="question">Question</Label>
//                 {[1, 2, 3, 4].map((q) => (
//                   <div key={q} className="space-y-2">
//                     {/*  */}
//                     {/*  */}
//                     {/* NUMBERING */}
//                     <p className="bg-accent border-1 border-sidebar-border size-5 md:size-7 flex justify-center items-center px-2 py-2 text-xs rounded">
//                       {optionSetting[q - 1]}
//                     </p>
//                     <div className="flex flex-wrap gap-2">
//                       {/* Topic */}
//                       <Select
//                         onValueChange={(value) =>
//                           setFormData({ ...formData, topic: value })
//                         }
//                       >
//                         <SelectTrigger>
//                           <SelectValue placeholder="Select tpoic" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectGroup>
//                             {topics.length > 0 ? (
//                               topics.map((topic) => (
//                                 <SelectItem key={topic} value={topic}>
//                                   {topic}
//                                 </SelectItem>
//                               ))
//                             ) : (
//                               <SelectItem disabled value="none">
//                                 Select a chapter first
//                               </SelectItem>
//                             )}
//                           </SelectGroup>
//                         </SelectContent>
//                       </Select>

//                       {/* Difficulty */}
//                       <Select
//                         onValueChange={(value: "Easy" | "Medium" | "Hard") =>
//                           setFormData({ ...formData, difficulty: value })
//                         }
//                       >
//                         <SelectTrigger>
//                           <SelectValue placeholder="Difficulty" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectGroup>
//                             <SelectItem value={"Easy"}>Easy</SelectItem>
//                             <SelectItem defaultChecked value={"Medium"}>
//                               Medium
//                             </SelectItem>
//                             <SelectItem value={"Hard"}>Hard</SelectItem>
//                           </SelectGroup>
//                         </SelectContent>
//                       </Select>
//                     </div>
//                     {/* Records */}
//                     <div className="flex flex-wrap items-center gap-2">
//                       <RecordSelector
//                         formData={formData}
//                         setFormData={setFormData}
//                         recordData={recordData}
//                         width="200px"
//                       />
//                       {formData.record.length > 0 &&
//                         formData.record.map((r) => (
//                           <div
//                             className="bg-sidebar text-sm font-semibold border-1 border-sidebar-border px-2 py-1 rounded-xl"
//                             key={r}
//                           >
//                             {r}
//                           </div>
//                         ))}
//                     </div>

//                     <Textarea
//                       id={`question-${q}`}
//                       name={`question-${q}`}
//                       value={formData.question[q - 1]}
//                       onChange={(e) =>
//                         setFormData(() => {
//                           const { question } = formData;
//                           question[q - 1] = e.target.value;
//                           return {
//                             ...formData,
//                             question,
//                           };
//                         })
//                       }
//                       placeholder="Enter the question"
//                     />
//                     <Textarea
//                       id={`answer-${q}`}
//                       name={`answer-${q}`}
//                       placeholder="Enter Answer"
//                     />
//                   </div>
//                 ))}
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
