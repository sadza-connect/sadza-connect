import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { orderRepository } from '@/infrastructure/database/repositories/order-repository';
import { mapDbOrderToAdminOrderItem } from '@/lib/data/order-mapper';
import { getAuthenticatedUser } from '@/shared/utils/auth-session';
import {
  jsonResponse,
  errorResponse,
  parseAndValidateBody,
} from '@/shared/utils/route-handler';
import { AuthorizationError, NotFoundError } from '@/shared/errors/AppError';

export const runtime = 'nodejs';

const updateOrderSchema = z.object({
  status: z.enum(['Processing', 'In Transit', 'Delivered', 'Cancelled']).optional(),
  waybill_number: z.string().optional(),
  carrier: z.string().optional(),
  customer_name: z.string().optional(),
  customer_phone: z.string().optional(),
  customer_address: z.string().optional(),
  total_usd: z.number().nonnegative().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const { orderNumber } = await params;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderNumber);

    let order = null;
    if (isUuid) {
      order = await orderRepository.findById(orderNumber);
    }
    if (!order) {
      order = await orderRepository.findByOrderNumber(orderNumber);
    }

    if (!order) {
      throw new NotFoundError(`Order '${orderNumber}' was not found`);
    }

    return jsonResponse(
      {
        order,
        mappedOrder: mapDbOrderToAdminOrderItem(order),
      },
      requestId,
      200
    );
  } catch (err) {
    return errorResponse(err, requestId);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const caller = await getAuthenticatedUser(req, true);
    if (!caller || caller.role !== 'admin') {
      throw new AuthorizationError('Administrative privileges required');
    }

    const { orderNumber } = await params;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderNumber);

    let order = null;
    if (isUuid) {
      order = await orderRepository.findById(orderNumber);
    }
    if (!order) {
      order = await orderRepository.findByOrderNumber(orderNumber);
    }

    if (!order) {
      throw new NotFoundError(`Order '${orderNumber}' was not found`);
    }

    const body = await parseAndValidateBody(req, updateOrderSchema);
    const updated = await orderRepository.update(order.id, body);

    return jsonResponse(
      {
        message: 'Order and waybill tracking updated successfully.',
        order: updated,
        mappedOrder: mapDbOrderToAdminOrderItem(updated),
      },
      requestId,
      200
    );
  } catch (err) {
    return errorResponse(err, requestId);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const caller = await getAuthenticatedUser(req, true);
    if (!caller || caller.role !== 'admin') {
      throw new AuthorizationError('Administrative privileges required');
    }

    const { orderNumber } = await params;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderNumber);

    let order = null;
    if (isUuid) {
      order = await orderRepository.findById(orderNumber);
    }
    if (!order) {
      order = await orderRepository.findByOrderNumber(orderNumber);
    }

    if (!order) {
      throw new NotFoundError(`Order '${orderNumber}' was not found`);
    }

    await orderRepository.delete(order.id);

    return jsonResponse(
      {
        message: `Order '${orderNumber}' has been removed from dispatch records.`,
      },
      requestId,
      200
    );
  } catch (err) {
    return errorResponse(err, requestId);
  }
}
