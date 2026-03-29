import Navbar from "@/components/navbar/Navbar";
import { Outlet } from "react-router-dom";

function HomeLayout() {
  return (
    <div>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default HomeLayout;
