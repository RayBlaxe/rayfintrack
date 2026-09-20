'use client'

import { usePathname } from 'next/navigation'
import { FloatingDock } from './FloatingDock'
import { AuthProvider } from '@/context/AuthContext'

interface Props {
  children: React.ReactNode
}

function AppShellContent({ children }: Props) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/login'

  return (
    <div className="min-h-screen bg-[#0D1117] dark:bg-[#0D1117] light:bg-[#F8F9FA] flex justify-center">
      {/* Phone-width container */}
      <div className="relative w-full max-w-[480px] min-h-screen bg-[#0D1117]">
        {/* Scrollable main content */}
        <main className={isLoginPage ? '' : 'pb-32'}>
          {children}
        </main>
        {/* Floating dock only on non-login pages */}
        {!isLoginPage && <FloatingDock />}
      </div>

      {/* Desktop ambient bg */}
      <div
        className="fixed inset-0 -z-10 hidden md:block"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, #1b3a4b40 0%, #0D1117 70%)' }}
      />
    </div>
  )
}

export function AppShell({ children }: Props) {
  return (
    <AuthProvider>
      <AppShellContent>{children}</AppShellContent>
    </AuthProvider>
  )
}
