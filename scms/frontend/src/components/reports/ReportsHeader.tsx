import { FileDown, RefreshCw } from 'lucide-react'

interface ReportsHeaderProps {
  loading: boolean
  onRefresh: () => void
}

export default function ReportsHeader({ loading, onRefresh }: ReportsHeaderProps) {
  return (
    <div className="bg-white border-b border-slate-200 px-6 py-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
            <FileDown size={17} className="text-[#1a3a6b]" />
          </div>
          <div>
            <h1 className="text-[18px] font-semibold text-slate-900">Reports</h1>
            <p className="text-[12px] text-slate-400 mt-0.5">
              Generate and export construction reports — Legazpi City, Albay (Region V)
            </p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>
    </div>
  )
}
