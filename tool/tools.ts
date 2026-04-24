/**Tools will come here */
   import * as z from "zod"
import { tool } from "langchain"
export  function expenseTracker()
{
    /**All Tool*/

const createExpense = tool(
  ({title,price,purchaseDate }) => `title ${title} price '${price} and purchaseDate ${purchaseDate}`,
  {
    name: "createExpense",
    description: "create expense in database",
    schema: z.object({
      title: z.string().describe("this is for title of expense"),
      price: z.number().describe("this is the price for expense"),
      purchaseDate:z.string().describe("the the puchaseDate and time")
    }),
  }
);
    return [createExpense]
}