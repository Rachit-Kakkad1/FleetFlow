import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const num = typeof target === 'number' ? target : parseFloat(String(target).replace(/[^0-9.-]/g, ''));
    if (isNaN(num) || num === 0) { setValue(0); return; }

    const startTime = performance.now();
    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * num));
      if (progress < 1) ref.current = requestAnimationFrame(animate);
    };
    ref.current = requestAnimationFrame(animate);
    return () => { if (ref.current) cancelAnimationFrame(ref.current); };
  }, [target, duration]);

  return value;
}

export default function StatCard({ icon: Icon, label, value, sub, delta, deltaLabel }) {
  const numericValue = typeof value === 'number' ? value : null;
  const counted = useCountUp(numericValue || 0);
  const isNumeric = numericValue !== null;
  const isPositiveDelta = delta && delta > 0;

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      style={{ padding: '18px 20px', position: 'relative', overflow: 'hidden' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
            {label}
          </p>
          <p className="mono" style={{ fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.1, color: 'var(--text-primary)' }}>
            {isNumeric ? counted.toLocaleString('en-IN') : value}
          </p>
        </div>
        {Icon && (
          <div style={{ color: 'var(--text-muted)', opacity: 0.5 }}>
            <Icon size={22} strokeWidth={1.5} />
          </div>
        )}
      </div>

      {(delta !== undefined && delta !== null) && (
        <p style={{ fontSize: '0.7rem', fontWeight: 600, marginTop: 8, color: isPositiveDelta ? 'var(--status-success)' : 'var(--status-error)' }}>
          {isPositiveDelta ? '↑' : '↓'} {Math.abs(delta)}% {deltaLabel || 'vs yesterday'}
        </p>
      )}

      {sub && !delta && (
        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 6 }}>
          {sub}
        </p>
      )}
    </motion.div>
  );
}
