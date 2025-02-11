import { notFound } from "next/navigation";
import React from "react";
import { Suspense } from "react";
import { BarLoader } from "react-spinners";

import AccountChart from "@/app/(main)/account/_components/accountChart";



import { getAccountWithTransactions } from "@/actions/accounts";
import TransactionTable from "../_components/transaction-table";


const AccountsPage = async({ params }) => {


    // code form here from gpt 
    const {id}=await params;

    if(!id){
        notFound();
    }
// code end here from gpt fix for missing id params was destructured still had issue while using id directly
    const accountData= await getAccountWithTransactions(id);

    if(!accountData){
    notFound();
    }

    const {transactions,...account}=accountData;


  return (
    <div className="space-y-8 px-5">
      <div className=" flex gap-4 items-end justify-between">
        <h1 className="text-5xl sm:text-6xl font-bold gradient-title capitalize">{account.name}</h1>
        <p className="text-muted-foreground">
           {account.type.charAt(0) + account.type.slice(1).toLowerCase()}
           Account
        </p>
      </div>
        <div className="text-right pb-2">
            <div className="text-xl sm:text-2xl font-bold">
                ${parseFloat(account.balance).toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground">{account._count.transactions} Transactions</p>
        </div>
        {/* chart section  */}
        <Suspense fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea"/>}>
        <AccountChart transactions={transactions}/>
        </Suspense>
    
    {/* transaction section */}
    {/* suspense so that we can show the loader */}
    <Suspense fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea"/>}>
        <TransactionTable transactions={transactions} />


    </Suspense>
    </div>
  );
};

export default AccountsPage;