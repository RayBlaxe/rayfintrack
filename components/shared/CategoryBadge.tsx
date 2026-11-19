import { CATEGORY_EMOJI, CATEGORY_COLORS } from '@/lib/constants'

interface Props {
  category: string
  showEmoji?: boolean
  className?: string
}

function getDeterministicColor(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const colors = [
    '#10B981', '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6',
    '#EC4899', '#F43F5E', '#F97316', '#EAB308', '#14B8A6'
  ]
  return colors[Math.abs(hash) % colors.length]
}

export function CategoryBadge({ category, showEmoji = true, className = '' }: Props) {
  const emoji = CATEGORY_EMOJI[category] ?? '📦'
  const color = CATEGORY_COLORS[category] ?? getDeterministicColor(category || 'Lainnya')

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 ${className}`}
    >
      <span className="h-2 w-2 rounded-full flex-shrink-0 shadow-xs" style={{ backgroundColor: color }} />
      {showEmoji && <span className="text-[11px]">{emoji}</span>}
      <span className="truncate max-w-[130px]">{category || 'Umum'}</span>
    </span>
  )
}
