import React from 'react'
import CreateAccountDrawer from '@/components/create-account-drawer';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
// import { accountSchema } from '@/app/lib/schema';
import { getUserAccounts } from '@/actions/dashboard';
import AccountCard from './_components/account-card';



const page =  async() => {
  const accounts =await getUserAccounts();
  // console.log(accounts)


  return (
    <div className='px-5'>

      {/* budget progress */}

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