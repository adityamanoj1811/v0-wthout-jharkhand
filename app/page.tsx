"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { LoginForm } from "@/components/login-form"
import { MainLayout } from "@/components/main-layout"
import { HomePage } from "@/components/pages/home-page"
import { ProfilePage } from "@/components/pages/profile-page"
import { AnalyticsPage } from "@/components/pages/analytics-page"
import { SettingsPage } from "@/components/pages/settings-page"

export default function Home() {
  const { isAuthenticated } = useAuth()
  const [currentPage, setCurrentPage] = useState("home")

  if (!isAuthenticated) {
    return <LoginForm />
  }

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage />
      case "profile":
        return <ProfilePage />
      case "analytics":
        return <AnalyticsPage />
      case "settings":
        return <SettingsPage />
      default:
        return <HomePage />
    }
  }

  return (
    <MainLayout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </MainLayout>
  )
}
