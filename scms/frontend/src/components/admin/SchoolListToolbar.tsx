import { Search, X } from 'lucide-react'

interface Props {
  search: string
  priorityFilter: string
  totalFiltered: number
  totalAll: number
  onSearchChange: (v: string) => void
  onPriorityChange: (v: string) => void
  onClear: () => void
}

const PRIORITIES = ['All', 'High', 'Medium', 'Low']

export default function SchoolListToolbar({
  search,
  priorityFilter,
  totalFiltered,
  totalAll,
  onSearchChange,
  onPriorityChange,
  onClear,
}: Props) {
  const hasFilter = search || priorityFilter !== 'All'

  return (
    <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3 flex-wrap">
      <div>
        <h2 className="text-[13.5px] font-bold text-slate-800 leading-none">
          School Records
          <span className="ml-2 text-[12px] font-normal text-slate-400">
            ({totalFiltered}{totalFiltered !== totalAll ? ` of ${totalAll}` : ''})
          </span>
        </h2>
        {totalAll > 0 && (
          <p className="text-[11px] text-slate-400 mt-0.5">Region V · Division of Albay</p>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2 flex-wrap">
        {/* Search */}
        <div className="relative">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search name, ID, municipality…"
            className="pl-8 pr-7 py-2 text-[12px] border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-[#1a3a6b] focus:ring-2 focus:ring-[#1a3a6b]/10 transition-all placeholder:text-slate-400 w-56"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={11} />
            </button>
          )}
        </div>

        {/* Priority filter pills */}
        <div className="flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5">
          {PRIORITIES.map(p => (
            <button
              key={p}
              onClick={() => onPriorityChange(p)}
              className={`px-2.5 py-1.5 text-[11px] font-semibold rounded-md transition-all ${
                priorityFilter === p
                  ? 'bg-white text-[#1a3a6b] shadow-sm border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {hasFilter && (
          <button
            onClick={onClear}
            className="text-[11px] text-[#1a3a6b] font-medium hover:underline flex items-center gap-1"
          >
            <X size={10} /> Clear
          </button>
        )}
      </div>
    </div>
  )
}