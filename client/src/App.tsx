import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/home/Home.tsx";
import About from "./pages/about/About.tsx";
import QuestionBank from "./pages/service-pages/question-bank/Question-bank.tsx";
import Exam from "./pages/service-pages/exam/Exam.tsx";
import Doubt from "./pages/service-pages/doubt/Doubt.tsx";
import ServiceLayout from "./pages/service-pages/Service-layout.tsx";
import Login from "./pages/login/Login.tsx";
import Admin from "./pages/admin/Admin.tsx";
import ProtectedRoute from "./lib/Protected-route.tsx";
import HomeLayout from "./pages/Home-layout.tsx";
import Signup from "./pages/signup/Signup.tsx";
import NotFound from "./pages/not-found/Not-found.tsx";
import InstitutionQuestionLayout from "./pages/service-pages/question-bank/slug-1/Institution-question-layout.tsx";
import QuestionBankSlug2 from "./pages/service-pages/question-bank/slug-1/slug-2/Question-bank-slug2.tsx";
import QuestionBankSlug1 from "./pages/service-pages/question-bank/slug-1/Question-bank-slug1.tsx";
import AdminLayout from "./pages/admin/AdminLayout.tsx";
import Question from "./pages/admin/(allUploadPages)/question/Question.tsx";
import Level from "./pages/admin/(allUploadPages)/level/Level.tsx";
import Background from "./pages/admin/(allUploadPages)/background/Background.tsx";
import Subject from "./pages/admin/(allUploadPages)/subject/Subject.tsx";
import Chapter from "./pages/admin/(allUploadPages)/chapter/Chapter.tsx";
import Topic from "./pages/admin/(allUploadPages)/topic/Topic.tsx";
import Record from "./pages/admin/(allUploadPages)/record/Record.tsx";
import Contact from "./pages/contact/Contact.tsx";
import Dashboard from "./pages/service-pages/dashboard/Dashboard.tsx";
import AiExtractor from "./pages/admin/(allUploadPages)/ai-extractor.tsx";
import Collection from "./pages/collection/Collection.tsx";
import SingleCollectionPage from "./pages/collection/slug-1/SingleCollectionPage.tsx";

function App() {
  return (
    <BrowserRouter>
      <div className="">
        <Routes>
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["user"]} element={<AdminLayout />} />
            }
          >
            <Route index element={<Admin />} />
            <Route path="question" element={<Question />} />
            <Route path="ai-extractor" element={<AiExtractor />} />
            <Route path="record" element={<Record />} />
            <Route path="level" element={<Level />} />
            <Route path="background" element={<Background />} />
            <Route path="subject" element={<Subject />} />
            <Route path="chapter" element={<Chapter />} />
            <Route path="topic" element={<Topic />} />
          </Route>

          <Route path="/" element={<HomeLayout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="signup" element={<Signup />} />
            <Route path="login" element={<Login />} />
          </Route>

          <Route path="/" element={<ServiceLayout />}>
            <Route path="question-bank" element={<QuestionBank />} />
            <Route
              path="question-bank/:slug1"
              element={<InstitutionQuestionLayout />}
            >
              <Route index element={<QuestionBankSlug1 />} />
              <Route path=":slug2" element={<QuestionBankSlug2 />} />
            </Route>
            <Route path="exam" element={<Exam />} />
            <Route path="doubt" element={<Doubt />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute roles={["user"]} element={<Dashboard />} />
              }
            />
            <Route
              path="/collection"
              element={
                <ProtectedRoute roles={["user"]} element={<Collection />} />
              }
            />
            <Route path="/collections/:id" element={<SingleCollectionPage />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
