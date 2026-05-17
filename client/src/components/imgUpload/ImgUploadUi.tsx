import { useRef, useState } from "react";
import { ImagePlus, Copy, Loader2, ImagePlusIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

import { uploadImage } from "@/utils/uploadImage";

export default function FloatingUploadWidget() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [folderName, setFolderName] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);

  const [isUploading, setIsUploading] = useState(false);

  const [imgKey, setImgKey] = useState<string | null>(null);

  const handleImageSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!folderName.trim()) {
      toast.error("Folder name is required before upload.");
      return;
    }

    try {
      setIsUploading(true);
      setImageFile(file);

      const uploaded = await uploadImage({
        file,
        folder: folderName.trim(),
      });

      setImgKey(uploaded.key);

      const stored = localStorage.getItem("recently_uploaded_urls");
      const recent = stored ? JSON.parse(stored) : [];
      const updatedRecent = [
        uploaded.key,
        ...recent.filter((url: string) => url !== uploaded.key),
      ].slice(0, 5);
      localStorage.setItem(
        "recently_uploaded_urls",
        JSON.stringify(updatedRecent),
      );

      toast.success("Image uploaded");
    } catch (error) {
      console.error(error);
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);

      toast.success("Copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            size="icon"
            className="h-14 w-14 rounded-full shadow-lg cursor-pointer"
          >
            <ImagePlusIcon className="h-6 w-6" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          side="top"
          align="end"
          className="w-105 overflow-hidden rounded-2xl p-0"
        >
          <div className="flex max-h-137.5 flex-col">
            {/* Header */}
            <div className="border-b p-4">
              <h3 className="text-lg font-semibold">Upload Images</h3>

              <p className="text-sm text-muted-foreground">
                Upload image and copy URL.
              </p>
            </div>

            {/* Scroll Area */}
            <ScrollArea className="h-120">
              <div className="space-y-5 p-4">
                {/* Folder Name */}
                <div className="space-y-2">
                  <Label>
                    Folder Name <span className="text-red-500">*</span>
                  </Label>

                  <Input
                    placeholder="questions"
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                  />
                </div>

                {/* Upload */}
                <div className="space-y-2">
                  <Label>Upload Image</Label>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageSelect}
                  />

                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <ImagePlus className="h-4 w-4" />
                        Upload Image
                      </>
                    )}
                  </Button>

                  {imageFile && (
                    <p className="text-xs break-all text-muted-foreground">
                      Selected: {imageFile.name}
                    </p>
                  )}
                </div>

                {/* Uploaded URL */}
                <div className="space-y-2">
                  <Label>Uploaded URL</Label>

                  {!imgKey ? (
                    <p className="text-sm text-muted-foreground">
                      No uploads yet.
                    </p>
                  ) : (
                    <div className="overflow-hidden rounded-xl border p-3">
                      <p className="mb-3 truncate text-sm font-medium">
                        {imageFile?.name}
                      </p>

                      <div className="flex gap-3">
                        {/* Image Preview */}
                        <div className="h-28 w-28 shrink-0 overflow-hidden rounded-lg border bg-muted">
                          <img
                            src={`${import.meta.env.VITE_CDN_BASE_URL}/${imgKey}`}
                            alt={imageFile?.name}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        {/* URL */}
                        <div className="w-full flex gap-1">
                          <p className="break-all bg-muted text-xs text-muted-foreground p-2 rounded-md">
                            {`${import.meta.env.VITE_CDN_BASE_URL}/${imgKey}`}
                          </p>

                          <Button
                            size="icon"
                            variant="ghost"
                            className="cursor-pointer"
                            onClick={() =>
                              handleCopy(
                                `${import.meta.env.VITE_CDN_BASE_URL}/${imgKey}`,
                              )
                            }
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Recent URLs */}
                <div className="space-y-2">
                  <Label>Recent URLs</Label>

                  {JSON.parse(
                    localStorage.getItem("recently_uploaded_urls") || "[]",
                  ).length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No recent URLs.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {JSON.parse(
                        localStorage.getItem("recently_uploaded_urls") || "[]",
                      ).map((key: string, index: number) => (
                        <div
                          key={index}
                          className="overflow-hidden rounded-xl border p-3"
                        >
                          <div className="flex gap-3">
                            {/* Image Preview */}
                            <div className="h-28 w-28 shrink-0 overflow-hidden rounded-lg border bg-muted">
                              <img
                                src={`${import.meta.env.VITE_CDN_BASE_URL}/${key}`}
                                alt={imageFile?.name}
                                className="h-full w-full object-cover"
                              />
                            </div>

                            {/* URL */}
                            <div className="w-full flex gap-1">
                              <p className="break-all  bg-muted text-xs text-muted-foreground p-2 rounded-md">
                                {`${import.meta.env.VITE_CDN_BASE_URL}/${key}`}
                              </p>

                              <Button
                                size="icon"
                                variant="ghost"
                                className="cursor-pointer shrink-0 self-start"
                                onClick={() =>
                                  handleCopy(
                                    `${import.meta.env.VITE_CDN_BASE_URL}/${key}`,
                                  )
                                }
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
