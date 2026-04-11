"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { BarLoader } from "react-spinners";

function ImageUploadPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const enterpriseId = searchParams.get("enterpriseId");

  const [items, setItems] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const readPreview = (file) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });

  const handleFileChange = async (e) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;

    const newItems = await Promise.all(
      selected.map(async (file) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        previewUrl: await readPreview(file),
        status: "pending",
        uploadedUrl: null,
        error: null,
      }))
    );

    setItems((prev) => [...prev, ...newItems]);
    e.target.value = "";
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const updateItem = (id, patch) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...patch } : it))
    );
  };

  const uploadOne = async (item) => {
    updateItem(item.id, { status: "uploading", error: null });

    try {
      const presignedResponse = await fetch(
        "https://api.carromm.com/s3/presigned-url",
        {
          method: "POST",
          headers: {
            accept: "application/json",
            Authorization: enterpriseId,
          },
          body: JSON.stringify({
            file_name: item.file.name.replace(/\s/g, "_"),
            type: "editing",
          }),
          redirect: "follow",
        }
      );

      if (!presignedResponse.ok) {
        throw new Error("Failed to generate presigned URL");
      }

      const { presigned_url: presignedUrl, url: finalUrl } =
        await presignedResponse.json();

      const s3Response = await fetch(presignedUrl, {
        method: "PUT",
        body: item.file,
      });

      if (!s3Response.ok) {
        throw new Error("Failed to upload image to S3");
      }

      updateItem(item.id, { status: "done", uploadedUrl: finalUrl });
    } catch (err) {
      console.log(err);
      updateItem(item.id, { status: "error", error: err.message });
    }
  };

  const handleUpload = async () => {
    const pending = items.filter(
      (it) => it.status === "pending" || it.status === "error"
    );
    if (pending.length === 0) {
      alert("Please select at least one image");
      return;
    }
    if (!enterpriseId) {
      alert("Missing enterprise id");
      router.push("/enterprise-id");
      return;
    }

    setUploading(true);
    setCopiedAll(false);
    await Promise.all(pending.map((it) => uploadOne(it)));
    setUploading(false);
  };

  const handleCopy = async (id, url) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 2000);
    } catch {
      alert("Failed to copy");
    }
  };

  const handleCopyAll = async () => {
    const urls = items
      .filter((it) => it.uploadedUrl)
      .map((it) => it.uploadedUrl)
      .join("\n");
    if (!urls) return;
    try {
      await navigator.clipboard.writeText(urls);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch {
      alert("Failed to copy");
    }
  };

  const hasPending = items.some(
    (it) => it.status === "pending" || it.status === "error"
  );
  const doneCount = items.filter((it) => it.status === "done").length;

  return (
    <div className="flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-3xl flex flex-col gap-6 p-6 bg-indigo-50 rounded-md border-2 border-indigo-500 shadow-md">
        <div className="flex items-center justify-between">
          <p className="text-xl font-bold">Upload Images</p>
          {items.length > 0 && (
            <p className="text-sm text-gray-600">
              {doneCount}/{items.length} uploaded
            </p>
          )}
        </div>

        <label
          htmlFor="imageUploadInput"
          className="flex items-center justify-center h-32 rounded-md cursor-pointer bg-white border-2 border-dashed border-indigo-400 hover:bg-indigo-100"
        >
          <span className="text-gray-500">
            Click to select one or more images
          </span>
        </label>
        <input
          id="imageUploadInput"
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />

        {items.length > 0 && (
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 bg-white rounded-md border border-gray-200"
              >
                <img
                  src={item.previewUrl}
                  alt={item.file.name}
                  className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                />
                <div className="flex flex-col flex-grow min-w-0 gap-1">
                  <p className="text-sm font-medium truncate">
                    {item.file.name}
                  </p>
                  {item.status === "pending" && (
                    <p className="text-xs text-gray-500">Ready to upload</p>
                  )}
                  {item.status === "uploading" && (
                    <p className="text-xs text-indigo-600">Uploading...</p>
                  )}
                  {item.status === "error" && (
                    <p className="text-xs text-red-600">
                      {item.error || "Upload failed"}
                    </p>
                  )}
                  {item.status === "done" && item.uploadedUrl && (
                    <div className="flex items-stretch gap-2">
                      <input
                        type="text"
                        readOnly
                        value={item.uploadedUrl}
                        className="flex-grow border border-gray-300 rounded-md px-2 py-1 text-xs bg-gray-50"
                        onFocus={(e) => e.target.select()}
                      />
                      <button
                        onClick={() => handleCopy(item.id, item.uploadedUrl)}
                        className="px-3 py-1 bg-black text-white rounded-md text-xs font-medium"
                      >
                        {copiedId === item.id ? "Copied" : "Copy"}
                      </button>
                    </div>
                  )}
                </div>
                {item.status !== "uploading" && (
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-gray-400 hover:text-red-600 text-lg px-2 flex-shrink-0"
                    aria-label="Remove"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <BarLoader color="#000" height={6} width="100%" loading={uploading} />

        <div className="flex gap-2">
          <button
            onClick={handleUpload}
            disabled={uploading || !hasPending}
            className="flex-grow bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold rounded-md py-3"
          >
            {uploading ? "Uploading..." : "Upload All"}
          </button>
          {doneCount > 0 && (
            <button
              onClick={handleCopyAll}
              className="px-4 py-3 bg-black text-white rounded-md text-sm font-medium"
            >
              {copiedAll ? "Copied" : "Copy All URLs"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ImageUpload() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ImageUploadPage />
    </Suspense>
  );
}
