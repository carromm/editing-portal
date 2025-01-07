"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

export default function UpdateComponent({ sku, removeSku, enterpriseId }) {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadingImageState, setUploadingImageState] = useState(false);
  const [awsUrl, setAwsUrl] = useState(null);

  async function onAction() {
    uploadedImageHandler();

    const myHeaders = new Headers();
    myHeaders.append("accept", "application/json");
    myHeaders.append("Authorization", enterpriseId);

    const formdata = new FormData();
    formdata.append("sku_id", sku.sku_id);
    formdata.append("qc_status", "accepted");
    formdata.append("qc_comment", "done");
    formdata.append("batch_id", sku.batch_id ? sku.batch_id : "");

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: formdata,
      redirect: "follow",
    };

    const response = await fetch(
      "https://api.carromm.com/automobile/qc",
      requestOptions
    );

    const data = await response.json();
    console.log(data);
    alert("Success");
    removeSku(sku.sku_id);
  }

  async function uploadedImageHandler() {
    try {
      const myHeaders = new Headers();
      myHeaders.append("accept", "application/json");
      myHeaders.append("Authorization", enterpriseId);

      const formdata = new FormData();
      formdata.append("file_name", uploadedImage.name); 
      formdata.append("type", "editing");              

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: formdata,
        redirect: "follow"
      };

      const response = await fetch("https://api.carromm.com/s3/presigned-url", requestOptions);
      const data = await response.json();
      const presignedUrl = data.presigned_url; 
      const awsUrl = data.url; 
      console.log(awsUrl);
      setAwsUrl(awsUrl);

      
      const s3UploadResponse = await fetch(presignedUrl, {
        method: "PUT", 
        headers: {
          "Content-Type": uploadedImage.type, 
        },
        body: uploadedImage, 
      });

      if (!s3UploadResponse.ok) {
        throw new Error("Failed to upload image to S3");
      }

      console.log(s3UploadResponse);

      const myHeaders2 = new Headers();
      myHeaders2.append("accept", "application/json");
      myHeaders2.append("Authorization", enterpriseId);

      const formdata2 = new FormData();
      formdata2.append("sku_id", sku.sku_id);
      formdata2.append("image_url", awsUrl);
      formdata2.append("batch_id", sku.batch_id ? sku.batch_id : "");

      const requestOptions2 = {
        method: "POST",
        headers: myHeaders2,
        body: formdata2,
        redirect: "follow"
      };

      const response2 = await fetch(
        "https://api.carromm.com/automobile/editor",
        requestOptions2
      );

      const data2 = await response2.json();
      console.log(data2);

    } catch (error) {
      console.error("Error in uploadedImageHandler:", error);
    }
  }


  return (
    <div key={sku.sku_id} className="flex flex-col items-center px-10 ">
      <div className="flex flex-col md:flex-row p-4 gap-10">
        <div className="flex flex-col w-full md:w-5/12 gap-5 items-center">
          <div className="flex flex-col w-full bg-indigo-50 p-5 pl-10 gap-2 rounded-md border-indigo-500 border-2 shadow-md">
            <p className="font-bold">Rule library</p>
            <p className="bg-white text-sm p-2 px-3 w-fit rounded-md">
              SKU ID: {sku.sku_id}
            </p>
            <p className="bg-white text-sm p-2 px-3 w-fit rounded-md">
              Batch ID: {sku.batch_id}
            </p>
            <p className="hover:border-black border bg-white text-sm p-2 px-3 w-fit rounded-md">
              BG ID: {sku.bg_id}
            </p>
            <p className="hover:border-black border bg-white text-sm p-2 px-3 w-fit rounded-md">
              QC comments: {sku.qc_comment}
            </p>
          </div>
          <div className="flex h-full relative w-full justify-center">
            <Image
              src={sku.input_url ? sku.input_url : "/loading.gif"}
              width={450}
              height={450}
              alt="Input Image"
              className="object-contain"
            />
          </div>
        </div>
        <div className="flex w-full md:w-7/12 h-min relative">
          <Image
            src={sku.output_url ? sku.output_url : "/loading.gif"}
            width={900}
            height={900}
            alt="Output Image"
            className="rounded-md object-contain"
          />
        </div>
      </div>

      <div className="flex flex-row items-end w-full mt-4 ">
        <div className="flex h-full relative w-full justify-center items-end">
          <div className="relative">
            <Image
              src={uploadedImage || "/vercel.svg"}
              width={500}
              height={500}
              alt="Input Image"
              className="object-contain"
            />
            <div className="absolute inset-0 bg-none"></div>
            <label
              className="flex items-center justify-center absolute inset-0 cursor-pointer bg-gray-500 bg-opacity-50 hover:bg-opacity-70 rounded-md
            "
              htmlFor="fileInput"
            >
              <div className="text-center text-white">
                <p className="text-2xl font-bold">
                  {uploadingImageState
                    ? "Uploading"
                    : uploadedImage
                      ? "Change"
                      : "Upload"}
                </p>
              </div>
            </label>
          </div>
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              setUploadingImageState(true);
              const reader = new FileReader();
              reader.onloadend = () => {
                const imageUrl = reader.result;
                setUploadedImage(imageUrl);
              };
              reader.readAsDataURL(file);
              setUploadingImageState(false);
            }
          }}
          className="hidden"
          id="fileInput"
        />
        <button
          className="bg-black text-white p-4 px-8 rounded-md text-2xl font-bold"
          onClick={() => onAction()}
        >
          Approve
        </button>
      </div>
    </div>
  );
}
