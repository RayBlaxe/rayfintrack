import { FloatingDock } from './FloatingDock'

interface Props {
  children: React.ReactNode
}

export function AppShell({ children }: Props) {
  return (
    <div className="min-h-screen bg-[#0D1117] dark:bg-[#0D1117] light:bg-[#F8F9FA] flex justify-center">
      {/* Phone-width container */}
      <div className="relative w-full max-w-[480px] min-h-screen bg-[#0D1117]">
        {/* Scrollable main content */}
        <main className="pb-32">
          {children}
        </main>
        {/* Floating dock */}
        <FloatingDock />
      </div>

      {/* Desktop ambient bg */}
      <div
        className="fixed inset-0 -z-10 hidden md:block"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, #1b3a4b40 0%, #0D1117 70%)' }}
      />
    </div>
  )
}
