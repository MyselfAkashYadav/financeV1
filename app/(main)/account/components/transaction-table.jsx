"use client";

import React from 'react'
import{Table,TableCaption,TableHeader,TableRow,TableHead,TableBody,TableCell} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { format } from 'date-fns'

import { categoryColors } from '@/data/categories';
import { Badge } from '@/components/ui/badge';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import {Clock} from "lucide-react"

const TransactionTable = ({transactions}) => {

  // logic for filter and sort
  const filteredAndSortedTransactions=transactions;

  const handleSort=()=>{

  }
    
  return (
    
    <div className='space-y-4 '>

       

      {/* filter code */}

      {/* transaction */}
      
      <div className='rounded-md border'>


      <Table>
 
  <TableHeader>
    <TableRow>
      <TableHead className="w-[50px]">
        <Checkbox/>
        
      </TableHead>
      <TableHead className="cursor-pointer"
      onClick={()=>handleSort("date")}
      >
        <div className='flex items-center'>
          Date
        </div>

      </TableHead>

      <TableHead>Description</TableHead>
      <TableHead className="cursor-pointer"
      onClick={()=>handleSort("category")}
      >
         <div className='flex items-center'>
          Category
        </div>

      </TableHead>
      <TableHead className="cursor-pointer"
      onClick={()=>handleSort("Amount")}
      >
         <div className='flex items-center justify-end'>
          Amount
        </div>

      </TableHead>
      <TableHead className="">Recurring</TableHead>
      <TableHead className="w-[50px]"/>
     
    </TableRow>
  </TableHeader>
  <TableBody>

{filteredAndSortedTransactions.length === 0 ?(
<TableRow>
  <TableCell colSpan={7} className="text-center text-muted-foreground">No Transactions Found</TableCell>
</TableRow>

):(
  filteredAndSortedTransactions.map((transaction)=>(

  <TableRow key={transaction.id}>
      <TableCell ><Checkbox/></TableCell>
      
      {format(new Date(transaction.date),"PP")}
      <TableCell>{transaction.description}</TableCell>
      <TableCell className="capitalize">
        
        <span style={{
          background:categoryColors[transaction.category],
        }}
        className='px-2 py-1 rounded test-white text-sm'
        >
          {transaction.category}
          </span></TableCell>
      <TableCell className="text-right font-medium"
      
      style={{
        color:transaction.type==="EXPENSE"?"red":"green",
      }}

      >{transaction.type==="EXPENSE"?"-":"+"}${transaction.amount.toFixed(2)}</TableCell>
      <TableCell>{transaction.recurring ? (
        <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover</TooltipTrigger>
          <TooltipContent>
            <p>Add to library</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      


      ):(
        <Badge variant="outline" className="gap-1" >
          
          <Clock className="h-3 w-3"/>
          One-time</Badge>

      )}</TableCell>
    </TableRow>
  
  

)))


}

</TableBody>

    
</Table>

      </div>

    </div>
  )
}

export default TransactionTable