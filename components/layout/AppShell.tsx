'use client'

import { usePathname } from 'next/navigation'
import { FloatingDock } from './FloatingDock'
import { AuthProvider } from '@/context/AuthContext'

interface Props {
  children: React.ReactNode
}

function AppShellContent({ children }: Props) {
  const pathname = usePathname()
  const isAuthPage = pathname === '/login' || pathname === '/register'

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-slate-50 flex justify-center transition-colors">
      {/* Phone-width container */}
      <div className="relative w-full max-w-[480px] min-h-screen bg-slate-50 dark:bg-[#090D16] border-x border-slate-200/70 dark:border-white/5 transition-colors">
        {/* Scrollable main content with bottom padding for FloatingDock */}
        <main className={isAuthPage ? '' : 'pb-32'}>
          {children}
        </main>
        {/* Floating dock only on non-auth pages */}
        {!isAuthPage && <FloatingDock />}
      </div>

      {/* Desktop ambient bg */}
      <div
        className="fixed inset-0 -z-10 hidden md:block pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(16, 185, 129, 0.12) 0%, transparent 65%)',
        }}
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
