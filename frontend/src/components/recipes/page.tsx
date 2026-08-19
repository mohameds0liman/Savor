"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { HiHeart } from "react-icons/hi2";

type Recipe= {
  _id: number;
  name: string;
  description:string;
  image:string;
}


function RecipeList() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(()=>{
    axios.get("http://localhost:3000/api/recipes")
    .then(response=>{
      setRecipes(response.data)
    })
  },[])
////////////////////////////////////////////////////
  return (
    <div className="grid grid-cols-3 gap-6" id="recipe-card">
      {recipes?.map((recipe) => (
        <div key={recipe?._id} className="recipe-card flex flex-col items-center">
            <div
            className="border p-30 rounded-xl bg-cover bg-center shadow-xl"
            style={{ backgroundImage: `url(${recipe?.image})`}}>
                
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-800 tracking-wide">
                {recipe?.name}</h2>
            <p className="mt-1 text-sm text-gray-500">
                {recipe?.description}
            </p>
            <div className="icons">
              <HiHeart />
            </div>
        </div>
      ))}
    </div>
  );
}

export default RecipeList
