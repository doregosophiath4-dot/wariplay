// components/legal/BulletList.tsx
interface BulletListProps {
  items: string[]
}

export default function BulletList({ items }: BulletListProps) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-white/65 text-sm sm:text-base">
          <span className="text-emerald-400 font-bold mt-0.5 flex-shrink-0">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}