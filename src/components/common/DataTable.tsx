import React from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  emptyTitle?: string;
  emptyDescription?: string;
  mobileCardRender?: (item: T) => React.ReactNode;
  isLoading?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyTitle = 'No records found',
  emptyDescription = 'There are currently no entries to display in this list.',
  mobileCardRender,
  isLoading = false,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-brand border border-border-subtle p-12 text-center shadow-xs">
        <div className="inline-block animate-spin w-7 h-7 border-3 border-navy border-t-mint rounded-full mb-3" />
        <p className="text-xs font-semibold text-content-muted">Loading records...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-brand border border-border-subtle p-12 text-center shadow-xs">
        <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto mb-3 text-slate-400">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h4 className="text-sm font-heading font-bold text-navy">{emptyTitle}</h4>
        <p className="text-xs text-content-muted mt-1 max-w-sm mx-auto">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mobile Card View (if mobileCardRender provided, hidden on md+) */}
      {mobileCardRender && (
        <div className="md:hidden space-y-3">
          {data.map((item) => (
            <div
              key={keyExtractor(item)}
              className="bg-white p-4 rounded-brand border border-slate-200 shadow-xs hover:border-slate-300 transition-colors"
            >
              {mobileCardRender(item)}
            </div>
          ))}
        </div>
      )}

      {/* Desktop Responsive Table with Contained Horizontal Scroll */}
      <div
        className={`bg-white rounded-brand border border-slate-200/90 shadow-xs overflow-hidden ${
          mobileCardRender ? 'hidden md:block' : 'block'
        }`}
      >
        <div className="overflow-x-auto custom-scrollbar w-full">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {columns.map((col) => (
                  <th key={col.key} className={`py-3.5 px-5 font-heading select-none ${col.className || ''}`}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((item, idx) => (
                <tr
                  key={keyExtractor(item)}
                  className={`hover:bg-slate-50/75 transition-colors ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-[#FAFCFB]'
                  }`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`py-3.5 px-5 text-content-body align-middle ${col.className || ''}`}>
                      {col.render
                        ? col.render(item)
                        : ((item as any)[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Clean subtle footer with row count */}
        <div className="px-5 py-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong className="font-semibold text-navy">{data.length}</strong> record{data.length === 1 ? '' : 's'}
          </span>
          <span className="text-[11px] text-slate-400">
            Interactive demonstration dataset
          </span>
        </div>
      </div>
    </div>
  );
}
