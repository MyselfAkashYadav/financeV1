import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { checkBudgetAlert, generateMonthlyReports, processRecurringTransaction, triggerRecurringTransactionateFunction } from "@/lib/inngest/functions";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({client: inngest,
  functions: [
    checkBudgetAlert,
    processRecurringTransaction,
    triggerRecurringTransactionateFunction,
    generateMonthlyReports,
   
  ],
});