"use client";

import Image from "next/image";
import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import UpdateComponent from "./updateComponent";
import { useSearchParams } from "next/navigation";

function UpdatePage() {
  const searchParams = useSearchParams();
  const enterpriseId = searchParams.get("enterpriseId");
  const router = useRouter();

  const [skuList, setSkuList] = useState([
    {
      "sku_id": "Loading...",
      "batch_id": "Loading...",
      "bg_id": "Loading...",
      "model_version": "Loading...",
      "input_url": null,
      "output_url": null,
      "qc_url": "",
      "qc_comment": "",
      "status": "Loading...",
    }]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 1;

  useEffect(() => {
    async function fetchSkuData() {
      const response = await fetch("/api/getSkuList", {
        method: "GET",
        headers: {
          "Authorization": enterpriseId,
        },
      });
      const data = await response.json();
      if (data.message === "Unauthorized") {
        alert("Unauthorized");
        router.push("/enterprise-id");
        return;
      }
      else {
        if (Array.isArray(data)) {
          setSkuList(data);
        } else {
          alert.error("Server response error");
          router.push("/enterprise-id");
          return;
        }

      }
    }

    fetchSkuData();
  }, [enterpriseId, router]);

  const handleNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handlePrevPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const removeSku = (skuId) => {
    setSkuList((prevList) => prevList.filter((sku) => sku.sku_id !== skuId));
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = skuList.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="flex">
      <div className="flex flex-col gap-4">
        {currentItems.map((sku) => (
          <UpdateComponent
            key={sku.sku_id}
            sku={sku}
            removeSku={removeSku}
          />
        ))}
        <div className="flex justify-center gap-2">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="px-4 py-2 text-white bg-blue-500 rounded disabled:bg-gray-300"
          >
            Previous
          </button>
          <button
            onClick={handleNextPage}
            disabled={startIndex + itemsPerPage >= skuList.length}
            className="px-4 py-2 text-white bg-blue-500 rounded disabled:bg-gray-300"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Update() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UpdatePage />
    </Suspense>
  );
}