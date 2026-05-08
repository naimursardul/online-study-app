import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Link, useLocation } from "react-router-dom";

export default function NavBar() {
  const { pathname } = useLocation();
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink className={pathname === "/" ? "bg-muted" : ""}>
            <Link to="/" className="font-medium">
              Home
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger className="font-medium">
            Services
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="w-96 max-sm:w-64">
              <ListItem href="/question-bank" title="Question Bank">
                Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sunt
                asperiores tempore recusandae iste, sequi
              </ListItem>
              <ListItem href="/exam" title="Exam">
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Repellat, sunt?
              </ListItem>
              <ListItem href="/doubt" title="Doubt">
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Nesciunt eum id nam vitae.
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            className={pathname === "/about" ? "bg-muted" : ""}
          >
            <Link to="/about" className="font-medium">
              About
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            className={pathname === "/contact" ? "bg-muted" : ""}
          >
            <Link to="/contact" className="font-medium">
              Contact
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function ListItem({
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link to={href}>
          <div className="flex flex-col gap-1 text-sm">
            <div className="leading-none font-medium">{title}</div>
            <div className="line-clamp-2 text-muted-foreground">{children}</div>
          </div>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}
