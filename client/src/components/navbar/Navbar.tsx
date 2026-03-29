import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <nav>
      <ul className="w-full flex gap-5 justify-center">
        <li>
          <NavLink to={"/"}>Home</NavLink>
        </li>
        <li>
          <NavLink to={"/about"}>About</NavLink>
        </li>
        <li>
          <NavLink to={"/admin"}>Admin</NavLink>
        </li>
        <li>
          <NavLink to={"/question-bank"}>QB</NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
