import Link from 'next/link'
import React from 'react'

export default function LoginPage() {
  return (
    <div>
      login
      <Link href={'/dashboard'}>Got to dashboard</Link>
    </div>
  )
}
