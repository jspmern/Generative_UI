/**Tools will come here */
   import * as z from "zod"
import { tool } from "langchain"
import { expense } from "../modal/expense";
export  function expenseTracker()
{
    /**All Tool*/

const createExpense = tool(
  async({title,price,purchaseDate }) => {
    try{
        if(!title || !price || !purchaseDate) return "Validation fail for creating db"
        let result= new expense({title,price,purchaseDate})
        result.save()
        return JSON.stringify(`Toolmsg:this is inserted in db ${result}`)
    }
    catch(error)
    {
        return error
    }
  },
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

 const getExpense=tool(async({from,to})=>{
    if(!from || !to ) return "Somthing error please retry"
    console.log(from, to)
   const fetchResult= await  expense.find({
    purchaseDate: {
      $gte: from,
      $lte:to
    }
  })
    return `ToolResult: fetch Result is ${JSON.stringify(fetchResult)}`
 }, {
    name: "getExpense",
    description: "get expense in range",
    schema: z.object({
      from: z.string().describe("this is for from which date"),
     to: z.string().describe("this is  for to which date"),
    }),
  })
  return [createExpense,getExpense]
}