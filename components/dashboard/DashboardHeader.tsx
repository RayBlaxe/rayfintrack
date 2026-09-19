'use client'
import { useTheme } from 'next-themes'
import { Sun, Moon, Bell } from 'lucide-react'
import { motion } from 'framer-motion'

function getGreeting(): { text: string; emoji: string } {
  const h = new Date().getHours()
  if (h < 5)  return { text: 'Selamat malam',  emoji: '🌙' }
  if (h < 11) return { text: 'Selamat pagi',   emoji: '☀️' }
  if (h < 15) return { text: 'Selamat siang',  emoji: '🌤️' }
  if (h < 19) return { text: 'Selamat sore',   emoji: '🌅' }
  return       { text: 'Selamat malam',  emoji: '🌙' }
}

export function DashboardHeader() {
  const { theme, setTheme } = useTheme()
  const { text, emoji } = getGreeting()
  const userName = process.env.NEXT_PUBLIC_USER_NAME || 'Ray'

  return (
    <header className="flex items-center justify-between px-5 pt-8 pb-2">
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <p className="text-white/50 text-xs font-medium">
          {text} {emoji}
        </p>
        <h1 className="text-white text-xl font-bold mt-0.5">Halo, {userName}!</h1>
      </motion.div>

      <div className="flex items-center gap-2">
        {/* Dark/light toggle */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="h-9 w-9 rounded-full bg-white/8 border border-white/10 flex items-center justify-center hover:bg-white/15 transition-colors"
        >
          {theme === 'dark'
            ? <Sun className="h-4 w-4 text-white/70" />
            : <Moon className="h-4 w-4 text-white/70" />}
        </motion.button>

        {/* Notification bell */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="h-9 w-9 rounded-full bg-white/8 border border-white/10 flex items-center justify-center hover:bg-white/15 transition-colors relative"
        >
          <Bell className="h-4 w-4 text-white/70" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#CCFF00] pulse-dot" />
        </motion.button>
      </div>
    </header>
  )
}
