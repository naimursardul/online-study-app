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
  const activePath = (p: string) => (pathname === p ? "bg-muted" : "");
  return (
    <NavigationMenu>
      <NavigationMenuList className="gap-2 max-sm:gap-1">
        <NavigationMenuItem>
          <NavigationMenuLink className={activePath("/") + "max-sm:p-1.5"}>
            <Link to="/" className="font-medium max-sm:text-sm">
              Home
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger className="font-medium max-sm:text-sm max-sm:pr-1 max-sm:px-1.5 max-sm:h-8">
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
          <NavigationMenuLink className={activePath("/about") + "max-sm:p-1.5"}>
            <Link to="/about" className="font-medium max-sm:text-sm">
              About
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            className={activePath("/contact") + "max-sm:p-1.5"}
          >
            <Link to="/contact" className="font-medium max-sm:text-sm">
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
