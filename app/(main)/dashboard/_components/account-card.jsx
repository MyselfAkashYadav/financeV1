"use client";

import { Switch } from '@/components/ui/switch'
import React from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import Link from 'next/link'
import useFetch from '@/hooks/useFetch'
import { updateDefaultAccount } from '@/actions/accounts'





const AccountCard = ({account}) => {
    const {name,type,balance,id,isDefault}=account;

    const{
      loading:updateDefaultLoading,
      fn:updateDefaultFn,
      data:updateAccount,
      error,
    }=useFetch(updateDefaultAccount);

    const handleDefaultChange=async()=>{
      event.preventDefault();
      if(isDefault){
        toast.warning('You need at least 1 default account');
        return; //not allowing toggle off default account

      }



    }




  return (
    <Card className="hover:shadow-md transition-shadow group relative">
       <Link href={`/account/${id}`}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2" >
      <CardTitle className="text-sm font-medium capitalize">
        Card Title
      </CardTitle>
      <Switch
      checked={isDefault}
      onClick={handleDefaultChange}
      disabled={updateDefaultLoading}

      />
      
    </CardHeader>
    <CardContent>
     <div className='text-2xl font bold'>
        ${parseFloat(balance).toFixed(2)}

        

     </div>
     <p className='text-xs text-muted-foreground'>
      
      {type.charAt(0) + type.slice(1).toLowerCase()} Account  

     </p>
    </CardContent>
    <CardFooter>
    <div className="flex items-center">
            <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
            Income
          </div>
          <div className="flex items-center">
            <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
            Expense
          </div>
    </CardFooter>
  
       </Link>
  </Card>
  )
}

export default AccountCard