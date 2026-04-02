import { NavLink } from 'react-router-dom'
import { Globe, BarChart3, CalendarDays } from 'lucide-react'

export function Navbar() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20'
        : 'text-slate-400 hover:text-slate-100 hover:bg-[#1A2235]'
    }`

  return (
    <nav className="bg-[#111827] border-b border-[#1E2D45] sticky top-0 z-50">
      <div className="flex items-center h-14 px-6 gap-6">
        <div className="flex items-center gap-2.5 mr-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Globe size={15} className="text-white" />
          </div>
          <span className="font-bold text-slate-100 text-base tracking-tight">
            Daily Work Management
          </span>
        </div>

        <div className="flex gap-1">
          <NavLink to="/" end className={linkClass}>
            <BarChart3 size={15} />
            Publishing Overview
          </NavLink>
          <NavLink to="/daily-work" className={linkClass}>
            <CalendarDays size={15} />
            Daily Work
          </NavLink>
        </div>
      </div>
    </nav>
  )
}
