import { inngest } from "./client";
import { db } from "../prisma";
import { sendEmail } from "@/actions/sendEmail";
import EmailTemplate from "@/emails/template"

export const checkBudgetAlert = inngest.createFunction(
  { name:"Check Budget Alerts"},
//   cron expression that runs very 6 hours
  { cron:" 0 */6 * * *"},
  async ({  step }) => {
    const budgets=await step.run("fetch-budget",async()=>{
        return await db.budget.findMany({
            include:{
                user:{
                    include:{
                        accounts:{
                            where:{
                                isDefault:true,
                            }
                        }
                    }
                }
            }
        })
    });
    
    for(const budget of budgets){
        const defaultAccount=budget.user.accounts[0];
        // skip if no default account
        if(!defaultAccount){
            
            continue;  

        }

        await step.run(`check-budget-${budget.id}`, async () => {
          

            const currentDate=new Date();
const startOfMonth=new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),

);
const endOfMonth=new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() +1,

);


        const expenses = await db.transaction.aggregate({
            where: {
              userId: budget.userId,
              accountId: defaultAccount.id, // Only consider default account
              type: "EXPENSE",
              date: {
                gte:startOfMonth,
                lte:endOfMonth,
              },
            },
            _sum: {
              amount: true,
            },
          });

          const totalExpenses = expenses._sum.amount?.toNumber() || 0;
          const budgetAmount = budget.amount;
          const percentageUsed = (totalExpenses / budgetAmount) * 100;
          console.log(totalExpenses);
          console.log(budgetAmount);
          console.log(percentageUsed);

          if (
            percentageUsed >= 80 && // Default threshold of 80%
            (!budget.lastAlertSent ||
              isNewMonth(new Date(budget.lastAlertSent), new Date()))
          ){
            // send email
            await sendEmail({
                to: budget.user.email,
            subject: `Budget Alert for ${defaultAccount.name}`,
            react: EmailTemplate({
              userName: budget.user.name,
              type: "budget-alert",
              data: {
                percentageUsed,
                budgetAmount: parseInt(budgetAmount).toFixed(1),
                totalExpenses: parseInt(totalExpenses).toFixed(1),
                accountName: defaultAccount.name,
              },
            }),


            });

            // and update lastAlertSent
            console.log(totalExpenses);
            console.log(budgetAmount);
            console.log(percentageUsed,budget.lastAlertSent);

            await db.budget.update({
                where: { id: budget.id },
                data: { lastAlertSent: new Date() },
              });
          }
       
       
       
        } );



       



        

    }
  },
);


function isNewMonth(lastAlertDate, currentDate) {
    return (
      lastAlertDate.getMonth() !== currentDate.getMonth() ||
      lastAlertDate.getFullYear() !== currentDate.getFullYear()
    );
  }



export const triggerRecurringTransactionateFunction=inngest.createFunction({


  id:"trigger-recurring-transaction",
  name:"Trigger Recurring Transaction",
  
}

  ,{cron:"0 0 * * *"},
async( {step})=>{

  // fetching all recurr trans that are due 

  const recurringTransactions = await step.run(
    "fetch-recurring-transactions",
    async () => {
      return await db.transaction.findMany({
        where: {
          isRecurring: true,
          status: "COMPLETED",
          OR: [
            { lastProcessed: null },
            {
              nextRecurringDate: {
                lte: new Date(),
              },
            },
          ],
        },
      });
    



})



//  creating event for each transc 

if (recurringTransactions.length > 0) {
  const events = recurringTransactions.map((transaction) => ({
    name: "transaction.recurring.process",
    data: {
      transactionId: transaction.id,
      userId: transaction.userId,
    },
  }));

  // Send events directly using inngest.send()
  await inngest.send(events);
}

return { triggered: recurringTransactions.length };

});


export const processRecurringTransaction = inngest.createFunction(
  {
    id: "process-recurring-transaction",
    throttle:{
      limit:10,
      period:"1m",
      key:"event.data.userId", 
    },
  },
    {event:"transaction.recurring.process"},

    async ({ event, step }) => {
      // Validate event data
      if (!event?.data?.transactionId || !event?.data?.userId) {
        console.error("Invalid event data:", event);
        return { error: "Missing required event data" };
      }

      await step.run("process-transaction", async () => {
        const transaction = await db.transaction.findUnique({
          where: {
            id: event.data.transactionId,
            userId: event.data.userId,
          },
          include: {
            account: true,
          },
        });
  
        if (!transaction || !isTransactionDue(transaction)) return;



        await db.$transaction(async (tx) => {
          // Create new transaction
          await tx.transaction.create({
            data: {
              type: transaction.type,
              amount: transaction.amount,
              description: `${transaction.description} (Recurring)`,
              date: new Date(),
              category: transaction.category,
              userId: transaction.userId,
              accountId: transaction.accountId,
              isRecurring: false,
            },
          });

          const balanceChange =
          transaction.type === "EXPENSE"
            ? -transaction.amount.toNumber()
            : transaction.amount.toNumber();

        await tx.account.update({
          where: { id: transaction.accountId },
          data: { balance: { increment: balanceChange } },
        });


        await tx.transaction.update({
          where: { id: transaction.id },
          data: {
            lastProcessed: new Date(),
            nextRecurringDate: calculateNextRecurringDate(
              new Date(),
              transaction.recurringInterval
            ),
          },
        });

        
   
      });
     
    
    });
    
    }
);


function isTransactionDue(transaction) {
  // If no lastProcessed date, transaction is due
  if (!transaction.lastProcessed) return true;

  const today = new Date();
  const nextDue = new Date(transaction.nextRecurringDate);

  // Compare with nextDue date
  return nextDue <= today;
}


function calculateNextRecurringDate(date, interval) {
  const next = new Date(date);
  switch (interval) {
    case "DAILY":
      next.setDate(next.getDate() + 1);
      break;
    case "WEEKLY":
      next.setDate(next.getDate() + 7);
      break;
    case "MONTHLY":
      next.setMonth(next.getMonth() + 1);
      break;
    case "YEARLY":
      next.setFullYear(next.getFullYear() + 1);
      break;
  }
  return next;
}



export const generateMonthlyReports = inngest.createFunction(
  {
    id: "generate-monthly-reports",
    name: "Generate Monthly Reports",
  },
  { cron: "0 0 1 * *" }, // First day of each month
  async ({ step }) => {
    const users = await step.run("fetch-users", async () => {
      return await db.user.findMany({
        include: { accounts: true },
      });
    });

    for (const user of users) {
      await step.run(`generate-report-${user.id}`, async () => {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        const stats = await getMonthlyStats(user.id, lastMonth);
        const monthName = lastMonth.toLocaleString("default", {
          month: "long",
        });

        // Generate AI insights
        const insights = await generateFinancialInsights(stats, monthName);

        await sendEmail({
          to: user.email,
          subject: `Your Monthly Financial Report - ${monthName}`,
          react: EmailTemplate({
            userName: user.name,
            type: "monthly-report",
            data: {
              stats,
              month: monthName,
              insights,
            },
          }),
        });
      });
    }

    return { processed: users.length };
  }
);


async function generateFinancialInsights(stats, month) {
  
}



async function getMonthlyStats(userId, month) {
  const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
  const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0);

  const transactions = await db.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  return transactions.reduce(
    // accumulater and transation one
    (stats, t) => {
      const amount = t.amount.toNumber();
      if (t.type === "EXPENSE") {
        stats.totalExpenses += amount;
        stats.byCategory[t.category] =
          (stats.byCategory[t.category] || 0) + amount;
      } else {
        stats.totalIncome += amount;
      }
      return stats;
    },
    {
      totalExpenses: 0,
      totalIncome: 0,
      byCategory: {},
      transactionCount: transactions.length,
    }
  );
}


