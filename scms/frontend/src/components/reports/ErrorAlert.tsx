import { AlertCircle, X } from 'lucide-react'
import { useState } from 'react'

interface ErrorAlertProps {
  message: string
}

export default function ErrorAlert({ message }: ErrorAlertProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="mb-6 px-4 py-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
      <AlertCircle size={16} className="text-red-600 mt-0.5 shrink-0" />
      <div className="flex-1">
        <p className="text-[13px] font-medium text-red-900">{message}</p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-red-400 hover:text-red-600 transition-colors shrink-0"
        aria-label="Dismiss error"
      >
        <X size={16} />
      </button>
    </div>
  )
}
