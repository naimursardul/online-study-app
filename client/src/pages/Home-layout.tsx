import NavbarAuth from "@/components/NavbarAuth/NavbarAuth";
import Navbar from "@/components/navbar/Navbar";
import { Outlet } from "react-router-dom";

function HomeLayout() {
  return (
    <div>
      <div className="w-full flex justify-between items-center gap-1 py-4 px-10">
        <Navbar />
        <NavbarAuth />
      </div>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default HomeLayout;
