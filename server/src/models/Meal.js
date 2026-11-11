const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  unit: { type: String, default: 'serving' },
  calories: { type: Number, default: 0 },
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fat: { type: Number, default: 0 }
}, { _id: true });

const mealSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    mealCategory: {
      type: String,
      required: true,
      enum: [
        'Breakfast',
        'Lunch',
        'Dinner',
        'Morning snack',
        'Evening snack',
        'Custom meal'
      ],
      default: 'Lunch'
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
      index: true
    },
    mealTime: {
      type: String,
      default: '12:30'
    },
    foods: [foodItemSchema],
    totalCalories: {
      type: Number,
      default: 0
    },
    totalProtein: {
      type: Number,
      default: 0
    },
    totalCarbs: {
      type: Number,
      default: 0
    },
    totalFat: {
      type: Number,
      default: 0
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

mealSchema.index({ user: 1, date: -1 });

mealSchema.pre('save', function (next) {
  let cals = 0, p = 0, c = 0, f = 0;
  if (this.foods && this.foods.length > 0) {
    this.foods.forEach((food) => {
      cals += Number(food.calories) || 0;
      p += Number(food.protein) || 0;
      c += Number(food.carbs) || 0;
      f += Number(food.fat) || 0;
    });
  }
  this.totalCalories = cals;
  this.totalProtein = p;
  this.totalCarbs = c;
  this.totalFat = f;
  next();
});

module.exports = mongoose.model('Meal', mealSchema);

