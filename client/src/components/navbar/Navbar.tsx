import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  House,
  Grid2X2,
  Info,
  Mail,
  BookOpen,
  FileText,
  CircleHelp,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function NavBar() {
  const { pathname } = useLocation();

  const activePath = (p: string) =>
    pathname === p ? "bg-muted text-foreground" : "";

  const serviceActive =
    pathname.startsWith("/question-bank") ||
    pathname.startsWith("/exam") ||
    pathname.startsWith("/doubt");

  return (
    <>
      {/* ================= Desktop Navbar ================= */}
      <div className="max-sm:hidden ">
        <NavigationMenu>
          <NavigationMenuList className="gap-2">
            <NavigationMenuItem>
              <NavigationMenuLink
                className={`${activePath("/")} rounded-md px-4 py-2`}
                asChild
              >
                <Link to="/" className="font-medium">
                  Home
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger
                className={`font-medium ${serviceActive ? "bg-muted" : ""}`}
              >
                Services
              </NavigationMenuTrigger>

              <NavigationMenuContent>
                <ul className="w-96 p-2">
                  <ListItem href="/question-bank" title="Question Bank">
                    Browse practice questions and prepare efficiently.
                  </ListItem>

                  <ListItem href="/exam" title="Exam">
                    Take exams and track your performance.
                  </ListItem>

                  <ListItem href="/doubt" title="Doubt">
                    Ask questions and clear your confusion.
                  </ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink
                className={`${activePath("/about")} rounded-md px-4 py-2`}
                asChild
              >
                <Link to="/about" className="font-medium">
                  About
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink
                className={`${activePath("/contact")} rounded-md px-4 py-2`}
                asChild
              >
                <Link to="/contact" className="font-medium">
                  Contact
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      {/* ================= Mobile Bottom Navbar ================= */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background sm:hidden">
        <div className="grid h-16 grid-cols-4 px-2">
          <MobileNavItem
            to="/"
            label="Home"
            icon={<House size={20} />}
            active={pathname === "/"}
          />

          {/* Services */}
          <div className="group relative flex items-center justify-center">
            {/* Popup Menu */}
            <div
              className="
                invisible absolute bottom-16 left-1/2 z-50
                w-56 -translate-x-1/2 scale-95 rounded-2xl
                border bg-background p-2 opacity-0 shadow-lg
                transition-all duration-200
                group-hover:visible
                group-hover:scale-100
                group-hover:opacity-100
                group-focus-within:visible
                group-focus-within:scale-100
                group-focus-within:opacity-100
              "
            >
              <PopupItem
                to="/question-bank"
                title="Question Bank"
                icon={<BookOpen size={16} />}
              />

              <PopupItem
                to="/exam"
                title="Exam"
                icon={<FileText size={16} />}
              />

              <PopupItem
                to="/doubt"
                title="Doubt"
                icon={<CircleHelp size={16} />}
              />
            </div>

            {/* Trigger */}
            <button
              className={`
                flex h-full w-full flex-col
                items-center justify-center rounded-2xl
                transition-colors
                ${
                  serviceActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground"
                }
              `}
            >
              <Grid2X2 size={20} />
              <span className="text-xs font-medium">Services</span>
            </button>
          </div>

          <MobileNavItem
            to="/about"
            label="About"
            icon={<Info size={20} />}
            active={pathname === "/about"}
          />

          <MobileNavItem
            to="/contact"
            label="Contact"
            icon={<Mail size={20} />}
            active={pathname === "/contact"}
          />
        </div>
      </nav>
    </>
  );
}

function MobileNavItem({
  to,
  icon,
  label,
  active,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      className={`
        flex flex-col items-center justify-center rounded-2xl
        transition-colors
        ${active ? "bg-primary/10 text-primary" : "text-muted-foreground"}
      `}
    >
      {icon}

      <span className="text-xs font-medium">{label}</span>
    </Link>
  );
}

function PopupItem({
  to,
  title,
  icon,
}: {
  to: string;
  title: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className="
        flex items-center gap-3 rounded-xl
        p-3 transition-colors hover:bg-muted
      "
    >
      {icon}

      <span className="text-sm font-medium">{title}</span>
    </Link>
  );
}

function ListItem({
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & {
  href: string;
}) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link
          to={href}
          className="
            block rounded-md p-3
            hover:bg-muted transition-colors
          "
        >
          <div className="flex flex-col gap-1 text-sm">
            <div className="leading-none font-medium">{title}</div>

            <div className="line-clamp-2 text-muted-foreground">{children}</div>
          </div>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}
