import { Schema, model, connect } from 'mongoose';

// 1. Create a Schema corresponding to the document interface.
const expenseSchema = new Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  purchaseDate:{type:String,require:true},
});

// 2. Create a Model.
export const expense = model('Expense', expenseSchema);

 