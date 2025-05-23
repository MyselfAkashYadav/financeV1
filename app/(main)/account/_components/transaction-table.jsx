"use client";

import React,{useState , useMemo ,useEffect } from 'react';
import useFetch from '@/hooks/useFetch';

import{Table,TableHeader,TableRow,TableHead,TableBody,TableCell} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { format } from 'date-fns'

import { categoryColors } from '@/data/categories';
import { Badge } from '@/components/ui/badge';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import {ChevronDown, ChevronUp, Clock, MoreHorizontal, RefreshCw, Trash, X} from "lucide-react"
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { bulkDeleteTransactions } from '@/actions/accounts';
import { BarLoader } from 'react-spinners';
import { toast } from 'sonner';





const RECURRING_INTERVALS={
DAILY:"Daily",
WEEKLY:"Weekly",
MONTHLY:"Monthly",
YEARLY:"Yearly",


};



const TransactionTable = ({transactions}) => {

  const router=useRouter();
  const [selectedIds,setSelectedIds]=useState([]);
  const [sortConfig,setsortConfig]=useState({
    field:"date",
    direction:"desc"
  });

  const [searchTerm,setSearchTerm]=useState("");
  const [typeFilter,setTypeFilter]=useState("");
  const [recurringFilter,setRecurringFilter]=useState("");






  // logic for filter and sort
  
  const filteredAndSortedTransactions=useMemo(()=>{

    let results=[...transactions];

    if(searchTerm){
      const searchLower=searchTerm.toLowerCase();
      results=results.filter((transaction)=>transaction.description?.toLowerCase().includes(searchLower));
    }

    // console.log(recurringFilter);

    if(recurringFilter){
      results=results.filter((transaction)=>
      {
        if(recurringFilter==="recurring"){
          return transaction.isRecurring;
        }
        return !transaction.isRecurring;
      });
    }

    if(typeFilter){
      results=results.filter((transaction)=>transaction.type===typeFilter);
    }

    results.sort((a,b)=>{
      let comparison=0;
      switch(sortConfig.field){
        case "date":
          comparison=new Date(a.date)-new Date(b.date);
          break;
        case "category":
          comparison=a.category.localeCompare(b.category);
          break;
        case "amount":
          comparison=a.amount-b.amount;
          break;
        default:
          comparison=0;
      }
      return sortConfig.direction==="asc"?comparison:-comparison;


    })

    // console.log(results);
    return results ;

  },[transactions,searchTerm,recurringFilter, typeFilter ,sortConfig]);
  const handleSort=(field)=>{
    
    setsortConfig(current=>({
      field,
      direction:
      current.field==field && current.direction=="asc"?"desc":"asc"
    }))
  }
  
 
  

  const handelSelect=(id)=>{
setSelectedIds(current=>current.includes(id)?current.filter(item=>item!=id):[...current,id]);
  }

  const handleSelectAll=()=>{
    setSelectedIds((current)=>current.length===filteredAndSortedTransactions.length?[]
  :filteredAndSortedTransactions.map((transactions)=>transactions.id));


  };

  const {
    loading:deleteLoading,
    fn:deleteFn,
    data:deleted,
  }=useFetch(bulkDeleteTransactions);

  const handleBulkDelete=async()=>{
    if(!window.confirm(
      `Are you sure you want to delete ${selectedIds.length} transactions?`
    )){
      return;
    }
    
    deleteFn(selectedIds);
    
    };
    
    useEffect(()=>{
      if(deleted && deleteLoading){
        toast.error("Transactions deleted successfully");
    
      }
    },[deleted,deleteLoading]
    )

  

  const handleClearFilters=()=>{
    setSearchTerm("");
    setTypeFilter("");
    setRecurringFilter("");
    setSelectedIds([]);

  }
    
  return (
    
    <div className='space-y-4 '>
          {deleteLoading && <BarLoader className='mt-4' width={"100%"} color="#9333ea"/>}

      <div className='flex flex-col sm:flex-row gap-4'>
        <div className='relative flex-1'>
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
          placeholder="Search Transactions..."
          value={searchTerm}
          onChange={(e)=>setSearchTerm(e.target.value)}
          className="pl-8"/>
        </div>
      </div>

      <div className='flex gap-2'>
      <Select value={typeFilter} onValueChange={setTypeFilter}>
  <SelectTrigger >
    <SelectValue placeholder="All Types" />
  </SelectTrigger>
  <SelectContent>
 
    <SelectItem value="INCOME">Income</SelectItem>
    <SelectItem value="EXPENSE">Expense</SelectItem>

  </SelectContent>
</Select>


      <Select value={recurringFilter} onValueChange={(value)=>setRecurringFilter(value)}>
  <SelectTrigger className="w-[140px]" >
    <SelectValue placeholder="All Transactions" />
  </SelectTrigger>
  <SelectContent>
 
    <SelectItem value="recurring">Recurring Only</SelectItem>
    <SelectItem value="non-recurring">Non-recurring Only</SelectItem>

  </SelectContent>
</Select>

{selectedIds.length>0 && (
  <div className='flex items-start gap-2'>


  <Button variant="destructive" size="sm" onClick={handleBulkDelete} >
    <Trash className='h-4 w-4 mr-2'/>
    Delete Selected ({selectedIds.length})
  </Button>
</div>)}

{(searchTerm || typeFilter || recurringFilter) &&(
  <Button variant="outline" size="icon" onClick={handleClearFilters} title="Clear Filters" >
    <X className='h-4 w-5'/> </Button>
) }



      </div>

       

      {/* filter code */}

      {/* transaction */}
      
      <div className='rounded-md border'>


      <Table>
 
  <TableHeader>
    <TableRow>
      <TableHead className="w-[50px]">
        <Checkbox onCheckedChange={handleSelectAll} 
        checked={selectedIds.length===filteredAndSortedTransactions.length && filteredAndSortedTransactions.length>0}
        />
        
      </TableHead>
      <TableHead className="cursor-pointer"
      onClick={()=>handleSort("date")}
      >
        <div className='flex items-center'>
          Date {sortConfig.field=="date" && (
sortConfig.direction=="asc"? (<ChevronUp className='ml-1 h-4 w-4'/>):(<ChevronDown className='ml-1 h-4 w-4'/>)




)}
        </div>

      </TableHead>

      <TableHead>Description</TableHead>
      <TableHead className="cursor-pointer"
      onClick={()=>handleSort("category")}
      >
        <div className='flex items-center'>
          Category {sortConfig.field=="category" && (
sortConfig.direction=="asc"? (<ChevronUp className='ml-1 h-4 w-4'/>):(<ChevronDown className='ml-1 h-4 w-4'/>)




)}
        </div>

      </TableHead>
      <TableHead className="cursor-pointer"
      onClick={()=>handleSort("amount")}
      >
        <div className='flex items-center justify-end'>
          Amount {sortConfig.field=="amount" && (
sortConfig.direction=="asc"? <ChevronUp className='ml-1 h-4 w-4'/>:<ChevronDown className='ml-1 h-4 w-4'/>




)}
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
      <TableCell ><Checkbox onCheckedChange={()=>handelSelect(transaction.id)}
        checked={selectedIds.includes(transaction.id)}
        /></TableCell>

      <TableCell>
      {format(new Date(transaction.date), "PP")}

       </TableCell> 
      
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
      <TableCell>{transaction.isRecurring ? (
        <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
          <Badge variant="outline" className="gap-1 bg-purple-100 text-purple-700 hover:bg-purple-200" >
          
          <RefreshCw className="h-3 w-3"/>
          {
            RECURRING_INTERVALS[transaction.recurringInterval]
          }</Badge>

          </TooltipTrigger>
          <TooltipContent>
           <div className='text-sm'>
            <div className='font-medium'>
              Next Date:
            </div>
            <div>
              {format(new Date(transaction.nextRecurringDate), "PP")}
            </div>

           </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      


      ):(
        <Badge variant="outline" className="gap-1" >
          
          <Clock className="h-3 w-3"/>
          One-time</Badge>

      )}</TableCell>
    <TableCell>
    <DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" className="h-8 w-8 p-0">
      <MoreHorizontal className='h-4 w-4'/>
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem
    onClick={
      ()=>router.push(`/transaction/create?edit=${transaction.id}`)
    }
    >Edit</DropdownMenuItem>
    <DropdownMenuSeparator />
    
    <DropdownMenuItem className="text-destructive"
    onClick={
      ()=>deleteFn([transaction.id])
    }
    >Delete</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>



    </TableCell>


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