"use client";


import useFetch from '@/hooks/useFetch';
import React ,{useEffect, useRef} from 'react';
import { scanReceipt } from '@/actions/transaction';


import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';
import { Loader2 } from 'lucide-react';

import { toast } from 'sonner';


const ReciptScanner = ({onScanComplete}) => {
     
    const fileInputRef=useRef();

    const {
        loading:scanReceiptLoading,
        fn:scanReceiptFn,
        data:scannedData,

    }=useFetch(scanReceipt);

    const handleReceitptScan=async (file)=>{

        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size should be less than 5MB");
            return;
          }
      
          await scanReceiptFn(file);

    }

    useEffect(()=>{
        if(scannedData && !scanReceiptLoading){
            onScanComplete(scannedData);
            toast.success("Receipt Scanned Successfully")

        }
    },[scanReceiptLoading,scannedData]);

    return (


    <div>

        <input 
        type="file"
        ref ={fileInputRef}
        className='hidden'
        accept='image/*'
        onChange={(e)=>{
            const file=e.target.files?.[0];
            if(file) handleReceitptScan(file);
        }} 
        
        
        />

        <Button 
        type="button"
        variant="outline"
                className="w-full h-10 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-500 animate-gradient hover:opacity-90 transition-opacity text-white hover:text-white"

                onClick={()=>fileInputRef.current?.click()}
                disabled={scanReceiptLoading}
        >
            {scanReceiptLoading?(
                <>
                <Loader2 className="mr-2 animate-spin"/>
                <span>Scanning Receipt....</span>
                
                </>
            ):(

                <>
                <Camera className="mr-2"/>
                <span>Scan Receipt with AI</span>

                
                </>
            )}

        </Button>

    </div>

  )
}

export default ReciptScanner