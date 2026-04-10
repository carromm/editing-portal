"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const logout = async () => {
  await fetch("/api/logout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  window.location.href = "/login";
};

const TABS = [
  { href: "/upload", label: "SKU Editor" },
  { href: "/image-upload", label: "Image Upload" },
];

function NavbarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const showNavbar = pathname !== "/login";

  if (!showNavbar) {
    return null;
  }

  const enterpriseId = searchParams.get("enterpriseId");
  const showTabs = Boolean(enterpriseId);

  const buildHref = (href) => {
    if (!enterpriseId) return href;
    const params = new URLSearchParams({ enterpriseId });
    return `${href}?${params.toString()}`;
  };

  return (
    <div className="flex justify-between items-center p-4 border-b-2 border-gray-100">
      <a href="/enterprise-id">
        <Image src="/Logo.png" alt="Logo" width={150} height={100} />
      </a>
      {showTabs ? (
        <nav className="flex gap-2">
          {TABS.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={buildHref(tab.href)}
                className={`px-4 py-2 rounded-md text-sm font-medium border-2 ${
                  isActive
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-indigo-600 border-indigo-200 hover:border-indigo-500"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      ) : (
        <p></p>
      )}
      <nav>
        <button onClick={() => logout()} className="p-2">
          Logout
        </button>
      </nav>
    </div>
  );
}

export default function Navbar() {
  return (
    <Suspense fallback={null}>
      <NavbarContent />
    </Suspense>
  );
}
