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
import InstitutionQuestion from "./pages/service-pages/question-bank/[...slug]/Institution-question.tsx";

function App() {
  return (
    <BrowserRouter>
      <div className="">
        <Routes>
          <Route
            path="/admin"
            element={<ProtectedRoute roles={["admin"]} element={<Admin />} />}
          />

          <Route path="/" element={<HomeLayout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="signup" element={<Signup />} />
            <Route path="login" element={<Login />} />
          </Route>

          <Route path="/" element={<ServiceLayout />}>
            <Route path="question-bank" element={<QuestionBank />} />
            <Route path="question-bank/:slug" element={<InstitutionQuestion />}>
              <Route path=":slug2" element={<InstitutionQuestion />} />
            </Route>
            <Route path="exam" element={<Exam />} />
            <Route path="doubt" element={<Doubt />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
