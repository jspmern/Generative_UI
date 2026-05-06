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
 const getChart = tool(
  async ({ type, startDate, endDate }) => {
    let groupId = {};
    let projectStage = {};

    if (type === "day") {
      groupId = {
        year: { $year: "$purchaseDate" },
        month: { $month: "$purchaseDate" },
        day: { $dayOfMonth: "$purchaseDate" },
      };

      projectStage = {
        label: {
          $concat: [
            { $toString: "$_id.day" },
            "-",
            { $toString: "$_id.month" },
          ],
        },
        expense: "$totalAmount",
      };
    }

    if (type === "week") {
      groupId = {
        year: { $year: "$purchaseDate" },
        week: { $isoWeek: "$purchaseDate" }, // ✅ better than $week
      };

      projectStage = {
        label: {
          $concat: ["Week ", { $toString: "$_id.week" }],
        },
        expense: "$totalAmount",
      };
    }

    if (type === "month") {
      groupId = {
        year: { $year: "$purchaseDate" },
        month: { $month: "$purchaseDate" },
      };

      projectStage = {
        month: {
          $arrayElemAt: [
            [
              "", "January", "February", "March", "April", "May",
              "June", "July", "August", "September", "October",
              "November", "December"
            ],
            "$_id.month",
          ],
        },
        expense: "$totalAmount",
      };
    }

    const result = await expense.aggregate([
      {
        $addFields: {
          purchaseDate: { $toDate: "$purchaseDate" },
        },
      },
      {
        $match: {
          purchaseDate: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        },
      },
      {
        $group: {
          _id: groupId,
          totalAmount: { $sum: "$price" },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
      },
      {
        $project: projectStage, // ✅ format for chart
      },
    ]);

    console.log("chart result", result);

    return JSON.stringify({data:result,type:"chart"});
  },
  {
    name: "getChart",
    description: "get chart for expense",
    schema: z.object({
      type: z.enum(["day", "week", "month"]),
      startDate: z.string(),
      endDate: z.string(),
    }),
  }
);
  return [createExpense,getExpense,getChart]
}