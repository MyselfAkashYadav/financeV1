import { inngest } from "./client";

export const helloWorld = inngest.createFunction(
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
            const startDate = new Date();
            startDate.setDate(1); // Start of current month


        const expenses = await db.transaction.aggregate({
            where: {
              userId: budget.userId,
              accountId: defaultAccount.id, // Only consider default account
              type: "EXPENSE",
              date: {
                gte: startDate,
              },
            },
            _sum: {
              amount: true,
            },
          });

          const totalExpenses = expenses._sum.amount?.toNumber() || 0;
          const budgetAmount = budget.amount;
          const percentageUsed = (totalExpenses / budgetAmount) * 100;

          if (
            percentageUsed >= 80 && // Default threshold of 80%
            (!budget.lastAlertSent ||
              isNewMonth(new Date(budget.lastAlertSent), new Date()))
          ){
            // send email
            // and update lastAlertSent
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
