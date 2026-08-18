import mongoose from "mongoose";

const { Schema } = mongoose;

const RecipeSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 150,
    },

    brief: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 3000,
    },

    // الأفضل تبقى Array مش String
    instructions: {
      type: [String],
      required: true,
    },

    image: {
      type: String,
      required: true,
    },

    // المكونات
    ingredients: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },

        quantity: {
          type: Number,
          required: true,
        },

        unit: {
          type: String,
          trim: true,
        },
      },
    ],

    // مدة التحضير
    prepTime: {
      type: Number,
      required: true,
      min: 0,
    },

    // مدة الطبخ
    cookTime: {
      type: Number,
      default: 0,
      min: 0,
    },

    // عدد الأشخاص
    servings: {
      type: Number,
      required: true,
      min: 1,
    },

    // Easy / Medium / Hard
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "easy",
    },

    // Breakfast / Lunch / Dinner / Dessert ...
    category: {
      type: String,
      required: true,
      trim: true,
    },

    // Tags للبحث والفلترة
    tags: {
      type: [String],
      default: [],
    },

    // صاحب الوصفة
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // متوسط التقييم
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    ratingsCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // عدد المشاهدات
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);


const Recipe=mongoose.model("Recipe" ,RecipeSchema)


export default Recipe;