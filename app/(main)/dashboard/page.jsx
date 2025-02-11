import React from 'react'
import CreateAccountDrawer from '@/components/create-account-drawer';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
// import { accountSchema } from '@/app/lib/schema';
import { getUserAccounts } from '@/actions/dashboard';
import AccountCard from './_components/account-card';

import { getCurrentBudget } from '@/actions/budget';
import BudgetProgress from './_components/budgetProgress';





const page =  async() => {
  const accounts =await getUserAccounts();
  // console.log(accounts)

 

  const defaultAccount = accounts?.find((account) => account.isDefault);

  // Get budget for default account
  let budgetData = null;
  if (defaultAccount) {
    budgetData = await getCurrentBudget(defaultAccount.id);
  }



  return (
    <div className='space-y-8'>

      {/* budget progress */}
      {defaultAccount && (
         <BudgetProgress
         initialBudget={budgetData?.budget}
         currentExpenses={budgetData?.currentExpenses || 0}
       />

      )}
     



      {/* overview */}

      {/* account grid */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        <CreateAccountDrawer>
          <Card className="hover :shadow-md transition-shadow cursor-pointer border-dashed">
            <CardContent className="flex flex-col items-center justify-center text-muted-foreground h-full pt-5">
              <Plus className='w-10 h-10'/>
              <p className='text-sm font-medium'>Add New Account</p>
            </CardContent>

          </Card>

        </CreateAccountDrawer>

      {accounts.length >0 && accounts?.map((account)=>{
        return <AccountCard key={account.id} account={account}/>

      }
      )}

      </div>
      
        
    </div>
  )
}

export default page