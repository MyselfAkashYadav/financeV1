import React from 'react'
import { Suspense } from 'react'
import DashboardPage from './page'
import { BarLoader } from 'react-spinners'

const dashboardLayout = () => {
  return (
    <div className="px-5">
      <div className="flex items-center justify-between mb-5">
       
      </div>
      <Suspense
        fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea" />}
      >
        <DashboardPage />
      </Suspense>
    </div>
  )
}

export default dashboardLayout