import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="rounded-full transition-all duration-300 hover:scale-105 cursor-pointer"
    >
      {theme === "dark" ? (
        <Sun className="size-5 text-yellow-500" />
      ) : (
        <Moon className="size-5 text-slate-700 dark:text-slate-300" />
      )}
    </Button>
  );
}
