import { ShieldCheck } from 'lucide-react'
import { logout } from '@/app/actions/auth'

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
      >
        <ShieldCheck className="h-4 w-4" />
        Esci
      </button>
    </form>
  )
}
