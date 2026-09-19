'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatMonthYear } from '@/lib/formatters'

interface Props {
  date: Date
  onChange: (date: Date) => void
}

export function MonthPicker({ date, onChange }: Props) {
  const prev = () => {
    const d = new Date(date)
    d.setMonth(d.getMonth() - 1)
    onChange(d)
  }
  const next = () => {
    const d = new Date(date)
    d.setMonth(d.getMonth() + 1)
    onChange(d)
  }
  const isCurrentMonth =
    date.getMonth() === new Date().getMonth() &&
    date.getFullYear() === new Date().getFullYear()

  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prev}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm font-medium min-w-[120px] text-center">
        {formatMonthYear(date)}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={next}
        disabled={isCurrentMonth}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
