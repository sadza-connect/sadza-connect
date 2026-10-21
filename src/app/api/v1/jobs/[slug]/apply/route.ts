import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { jobRepository } from '@/infrastructure/database/repositories/job-repository';
import {
  jsonResponse,
  errorResponse,
  parseAndValidateBody,
} from '@/shared/utils/route-handler';
import { NotFoundError } from '@/shared/errors/AppError';

export const runtime = 'nodejs';

const applyJobSchema = z.object({
  applicant_name: z.string().min(2, 'Full name is required'),
  applicant_email: z.string().email('Valid email address is required'),
  applicant_phone: z.string().min(6, 'Contact phone number is required'),
  experience_summary: z.string().optional(),
  cv_file_name: z.string().optional(),
  cv_url: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const { slug } = await params;
    const job = await jobRepository.findBySlug(slug);

    if (!job) {
      throw new NotFoundError(`Job opening '${slug}' was not found`);
    }

    const body = await parseAndValidateBody(req, applyJobSchema);

    const application = await jobRepository.createApplication({
      job_id: job.id,
      applicant_name: body.applicant_name.trim(),
      applicant_email: body.applicant_email.trim().toLowerCase(),
      applicant_phone: body.applicant_phone.trim(),
      experience_summary: body.experience_summary?.trim() || null,
      cv_file_name: body.cv_file_name || 'Application_Summary.pdf',
      cv_url: body.cv_url || null,
    });

    const hrPhone = job.whatsapp || '263773333444';
    const whatsappLink = `https://wa.me/${hrPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
      `Hello ${job.company_name}, I have submitted my formal application for the '${job.title}' position on Sadza Connect (Ref: APP-${application.id.slice(0, 8)}). My name is ${body.applicant_name}.`
    )}`;

    return jsonResponse(
      {
        message: 'Your job application has been submitted successfully to the hiring team.',
        application,
        whatsapp_hr_link: whatsappLink,
      },
      requestId,
      201
    );
  } catch (err) {
    return errorResponse(err, requestId);
  }
}
