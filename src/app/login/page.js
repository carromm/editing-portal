"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    

    if (res.ok) {
      router.push('/enterprise-id');
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 gap-3">
      <Image src='/Logo.png' alt="Logo" width={250} height={250} />
      <Image src='/LoginIcon.png' alt="Login Icon" width={100} height={100} />
      <h1 className="text-4xl font-bold">Sign-in</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-5">
        <div className="flex items-center border-2 border-black rounded-md p-2 w-80">
          <input
            type="text"
            placeholder="Username"
            className="border-none outline-none flex-grow p-1"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="flex items-center border-2 border-black rounded-md p-2">
          <input
            type="password"
            placeholder="Password"
            className="border-none outline-none flex-grow p-1"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="bg-black text-white border-none rounded-md p-1">Submit</button>
        </div>
      </form>

      <p className="text-sm text-center mt-4 text-gray-500">
        By signing in, you agree to our <a href="/terms" className="text-indigo-700">Terms of Service</a> <br />
        and <a href="/privacy" className="text-indigo-700">Privacy Policy</a>
      </p>
    </div>
  );
}