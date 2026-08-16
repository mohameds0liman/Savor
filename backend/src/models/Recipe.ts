import mongoose from "mongoose";

const schema =mongoose.Schema


const RecipeSchema = new schema({
    name:String,
    description:String,
    image:String

})


const Recipe=mongoose.model("Recipe" ,RecipeSchema)


export default Recipe;