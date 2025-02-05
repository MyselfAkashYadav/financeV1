"use client"
import { Divide } from 'lucide-react'
import React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import Link from 'next/link'


const hero = () => {
  return (
    <div className='pb-20 px-4'>
        <div className='container mx-auto text-center'>
            {/* hero heading */}
            <h1 className='text-5xl md:text-8xl lg:text-[105px] pb-6 gradient-title'>
                Manage Your Finances <br/> With Intelligence
            </h1>
            {/* hero description */}
            <p>
               An AI-powered financial management platform that helps uou track,analyze,and optimize your finances in real-time.
            </p>
            {/* hero buttons */}
            <div>
                <Link href="/dashboard">
                <Button className="lg " >Get Started</Button>
                </Link>
                <Link href="/dashboard">
                <Button className="lg " variant="outline">Watch Demo</Button>
                </Link>
            </div>
            {/* hero image */}
            <div>
                <div>
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