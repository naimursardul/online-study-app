import NavbarAuth from "@/components/NavbarAuth/NavbarAuth";
import Navbar from "@/components/navbar/Navbar";
import SiteBrand from "@/components/layout/SiteBrand";
import SiteFooter from "@/components/layout/SiteFooter";
import { Outlet } from "react-router-dom";

function HomeLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* z-40 keeps this under the mobile tab bar (z-50) in Navbar. */}
      <header className="sticky top-0 z-40 border-b border-border">
        {/* The blur sits on a child, not on <header>. backdrop-filter makes an
            element a containing block for position:fixed descendants, and
            Navbar's mobile tab bar (fixed bottom-0) renders inside this header —
            blurring the header itself would re-anchor that bar to the header
            instead of the viewport. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-background/80 backdrop-blur-md"
        />
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-3 md:px-10">
          <SiteBrand />
          <div className="flex items-center gap-1">
            <Navbar />
            <NavbarAuth />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <SiteFooter />
    </div>
  );
}

export default HomeLayout;
