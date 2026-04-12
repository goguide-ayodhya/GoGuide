"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"
import { useAuth } from "@/contexts/AuthContext"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading, isLoggedIn } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!loading) {
      if (!isLoggedIn) {
        router.push("/")
        return
      }

      if (user?.role !== "ADMIN") {
        router.push("/")
        return
      }
    }
  }, [user, loading, isLoggedIn, router])

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render anything if not authenticated or not admin
  if (!isLoggedIn || user?.role !== "ADMIN") {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        {/* Main content */}
        <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
          <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
