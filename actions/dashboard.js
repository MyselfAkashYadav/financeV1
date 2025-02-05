"use server"
import {db} from "@/lib/prisma";
import {auth} from "@clerk/nextjs/server";


const serializeTransaction=(obj)=>{
    const serialized={...obj};
    if(obj.balance){
        serialized.balance=obj.balance.toNumber();
    }

}



export async function createAccount(data){


    try{
        const {userId}=await auth();
        if(!userId) throw new Error("Unauthorized");

        const user=await db.user.findUnique({
            where:{clerkUserId:userId},
        });
        if(!user) throw new Error("User not found");

        // balance to float
        const balanceFloat=parseFloat(data.balance);
        if(isNaN(balanceFloat)) throw new Error("Invalid balance amount");

        // check is this first account
        const existingAccount=await db.account.findMany({
            where:{userId:user.id},
        })

        const shouldBeDefault=existingAccount.length===0?true:data.isDefault;

        // if should be default, set all other accounts to not default
        if(shouldBeDefault){
            await db.account.updateMany({
                where:{userId:user.id,isDefault:true},
                data:{isDefault:false},
            });
        }

        const account=await db.account.create({
            data:{
                ...data,
                balance:balanceFloat, //balance back to number before returning to nextjs as we need to serialize it 
                isDefault:shouldBeDefault,
            },
        });

        const serializedAccount= serializeTransaction(account);
        revalidatePath("/dashboard");
        return {success:true,data:serializedAccount};

    }catch(error){
        throw new Error(error.message);


    }
}
