// "use client";
// import axios from "axios";
// import { API_URL } from "@/lib/api";
// import { useEffect, useState } from "react";
// import { HiHeart } from "react-icons/hi2";
// import apiClient from "@/lib/axios";

// type Recipe= {
//   _id: number;
//   name: string;
//   description:string;
//   image:string;
// }


// function RecipeList() {
//   const [recipes, setRecipes] = useState<Recipe[]>([]);

//   useEffect(()=>{
//     axios.get(`${API_URL}/api/recipe`)
//     .then(response=>{
//       setRecipes(response.data.data)
//     })
//   },[])
//   // const addFavourite = (id: string) => {
//   //   apiClient.post(`/user/favourites/${id}`).catch((err) => {
//   //     console.error("Failed to add favourite", err);
//   //   });
//   // };
// ////////////////////////////////////////////////////
//   return (
//     <div className="grid grid-cols-3 gap-6" id="recipe-card">
//       {recipes?.map((recipe) => (
//         <div key={recipe?._id} className="recipe-card flex flex-col items-center">
//             <div
//             className="border p-30 rounded-xl bg-cover bg-center shadow-xl"
//             style={{ backgroundImage: `url(${recipe?.image})`}}>
                
//             </div>
//             <h2 className="mt-4 text-2xl font-bold text-gray-800 tracking-wide">
//                 {recipe?.name}</h2>
//             <p className="mt-1 text-sm text-gray-500">
//                 {recipe?.description}
//             </p>
//             <div className="icons">
//               <HiHeart />
//             </div>
//         </div>
//       ))}
//     </div>
//   );
// }

// export default RecipeList
"use client";
import axios from "axios";
import { API_URL } from "@/lib/api";
import { useEffect, useState } from "react";
import { HiHeart, HiOutlineHeart } from "react-icons/hi2";
import apiClient from "@/lib/axios";

type Recipe = {
  _id: string;
  name: string;
  description: string;
  image: string;
};

function RecipeList() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [favouriteIds, setFavouriteIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    axios.get(`${API_URL}/api/recipe`).then((response) => {
      setRecipes(response.data.data);
    });

    if (localStorage.getItem("token")) {
      apiClient
        .get("/user/favourites")
        .then((response) => {
          const ids = (response.data.data as Recipe[]).map((fav) => fav._id);
          setFavouriteIds(new Set(ids));
        })
        .catch(() => {});
    }
  }, []);

  const toggleFavourite = (id: string) => {
    const isFavourite = favouriteIds.has(id);
    const request = isFavourite
      ? apiClient.delete(`/user/favourites/${id}`)
      : apiClient.post(`/user/favourites/${id}`);

    request
      .then(() => {
        setFavouriteIds((prev) => {
          const next = new Set(prev);
          if (isFavourite) next.delete(id);
          else next.add(id);
          return next;
        });
      })
      .catch((err) => {
        console.error("Failed to update favourite", err);
      });
  };

  return (
    <div className="grid grid-cols-3 gap-6" id="recipe-card">
      {recipes?.map((recipe) => (
        <div key={recipe?._id} className="recipe-card flex flex-col items-center">
          <div
            className="border p-30 rounded-xl bg-cover bg-center shadow-xl"
            style={{ backgroundImage: `url(${recipe?.image})` }}
          ></div>
          <h2 className="mt-4 text-2xl font-bold text-gray-800 tracking-wide">
            {recipe?.name}
          </h2>
          <p className="mt-1 text-sm text-gray-500">{recipe?.description}</p>
          <div className="icons">
            <button
              type="button"
              onClick={() => toggleFavourite(recipe._id)}
              aria-label="Toggle favourite"
            >
              {favouriteIds.has(recipe._id) ? (
                <HiHeart className="text-orange-500" />
              ) : (
                <HiOutlineHeart />
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default RecipeList;
