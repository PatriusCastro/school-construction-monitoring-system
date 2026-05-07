import { FileDown, RefreshCw } from 'lucide-react'

interface ReportsHeaderProps {
  loading: boolean
  onRefresh: () => void
}

export default function ReportsHeader({ loading, onRefresh }: ReportsHeaderProps) {
  return (
    <div className="px-6 py-5 flex items-center justify-end">
      <button
        onClick={onRefresh}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
      >
        <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
        Refresh
      </button>
    </div>
  )
}
