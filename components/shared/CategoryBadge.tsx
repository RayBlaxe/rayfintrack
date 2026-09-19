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
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white ${className}`}
      style={{ backgroundColor: color }}
    >
      {showEmoji && <span>{emoji}</span>}
      <span className="truncate max-w-[120px]">{category}</span>
    </span>
  )
}
