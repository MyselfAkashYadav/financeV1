"use client"
import { Divide } from 'lucide-react'
import React, { useRef, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import Link from 'next/link'



const hero = () => {

    const heroImageRef = useRef();
    useEffect(() => {
      const imageElement=heroImageRef.current;
      const handleScroll=()=>{

        const scrollPosition=window.scrollY;
        const scrollThreshold=100;
        if(scrollPosition>scrollThreshold){
          imageElement.classList.add("scrolled");  
        }else{
            imageElement.classList.remove("scrolled");
        }
      } 
      window.addEventListener("scroll",handleScroll) 

      return ()=>window.removeEventListener("scroll",handleScroll)
    },[])
    
  return (
    <div className='pb-20 px-4'>
        <div className='container mx-auto text-center'>
            {/* hero heading */}
            <h1 className='text-5xl md:text-8xl lg:text-[105px] pb-6 gradient-title'>
                Manage Your Finances <br/> With Intelligence
            </h1>
            {/* hero description */}
            <p className='text-xl text-gray-600 mb-8 max-w-2xl mx-auto'>
               An AI-powered financial management platform that helps uou track,analyze,and optimize your finances in real-time.
            </p>
            {/* hero buttons */}
            <div className="flex justify-center space-x-4">
                <Link href="/dashboard">
                <Button className="lg " >Get Started</Button>
                </Link>
                <Link href="/dashboard">
                <Button className="lg " variant="outline">Watch Demo</Button>
                </Link>
            </div>
            {/* hero image */}
            <div className="hero-image-wrapper">
                <div ref={heroImageRef} className="hero-image">
                    <Image src="/banner.jpg"
                    width={1280}
                    height={720}
                    alt="hero image"
                    className="rounded-lg shadow-2xl border mx-auto"
                    priority
                    />
                </div>

            </div>
        </div>

    </div>
  )
}

export default hero