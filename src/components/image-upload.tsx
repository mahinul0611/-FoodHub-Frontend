"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui";
import { useToast } from "@/lib/toast-context";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "";

export function ImageUpload({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      toast("Image upload is not configured.", "error");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast("Please choose an image file.", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast("Image must be under 5 MB.", "error");
      return;
    }

    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("upload_preset", UPLOAD_PRESET);

      const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
      const res = await fetch(uploadUrl, { method: "POST", body });
      const data = await res.json();

      if (!res.ok || !data.secure_url) {
        throw new Error(data.error?.message ?? "Upload failed.");
      }

      onChange(data.secure_url);
      toast("Image uploaded!", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Upload failed.", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt="Meal"
          className="h-32 w-full rounded-lg border border-neutral-200 object-cover"
        />
      ) : (
        <div className="flex h-32 w-full items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50 text-sm text-neutral-400">
          No image yet
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />
      <div className="flex gap-2">
        <Button
          type="button"
          variant="secondary"
          loading={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {value ? "Replace image" : "Upload image"}
        </Button>
        {value ? (
          <Button type="button" variant="ghost" onClick={() => onChange("")}>
            Remove
          </Button>
        ) : null}
      </div>
    </div>
  );
}