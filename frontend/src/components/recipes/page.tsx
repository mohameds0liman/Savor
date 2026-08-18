"use client";
import axios from "axios";
import { useEffect, useState } from "react";

type Recipe= {
  _id: number;
  name: string;
  description:string;
  image:string;
}


 function RecipeList() {
//   const recipes: Recipe[] = [
//     { id: 1, name: "Pizza" ,description:"Delicious & Fresh",image:"https://www.modernhoney.com/wp-content/uploads/2025/01/BBQ-Chicken-Pizza-4-crop-scaled.jpg"},
//     { id: 2, name: "Burger",description:"Amazing" ,image:"https://www.lurch.de/media/b5/4c/70/1693989554/burger-classic-cheese-rezept.jpg?ts=1753774543" },
//     { id: 3, name: "Pasta",description:"Delicious" , image:"https://www.chewoutloud.com/wp-content/uploads/2025/09/Chicken-Fajita-Pasta-in-Pan-Square.jpg"},
//     { id: 4, name: "Pasta",description:"Delicious" , image:"https://www.chewoutloud.com/wp-content/uploads/2025/09/Chicken-Fajita-Pasta-in-Pan-Square.jpg"},
//     { id: 5, name: "Pasta",description:"Delicious" , image:"https://www.chewoutloud.com/wp-content/uploads/2025/09/Chicken-Fajita-Pasta-in-Pan-Square.jpg"},
//     { id: 6, name: "Pasta",description:"Delicious" , image:"https://www.chewoutloud.com/wp-content/uploads/2025/09/Chicken-Fajita-Pasta-in-Pan-Square.jpg"},
//     { id: 7, name: "Pasta",description:"Delicious" , image:"https://www.chewoutloud.com/wp-content/uploads/2025/09/Chicken-Fajita-Pasta-in-Pan-Square.jpg"},
//     { id: 8, name: "Pasta",description:"Delicious" , image:"https://www.chewoutloud.com/wp-content/uploads/2025/09/Chicken-Fajita-Pasta-in-Pan-Square.jpg"},
//     { id: 9, name: "Pasta",description:"Delicious" , image:"https://www.chewoutloud.com/wp-content/uploads/2025/09/Chicken-Fajita-Pasta-in-Pan-Square.jpg"},
//     { id: 10, name: "Pasta",description:"Delicious" , image:"https://www.chewoutloud.com/wp-content/uploads/2025/09/Chicken-Fajita-Pasta-in-Pan-Square.jpg"},
// ];
////////////////////////////////////////////////////
  

const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(()=>{
    axios.get("http://localhost:3000/api/recipes")
    .then(response=>{
      setRecipes(response.data)
    })
  },[])
////////////////////////////////////////////////////
  return (
    <div className="grid grid-cols-3 gap-6">
      {recipes?.map((recipe) => (
        <div key={recipe?._id} className="flex flex-col items-center">
            <div
            className="border p-30 rounded-xl bg-cover bg-center shadow-xl"
            style={{ backgroundImage: `url(${recipe?.image})`}}>
                
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-800 tracking-wide">
                {recipe?.name}</h2>
            <p className="mt-1 text-sm text-gray-500">
                {recipe?.description}
            </p>
        </div>
      ))}
    </div>
  );
}

export default RecipeList
