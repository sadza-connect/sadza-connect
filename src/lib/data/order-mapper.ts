export interface AdminOrderItem {
  id: string;
  orderNumber: string;
  client: string;
  email: string;
  phone: string;
  province: string;
  address: string;
  supplierName: string;
  items: string;
  amountUsd: number;
  status: 'Processing' | 'In Transit' | 'Delivered' | 'Cancelled';
  waybillRef: string;
  date: string;
  notes: string;
  carrier?: string;
}

export function mapDbOrderToAdminOrderItem(order: any): AdminOrderItem {
  let itemsStr = 'Merchandise Order';
  try {
    if (typeof order.items === 'string') {
      const parsed = JSON.parse(order.items);
      if (Array.isArray(parsed)) {
        itemsStr = parsed.map((it: any) => typeof it === 'string' ? it : `${it.quantity || 1}x ${it.title || it.name}`).join(', ');
      } else {
        itemsStr = order.items;
      }
    } else if (Array.isArray(order.items)) {
      itemsStr = order.items.map((it: any) => typeof it === 'string' ? it : `${it.quantity || 1}x ${it.title || it.name}`).join(', ');
    }
  } catch {
    itemsStr = 'Merchandise Items';
  }

  const dateStr = order.created_at
    ? new Date(order.created_at).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);

  return {
    id: String(order.id),
    orderNumber: order.order_number,
    client: order.customer_name || 'Customer',
    email: order.customer_email || order.email || 'N/A',
    phone: order.customer_phone || '',
    province: order.customer_province || order.province || 'Nationwide',
    address: order.customer_address || order.address || 'Direct Dispatch',
    supplierName: order.business_name || 'Verified Zimbabwean Supplier',
    items: itemsStr,
    amountUsd: Number(order.total_usd) || 0,
    status: (order.status as any) || 'Processing',
    waybillRef: order.waybill_number || `WB-ZIM-${String(order.id).slice(0, 6)}`,
    date: dateStr,
    notes: order.carrier ? `Dispatched via ${order.carrier}.` : 'Pending courier assignment.',
    carrier: order.carrier || undefined,
  };
}
