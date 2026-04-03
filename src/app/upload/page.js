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

  const [skuList, setSkuList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 1;
  const [loading, setLoading] = useState(false);

  const [createdAtFrom, setCreatedAtFrom] = useState("");
  const [createdAtTo, setCreatedAtTo] = useState("");
  const [skuIdFilter, setSkuIdFilter] = useState("");

  async function fetchSkuData() {
    setLoading(true);
    const params = new URLSearchParams();
    if (createdAtFrom) params.append("created_at_from", createdAtFrom.replace("T", " ") + ":00");
    if (createdAtTo) params.append("created_at_to", createdAtTo.replace("T", " ") + ":00");
    if (skuIdFilter.trim()) params.append("sku_id", skuIdFilter.trim());

    const queryString = params.toString();
    const url = `https://api.imagekoncept.com/automobile/editor${queryString ? `?${queryString}` : ""}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: enterpriseId,
        },
        redirect: "follow",
      });
      const data = await response.json();
      console.log(data);
      if (data.message === "Unauthorized") {
        alert("Invalid enterprise id");
        router.push("/enterprise-id");
        return;
      } else {
        if (Array.isArray(data)) {
          setSkuList(data);
          setCurrentPage(1);
        } else {
          alert.error("Something went wrong, please try again in some time.");
          router.push("/enterprise-id");
          return;
        }
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSkuData();
  }, [enterpriseId]);

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
    <div className="flex flex-col">
      <div className="flex flex-wrap items-end gap-4 p-4 bg-gray-50 rounded-md mb-4 mx-10">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">From</label>
          <input
            type="datetime-local"
            value={createdAtFrom}
            onChange={(e) => setCreatedAtFrom(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">To</label>
          <input
            type="datetime-local"
            value={createdAtTo}
            onChange={(e) => setCreatedAtTo(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">SKU ID</label>
          <input
            type="text"
            value={skuIdFilter}
            onChange={(e) => setSkuIdFilter(e.target.value)}
            placeholder="Enter SKU ID"
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
        <button
          onClick={fetchSkuData}
          disabled={loading}
          className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 text-sm font-medium"
        >
          {loading ? "Loading..." : "Apply Filters"}
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {skuList.length === 0 && !loading ? (
          <p className="text-center text-gray-500 py-8">No results found</p>
        ) : (
          currentItems.map((sku) => (
            <UpdateComponent
              key={sku.sku_id}
              sku={sku}
              removeSku={removeSku}
              enterpriseId={enterpriseId}
            />
          ))
        )}
        {skuList.length > 0 && (
          <div className="flex justify-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="px-4 py-2 text-white bg-blue-500 rounded disabled:bg-gray-300"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-gray-600">
              {currentPage} / {Math.ceil(skuList.length / itemsPerPage)}
            </span>
            <button
              onClick={handleNextPage}
              disabled={startIndex + itemsPerPage >= skuList.length}
              className="px-4 py-2 text-white bg-blue-500 rounded disabled:bg-gray-300"
            >
              Next
            </button>
          </div>
        )}
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
