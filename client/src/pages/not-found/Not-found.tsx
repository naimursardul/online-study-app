import { Frown } from "lucide-react";

function NotFound() {
  return (
    <div className="h-screen w-screen flex flex-col gap-2 justify-center items-center">
      <Frown size={"120px"} className="text-muted-foreground font-light" />
      <h1 className="text-5xl text-accent-foreground font-bold mt-3">404!</h1>
      <div className="font-bold">Page Not found</div>
    </div>
  );
}

export default NotFound;
