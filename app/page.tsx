import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'

export default function Home() {
  return (
    <div className='flex items-center justify-center m-10'>
      Hello FMS 

      <Button>Click Me</Button>
      
       <Link href={'/login'}>Got to Login</Link>
    </div>
  )
}
