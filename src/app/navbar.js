"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

const logout = async () => {
  await fetch("/api/logout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  window.location.href = "/login";
};

export default function Navbar() {
  const pathname = usePathname();
  const showNavbar = pathname !== "/login";

  if (!showNavbar) {
    return null;
  }

  return (
    <div className="flex justify-between items-center p-4 border-b-2 border-gray-100">
      <a href="/enterprise-id">
        <Image src="/Logo.png" alt="Logo" width={150} height={100} />
      </a>
      <p></p>
      <nav>
        <button onClick={() => logout()} className="p-2">
          Logout
        </button>
      </nav>
    </div>
  );
}
