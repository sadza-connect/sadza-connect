import { NextRequest } from 'next/server';
import { randomUUID, randomInt } from 'node:crypto';
import { z } from 'zod';
import { orderRepository } from '@/infrastructure/database/repositories/order-repository';
import { mapDbOrderToAdminOrderItem } from '@/lib/data/order-mapper';
import { getAuthenticatedUser } from '@/shared/utils/auth-session';
import {
  jsonResponse,
  errorResponse,
  parseAndValidateBody,
} from '@/shared/utils/route-handler';

export const runtime = 'nodejs';

const createOrderSchema = z.object({
  order_number: z.string().optional(),
  customer_name: z.string().min(2, 'Customer name is required'),
  customer_phone: z.string().min(5, 'Customer phone number is required'),
  customer_address: z.string().optional(),
  business_id: z.string().uuid().optional(),
  business_name: z.string().optional(),
  items: z.any().optional(),
  total_usd: z.number().nonnegative('Total amount must be greater than or equal to 0'),
  waybill_number: z.string().optional(),
  carrier: z.string().optional(),
  status: z.enum(['Processing', 'In Transit', 'Delivered', 'Cancelled']).default('Processing'),
});

export async function GET(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') || undefined;
    const carrier = searchParams.get('carrier') || undefined;
    const businessId = searchParams.get('business_id') || undefined;
    const myOrders = searchParams.get('my_orders') === 'true';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    let userId: string | undefined = undefined;
    if (myOrders) {
      const user = await getAuthenticatedUser(req, false);
      if (user) {
        userId = user.id;
      }
    }

    const result = await orderRepository.findOrders({
      search,
      status,
      carrier,
      businessId,
      userId,
      page,
      limit,
    });

    const stats = await orderRepository.getSummaryStats();
    const mappedOrders = result.orders.map(mapDbOrderToAdminOrderItem);

    return jsonResponse(
      {
        ...result,
        mappedOrders,
        stats,
      },
      requestId,
      200
    );
  } catch (err) {
    return errorResponse(err, requestId);
  }
}

export async function POST(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const user = await getAuthenticatedUser(req, false);
    const body = await parseAndValidateBody(req, createOrderSchema);

    const generatedOrderNum = body.order_number || `SC-ORD-2026-${randomInt(1000, 10000)}`;
    const generatedWaybill = body.waybill_number || `WB-ZIM-${randomInt(10000, 99999)}`;

    const created = await orderRepository.create({
      order_number: generatedOrderNum,
      user_id: user?.id || null,
      customer_name: body.customer_name.trim(),
      customer_phone: body.customer_phone.trim(),
      customer_address: body.customer_address?.trim() || null,
      business_id: body.business_id || null,
      business_name: body.business_name?.trim() || 'Verified Zimbabwean Supplier',
      items: body.items || 'Equipment Merchandise',
      total_usd: body.total_usd,
      waybill_number: generatedWaybill,
      carrier: body.carrier?.trim() || 'Swift Transit',
      status: body.status || 'Processing',
    });

    return jsonResponse(
      {
        message: 'Order created and assigned logistics waybill successfully.',
        order: created,
        mappedOrder: mapDbOrderToAdminOrderItem(created),
      },
      requestId,
      201
    );
  } catch (err) {
    return errorResponse(err, requestId);
  }
}
