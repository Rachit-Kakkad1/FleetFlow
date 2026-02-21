import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

export default function DataTable({ columns, data, onRowClick, emptyMessage = 'No data found' }) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const perPage = 10;

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  let filtered = data;
  if (search) {
    const q = search.toLowerCase();
    filtered = data.filter(row =>
      columns.some(col => {
        const val = col.accessor ? col.accessor(row) : row[col.key];
        return String(val).toLowerCase().includes(q);
      })
    );
  }

  if (sortKey) {
    const col = columns.find(c => c.key === sortKey);
    filtered = [...filtered].sort((a, b) => {
      const av = col?.accessor ? col.accessor(a) : a[sortKey];
      const bv = col?.accessor ? col.accessor(b) : b[sortKey];
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice(page * perPage, (page + 1) * perPage);

  return (
    <div className="data-table-wrapper">
      <div style={{
        padding: '10px 14px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <Search size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0); }}
          style={{
            border: 'none', outline: 'none', background: 'transparent',
            fontFamily: 'var(--font-sans)', fontSize: '0.8125rem',
            color: 'var(--text-primary)', width: '100%',
          }}
        />
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  style={col.sortable === false ? { cursor: 'default' } : {}}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    {col.label}
                    {sortKey === col.key && (
                      <span style={{ fontSize: '0.6rem', opacity: 0.8 }}>
                        {sortDir === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{
                  textAlign: 'center', padding: 48,
                  color: 'var(--text-muted)', fontSize: '0.8125rem',
                }}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paged.map((row, i) => (
                <motion.tr
                  key={row.id || i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: i * 0.03 }}
                  onClick={() => onRowClick?.(row)}
                  style={onRowClick ? { cursor: 'pointer' } : {}}
                >
                  {columns.map(col => (
                    <td key={col.key} data-label={col.label}>
                      {col.render ? col.render(row) : (col.accessor ? col.accessor(row) : row[col.key])}
                    </td>
                  ))}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="pagination">
          <span>
            {page * perPage + 1}–{Math.min((page + 1) * perPage, filtered.length)} of {filtered.length}
          </span>
          <div className="pagination-buttons">
            <button className="pagination-btn" onClick={() => setPage(p => p - 1)} disabled={page === 0}>
              <ChevronLeft size={14} />
            </button>
            <button className="pagination-btn" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
