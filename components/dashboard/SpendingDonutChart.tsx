'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
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
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-medium">{emoji} {name}</p>
      <p className="text-indigo-600 font-semibold">{formatRupiahCompact(value)}</p>
    </div>
  )
}

function CustomLegend({ payload }: { payload?: any[] }) {
  if (!payload) return null
  return (
    <ul className="flex flex-col gap-1.5 text-xs mt-2">
      {payload.slice(0, 6).map((entry) => (
        <li key={entry.value} className="flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="truncate text-slate-600">{CATEGORY_EMOJI[entry.value] ?? ''} {entry.value}</span>
          <span className="ml-auto font-medium text-slate-700">
            {formatRupiahCompact(entry.payload.value)}
          </span>
        </li>
      ))}
    </ul>
  )
}

export function SpendingDonutChart({ data, loading }: Props) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart2 className="h-4 w-4 text-indigo-500" />
          Breakdown Pengeluaran
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[220px] flex items-center justify-center">
            <div className="h-32 w-32 rounded-full border-8 border-slate-100 animate-pulse" />
          </div>
        ) : data.length === 0 ? (
          <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm">
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
                      fill={CATEGORY_COLORS[entry.category] ?? '#94a3b8'}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <CustomLegend payload={data.map((d) => ({ value: d.category, color: CATEGORY_COLORS[d.category] ?? '#94a3b8', payload: d }))} />
          </>
        )}
      </CardContent>
    </Card>
  )
}
