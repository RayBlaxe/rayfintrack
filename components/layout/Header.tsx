'use client'

import { Wallet } from 'lucide-react'
import { MonthPicker } from '@/components/shared/MonthPicker'

interface Props {
  date: Date
  onDateChange: (date: Date) => void
  title?: string
}

export function Header({ date, onDateChange, title = 'Dashboard' }: Props) {
  return (
    <header className="flex items-center justify-between px-4 py-4 bg-white border-b border-slate-200 md:hidden sticky top-0 z-30">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600">
          <Wallet className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="font-bold text-slate-800">{title}</span>
      </div>
      <MonthPicker date={date} onChange={onDateChange} />
    </header>
  )
}
