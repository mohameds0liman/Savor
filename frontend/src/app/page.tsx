import Navbar from "@/components/navbar/page";
import Hero from "@/components/hero/page";
import Recipes from "@/components/recipes/page";
import Footer from "@/components/footer/page"


function Home() {
  return (
    <div>
      <main className="min-h-screen bg-white text-black">
        <div className="">
          <Navbar/>
          <Hero/>
          <Recipes/>
          <Footer/>
        </div>
        
        <h1>Hello World</h1>
      </main>
    </div>
  );
}


export default Home;