'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CategorySpending } from '@/types'
import { CATEGORY_COLORS, CATEGORY_EMOJI } from '@/lib/constants'
import { formatRupiahCompact } from '@/lib/formatters'
import { BarChart2 } from 'lucide-react'

interface Props {
  data: CategorySpending[]
  loading?: boolean
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: any[] }) {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0]
  const emoji = CATEGORY_EMOJI[name] ?? '📁'
  return (
    <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-3 text-sm transition-colors">
      <p className="font-bold text-slate-900 dark:text-slate-100">{emoji} {name}</p>
      <p className="text-emerald-700 dark:text-emerald-400 font-bold font-mono text-sm">{formatRupiahCompact(value)}</p>
    </div>
  )
}

function CustomLegend({ payload }: { payload?: any[] }) {
  if (!payload) return null
  return (
    <ul className="flex flex-col gap-2 text-xs mt-3">
      {payload.slice(0, 6).map((entry) => (
        <li key={entry.value} className="flex items-center gap-2">
          <span
            className="inline-block h-3 w-3 rounded-full flex-shrink-0 shadow-2xs"
            style={{ backgroundColor: entry.color }}
          />
          <span className="truncate text-slate-700 dark:text-slate-300 font-medium">{CATEGORY_EMOJI[entry.value] ?? ''} {entry.value}</span>
          <span className="ml-auto font-bold font-mono text-slate-900 dark:text-slate-100">
            {formatRupiahCompact(entry.payload.value)}
          </span>
        </li>
      ))}
    </ul>
  )
}

export function SpendingDonutChart({ data, loading }: Props) {
  return (
    <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-sm transition-colors">
      <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
        <CardTitle className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          <BarChart2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          Breakdown Pengeluaran
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {loading ? (
          <div className="h-[220px] flex items-center justify-center">
            <div className="h-32 w-32 rounded-full border-8 border-slate-200 dark:border-slate-800 animate-pulse" />
          </div>
        ) : data.length === 0 ? (
          <div className="h-[220px] flex items-center justify-center text-slate-500 dark:text-slate-400 text-sm font-medium">
            Belum ada pengeluaran bulan ini
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                  dataKey="amount"
                  nameKey="category"
                >
                  {data.map((entry) => (
                    <Cell
                      key={entry.category}
                      fill={CATEGORY_COLORS[entry.category] ?? '#10B981'}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <CustomLegend payload={data.map((d) => ({ value: d.category, color: CATEGORY_COLORS[d.category] ?? '#10B981', payload: d }))} />
          </>
        )}
      </CardContent>
    </Card>
  )
}
