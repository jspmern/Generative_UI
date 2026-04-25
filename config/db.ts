/**mongodb connection */
import mongoose from "mongoose";

dbConnection().catch(err => console.log(err));

export async function dbConnection() {
  await mongoose.connect('mongodb://127.0.0.1:27017/expense');
}