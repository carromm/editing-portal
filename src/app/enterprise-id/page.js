"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [enterpriseId, setEnterpriseId] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const params = new URLSearchParams({ enterpriseId });
    router.push(`/upload?${params.toString()}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-5 w-1/3">
        <p className="text-xl font-bold">Enterprise-ID </p>
        <input
          type="text"
          placeholder="Enter the enterprise id here"
          className="border-none outline-none flex-grow p-3 px-5 bg-indigo-100 border-2 rounded-md"
          value={enterpriseId}
          onChange={(e) => setEnterpriseId(e.target.value)}
        />
        <button type="submit" className="bg-white text-blue-700 border-2 border-blue-500 rounded-md p-2 mt-6 ">Submit</button>
      </form>
    </div>
  );
}