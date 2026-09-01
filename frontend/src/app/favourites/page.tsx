"use client";
import Navbar from "@/components/navbar/page";
import { useState, useEffect } from "react";
import apiClient from "@/lib/axios";
import { HiHeart } from "react-icons/hi2";

type Recipe = {
  _id: string;
  name: string;
  brief?: string;
  description?: string;
  image: string;
};

function Favourites() {
  const [favourites, setFavourites] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get("/user/favourites")
      .then((response) => setFavourites(response.data.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-white text-black">
      <Navbar />
      <div className="pt-24">
        <section className="relative overflow-hidden bg-orange-400 px-6 pb-16 pt-12 text-center" />
        {loading ? (
          <p className="mt-8 text-center text-gray-500">Loading favourites...</p>
        ) : favourites.length === 0 ? (
          <p className="mt-8 text-center text-gray-500">No favourites yet.</p>
        ) : (
          <div className="grid grid-cols-3 gap-6" id="recipe-card">
            {favourites.map((fav) => (
              <div key={fav._id} className="recipe-card flex flex-col items-center">
                <div
                  className="border p-30 rounded-xl bg-cover bg-center shadow-xl"
                  style={{ backgroundImage: `url(${fav.image})` }}
                />
                <h2 className="mt-4 text-2xl font-bold text-gray-800 tracking-wide">
                  {fav.name}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {fav.brief || fav.description}
                </p>
                <div className="icons">
                  <HiHeart className="text-orange-500" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default Favourites;