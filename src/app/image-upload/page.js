"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { BarLoader } from "react-spinners";

function ImageUploadPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const enterpriseId = searchParams.get("enterpriseId");

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    setFile(selected);
    setUploadedUrl(null);
    setCopied(false);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(selected);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select an image first");
      return;
    }
    if (!enterpriseId) {
      alert("Missing enterprise id");
      router.push("/enterprise-id");
      return;
    }

    setUploading(true);
    setUploadedUrl(null);
    setCopied(false);

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
            file_name: file.name.replace(/\s/g, "_"),
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
        body: file,
      });

      if (!s3Response.ok) {
        throw new Error("Failed to upload image to S3");
      }

      setUploadedUrl(finalUrl);
    } catch (err) {
      console.log(err);
      alert("Failed to upload image, try again after some time");
    } finally {
      setUploading(false);
    }
  };

  const handleCopy = async () => {
    if (!uploadedUrl) return;
    try {
      await navigator.clipboard.writeText(uploadedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Failed to copy");
    }
  };

  return (
    <div className="flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-xl flex flex-col gap-6 p-6 bg-indigo-50 rounded-md border-2 border-indigo-500 shadow-md">
        <p className="text-xl font-bold">Upload Image</p>

        <label
          htmlFor="imageUploadInput"
          className="flex items-center justify-center h-64 rounded-md cursor-pointer bg-white border-2 border-dashed border-indigo-400 hover:bg-indigo-100 overflow-hidden"
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Preview"
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <span className="text-gray-500">Click to select an image</span>
          )}
        </label>
        <input
          id="imageUploadInput"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        <BarLoader color="#000" height={6} width="100%" loading={uploading} />

        <button
          onClick={handleUpload}
          disabled={uploading || !file}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold rounded-md py-3"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>

        {uploadedUrl && (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-gray-700">Uploaded URL</p>
            <div className="flex items-stretch gap-2">
              <input
                type="text"
                readOnly
                value={uploadedUrl}
                className="flex-grow border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
                onFocus={(e) => e.target.select()}
              />
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-black text-white rounded-md text-sm font-medium"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        )}
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
