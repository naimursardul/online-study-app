import { Link } from "react-router-dom";
import { Folder, ChevronRight, FolderOpen } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMasterData } from "@/lib/MasterData-context";

export default function Collection() {
  const { masterData, masterDataLoading: isLoading } = useMasterData();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl p-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="space-y-4 p-6">
                <Skeleton className="h-14 w-14 rounded-xl" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (masterData?.collections.length === 0) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg items-center justify-center p-6">
        <Card className="w-full">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <div className="rounded-full bg-primary/10 p-5">
              <FolderOpen className="size-12 text-primary" />
            </div>

            <h2 className="mt-6 text-2xl font-semibold">No Collections Yet</h2>

            <p className="mt-3 max-w-sm text-muted-foreground">
              Save questions into collections to organize your study materials.
              Your collections will appear here.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Collections</h1>
        <p className="mt-2 text-muted-foreground">
          Organize and access your saved questions.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {masterData?.collections.map((collection) => (
          <Link
            key={collection._id}
            to={`/collections/${collection._id}`}
            className="group"
          >
            <Card className="h-full transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg">
              <CardContent className="flex h-full flex-col p-6">
                <div className="flex items-start justify-between">
                  <div className="rounded-xl bg-primary/10 p-3 transition-colors group-hover:bg-primary/15">
                    <Folder className="size-8 text-primary" />
                  </div>

                  <ChevronRight className="size-5 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1" />
                </div>

                <div className="mt-6 flex-1">
                  <h2 className="line-clamp-2 text-lg font-semibold leading-snug">
                    {collection.name}
                  </h2>

                  <p className="mt-3 text-sm text-muted-foreground">
                    Created{" "}
                    {new Date(collection.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
