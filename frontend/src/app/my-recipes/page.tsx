"use client";
import Navbar from "@/components/navbar/page"
import {useState , useEffect} from "react"
import apiClient from "@/lib/axios"
import {useRouter} from "next/navigation"

type Recipe= {
  _id: number;
  name: string;
  description:string;
  image:string;
}

function userRecipes(){
  
    const [userRecipes,setUserRecipes] =useState<Recipe[]>([])
    const router = useRouter();
    useEffect(()=>{
      const token = localStorage.getItem("token");
        apiClient.get("/recipe/my",
          {
            headers:{Authorization:`Bearer ${token}`},
        })
        .then(response=>{
            setUserRecipes(response.data.data)
        }).catch(err=>{
            if(err.response?.status === 401){
              localStorage.removeItem("token")
              localStorage.removeItem("userName")
              router.push("/")
            }
        })
    },[])

    return(
    <main className="min-h-screen bg-white text-black">
      <Navbar />
      <div className="pt-24">
        {/* Hero */}
        <section className="relative overflow-hidden bg-orange-400 px-6 pb-16 pt-12 text-center"/>
          <div className="grid grid-cols-3 gap-6" id="recipe-card">
            {userRecipes?.map((userRecipe) => (
              <div key={userRecipe?._id} className="recipe-card flex flex-col items-center">
                  <div
                  className="border p-30 rounded-xl bg-cover bg-center shadow-xl"
                  style={{ backgroundImage: `url(${userRecipe?.image})`}}>
                      
                  </div>
                  <h2 className="mt-4 text-2xl font-bold text-gray-800 tracking-wide">
                      {userRecipe?.name}</h2>
                  <p className="mt-1 text-sm text-gray-500">
                      {userRecipe?.description}
                  </p>
              </div>
            ))}
          </div>
      </div>
    </main>
    )
}


export default userRecipes