import NavbarAuth from "../NavbarAuth/NavbarAuth";

export default function ServiceNavbar() {
  return (
    <div className="w-full flex justify-between items-center gap-2">
      <h2 className="text-2xl max-md:text-xl font-semibold">Question Bank</h2>
      <NavbarAuth />
    </div>
  );
}
