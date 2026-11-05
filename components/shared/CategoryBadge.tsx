import { CATEGORY_EMOJI, CATEGORY_COLORS } from '@/lib/constants'

interface Props {
  category: string
  showEmoji?: boolean
  className?: string
}

export function CategoryBadge({ category, showEmoji = true, className = '' }: Props) {
  const emoji = CATEGORY_EMOJI[category] ?? '📁'
  const color = CATEGORY_COLORS[category] ?? '#94a3b8'

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 ${className}`}
    >
      <span className="h-2 w-2 rounded-full flex-shrink-0 shadow-xs" style={{ backgroundColor: color }} />
      {showEmoji && <span className="text-[11px]">{emoji}</span>}
      <span className="truncate max-w-[120px]">{category}</span>
    </span>
  )
}
