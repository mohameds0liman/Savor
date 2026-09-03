// import {useState , useEffect} from "react"
// import {useRouter} from "next/navigation"
// import apiClient from "@/lib/axios"

// type Recipe = {
//     name: string;
//     description: string;
//     image: string;
//     ingredients: string[];
//     instructions: string;
//     difficulty: string;
//     prepTime: string;
//     cookTime: string;
//     totalTime: string;
//     recipeCategory: string;
//     recipeYield: string;
//     keywords: string[];
//     isFavourite: boolean;
//   };


// function Create_Recipe(){
//     const [recipe,setRecipe] =useState<Recipe>()
//     const router = useRouter();

//     useEffect(()=>{
//         apiClient.get(`/recipe/${id}`,
//           {
//             headers:{Authorization:`Bearer`},
//         })
//         .then(response=>{
//             setRecipe(response.data.data)
//         }).catch(err=>{
//             if(err.response?.status === 401){
//               localStorage.removeItem("token")
//               localStorage.removeItem("userName")
//               router.push("/")
//             }
//         })
//     },[])
//     return(
//         <h1>create_recipe</h1>
//     )
// }



// export default Create_Recipe