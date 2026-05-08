import Navbar from "@/components/navbar/Navbar";
import { Outlet } from "react-router-dom";

function HomeLayout() {
  return (
    <div>
      <div className="w-full flex justify-center my-4">
        <Navbar />
      </div>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default HomeLayout;
