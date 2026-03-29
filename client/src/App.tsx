import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home.tsx";
import About from "./pages/About.tsx";
import QuestionBank from "./pages/service-pages/Question-bank.tsx";
import Exam from "./pages/service-pages/Exam.tsx";
import Doubt from "./pages/service-pages/Doubt.tsx";
import ServiceLayout from "./pages/service-pages/Service-layout.tsx";
import Signup from "./pages/Signup.tsx";
import Login from "./pages/Login.tsx";
import HomeLayout from "./pages/HomeLayout.tsx";
import NotFoundPage from "./pages/Not-found-page.tsx";
import Admin from "./pages/Admin.tsx";
import ProtectedRoute from "./lib/Protected-route.tsx";

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
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
          </Route>
          <Route path="/" element={<ServiceLayout />}>
            <Route path="/question-bank" element={<QuestionBank />} />
            <Route path="/exam" element={<Exam />} />
            <Route path="/doubt" element={<Doubt />} />
          </Route>
          <Route path="/*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
