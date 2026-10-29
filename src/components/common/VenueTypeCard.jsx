import React from 'react'
import { ChevronRight } from 'lucide-react'

export default function VenueTypeCard({ icon: Icon, title, description, count }) {
  return (
    <div className="group h-full bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between">
      <div className="flex-1 flex flex-col">
        <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-150 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/40 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:border-blue-200 dark:group-hover:border-blue-700 transition-colors mb-5 shrink-0">
          <Icon className="w-6 h-6 stroke-[1.6]" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
          {title}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-300 leading-relaxed min-h-[40px]">
          {description}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {count} Available
        </span>
        <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors">
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  )
}
