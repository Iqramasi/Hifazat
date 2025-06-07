// Anime-themed Homepage (React + TailwindCSS)

import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="bg-yellow-100 min-h-screen p-6 font-sans">
      {/* Header */}
      <header className="flex justify-between items-center p-4 bg-black text-white rounded-t-2xl">
        <h1 className="text-xl font-bold">AniMagi</h1>
        <nav className="space-x-6">
          <Link to="/" className="border-b-2 border-yellow-400 pb-1">HOME</Link>
          <Link to="/blog">BLOG</Link>
          <Link to="/contact">CONTACT US</Link>
          <Link to="/download">DOWNLOAD</Link>
        </nav>
        <button className="bg-white text-black px-4 py-1 rounded">LOGIN</button>
      </header>

      {/* Main Content */}
      <main className="mt-10 flex flex-col items-center">
        <h2 className="text-5xl font-extrabold text-black mb-4">Dive Into The World Of Anime!</h2>

        <div className="my-6 w-[150px] h-[150px] border-dotted border-2 border-black rounded-full flex items-center justify-center text-center">
          <span className="text-xs font-medium leading-tight">Character Generation<br />START<br />GENERATE</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10 max-w-5xl">
          <img src="https://i.pinimg.com/564x/99/f0/7c/99f07c460c217099c346107fb1f1739d.jpg" alt="Anime 1" className="rounded-xl" />
          <div className="bg-white border border-black rounded-lg p-4 shadow-md">
            <h3 className="text-lg font-semibold">SMARTPHONE APP MEMES</h3>
            <p className="text-sm mt-2">The smartphone application MEMES, where ANIMAGI serves as the core technology behind, is now available in Apple App Store & Google Play.</p>
            <button className="bg-black text-yellow-400 px-4 py-2 mt-4 rounded">DOWNLOAD</button>
          </div>
        </div>

        <img src="https://i.pinimg.com/564x/96/f2/c5/96f2c5089ac63a4ccf73eb7a5826dca7.jpg" alt="Anime 2" className="rounded-xl mt-10 w-[350px]" />
      </main>
    </div>
  );
}

export default Home;
