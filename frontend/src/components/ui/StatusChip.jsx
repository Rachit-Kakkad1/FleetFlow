import { Truck, Navigation, Wrench, CheckCircle2, XCircle, FileText, UserCheck, UserX, Ban, CircleDot } from 'lucide-react';

const statusConfig = {
  'Available': { icon: CheckCircle2, className: 'available' },
  'On Trip': { icon: Navigation, className: 'on-trip' },
  'In Shop': { icon: Wrench, className: 'in-shop' },
  'Retired': { icon: Ban, className: 'retired' },
  'Draft': { icon: FileText, className: 'draft' },
  'Dispatched': { icon: Navigation, className: 'dispatched' },
  'Completed': { icon: CheckCircle2, className: 'completed' },
  'Cancelled': { icon: XCircle, className: 'cancelled' },
  'On Duty': { icon: UserCheck, className: 'on-duty' },
  'Off Duty': { icon: UserX, className: 'off-duty' },
  'Suspended': { icon: Ban, className: 'suspended' },
  'Expired': { icon: XCircle, className: 'expired' },
};

export default function StatusChip({ status }) {
  const config = statusConfig[status] || { icon: CircleDot, className: 'draft' };
  const Icon = config.icon;

  return (
    <span className={`status-chip ${config.className}`}>
      <Icon size={12} />
      {status}
    </span>
  );
}
