import { S3Client, HeadObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'node:crypto';
import dotenv from 'dotenv';
import { getDb } from '../src/infrastructure/database/connection.js';
import { JwtService } from '../src/application/auth/jwt-service.js';
import { storageService } from '../src/infrastructure/storage/storage-service.js';

dotenv.config({ path: '.env.local' });

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME || 'sadzaconnect-media';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: accessKeyId!, secretAccessKey: secretAccessKey! },
});

// Helper to check if an object exists in Cloudflare R2
async function checkObjectExistsInR2(key: string): Promise<boolean> {
  try {
    await s3Client.send(new HeadObjectCommand({ Bucket: bucketName, Key: key }));
    return true;
  } catch (err: any) {
    if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
      return false;
    }
    throw err;
  }
}

// Sample minimal JPEG buffer
function createSampleJpeg(): Buffer {
  return Buffer.from([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
    0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43,
    0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
    0x09, 0x08, 0x0a, 0x0c, 0x14, 0x0d, 0x0c, 0x0b, 0x0b, 0x0c, 0x19, 0x12,
    0x13, 0x0f, 0x14, 0x1d, 0x1a, 0x1f, 0x1e, 0x1d, 0x1a, 0x1c, 0x1c, 0x20,
    0x24, 0x2e, 0x27, 0x20, 0x22, 0x2c, 0x23, 0x1c, 0x1c, 0x28, 0x37, 0x29,
    0x2c, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1f, 0x27, 0x39, 0x3d, 0x38, 0x32,
    0x3c, 0x2e, 0x33, 0x34, 0x32, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01,
    0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x1f, 0x00, 0x00,
    0x01, 0x05, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08,
    0x09, 0x0a, 0x0b, 0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f,
    0x00, 0xbf, 0x80, 0xff, 0xd9,
  ]);
}

// Sample minimal PDF buffer
function createSamplePdf(content: string): Buffer {
  return Buffer.from(`%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << >> >> endobj
4 0 obj << /Length ${content.length + 40} >>
stream
BT
/F1 12 Tf
72 712 Td
(${content}) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000216 00000 n 
trailer << /Size 5 /Root 1 0 R >>
startxref
310
%%EOF`);
}

async function uploadDirectToR2(key: string, buffer: Buffer, contentType = 'image/jpeg') {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function runLivePhysicalDeletionTests() {
  console.log('=============================================================================');
  console.log('    SADZA CONNECT — PHYSICAL LIVE CASCADING DELETION VERIFICATION SUITE       ');
  console.log('=============================================================================');
  console.log(`Cloudflare Target Bucket : ${bucketName}`);
  console.log(`Local API Base URL       : http://localhost:3000\n`);

  const db = getDb();
  const jwtService = new JwtService();

  // Find active admin user for authentication
  const admin = await db('users').where({ role: 'admin' }).whereNull('deleted_at').first();
  if (!admin) {
    throw new Error('No active administrator user found in database to execute test');
  }

  const adminToken = jwtService.generateAccessToken({
    userId: admin.id,
    role: 'admin',
    email: admin.email,
    accountType: 'personal',
  });
  const authHeaders = {
    Authorization: `Bearer ${adminToken}`,
    'Content-Type': 'application/json',
  };

  const domain = process.env.R2_PUBLIC_DOMAIN || 'https://pub-cf25c8105fd34ce5825064708d48e73d.r2.dev';

  // --------------------------------------------------------------------------
  // TEST 1: Physical Product Deletion & Cascading Image Purge
  // --------------------------------------------------------------------------
  console.log('▶ [TEST 1] Physical Product Deletion & Cloudflare R2 Asset Purge');
  const prodKey1 = `marketplace-products/live-test-cascade-prod-1-${Date.now()}.jpg`;
  const prodKey2 = `marketplace-products/live-test-cascade-prod-2-${Date.now()}.jpg`;
  const prodUrl1 = `${domain}/${prodKey1}`;
  const prodUrl2 = `${domain}/${prodKey2}`;

  // 1. Physically upload 2 product images to Cloudflare R2
  await uploadDirectToR2(prodKey1, createSampleJpeg());
  await uploadDirectToR2(prodKey2, createSampleJpeg());

  console.log(`  Uploaded Image 1 to Cloudflare R2: ${prodKey1}`);
  console.log(`  Uploaded Image 2 to Cloudflare R2: ${prodKey2}`);

  // Confirm they physically exist in Cloudflare R2
  if (!(await checkObjectExistsInR2(prodKey1)) || !(await checkObjectExistsInR2(prodKey2))) {
    throw new Error('Failed to pre-seed images into Cloudflare R2');
  }
  console.log(`  ✔ Confirmed both images physically exist in Cloudflare R2.`);

  // 2. Insert test product into database
  const sampleBusiness = await db('businesses').first();
  const testProdSlug = `cascade-test-product-${Date.now()}`;
  const [createdProduct] = await db('products')
    .insert({
      business_id: sampleBusiness.id,
      name: 'Cascading Test Solar Panel',
      slug: testProdSlug,
      description: 'Physical test item for deletion',
      category: 'Solar & Energy',
      price_usd: 150,
      price_zig: 3975,
      images: JSON.stringify([prodUrl1, prodUrl2]),
      in_stock: true,
      stock_quantity: 5,
      condition: 'Brand New',
    })
    .returning('*');

  console.log(`  ✔ Inserted test product in database: ID=${createdProduct.id}, Slug=${testProdSlug}`);

  // 3. Trigger HTTP DELETE /api/v1/products/[slug]
  console.log(`  Sending DELETE /api/v1/products/${testProdSlug}...`);
  const delProdRes = await fetch(`http://localhost:3000/api/v1/products/${testProdSlug}`, {
    method: 'DELETE',
    headers: authHeaders,
  });
  const delProdJson = await delProdRes.json();
  console.log(`  ✔ Product Delete API Status: ${delProdRes.status} (${delProdJson.message})`);

  // Wait 1.5 seconds for async cleanup
  await sleep(1500);

  // 4. Verify images are destroyed in Cloudflare R2
  const prod1StillExists = await checkObjectExistsInR2(prodKey1);
  const prod2StillExists = await checkObjectExistsInR2(prodKey2);

  if (!prod1StillExists && !prod2StillExists) {
    console.log(`  ✔ PASS: Image 1 (${prodKey1}) is GONE from Cloudflare R2! (404 Not Found)`);
    console.log(`  ✔ PASS: Image 2 (${prodKey2}) is GONE from Cloudflare R2! (404 Not Found)`);
    console.log(`  ✔ Zero orphaned product images left in Cloudflare R2!\n`);
  } else {
    throw new Error(`FAIL: Product images still exist in Cloudflare R2 after product deletion!`);
  }

  // --------------------------------------------------------------------------
  // TEST 2: Product Edit & Partial Image Purge (Replacing an image)
  // --------------------------------------------------------------------------
  console.log('▶ [TEST 2] Product Image Modification & Replaced Asset Purge');
  const oldImgKey = `marketplace-products/live-edit-old-${Date.now()}.jpg`;
  const keptImgKey = `marketplace-products/live-edit-kept-${Date.now()}.jpg`;
  const newImgKey = `marketplace-products/live-edit-new-${Date.now()}.jpg`;

  await uploadDirectToR2(oldImgKey, createSampleJpeg());
  await uploadDirectToR2(keptImgKey, createSampleJpeg());
  await uploadDirectToR2(newImgKey, createSampleJpeg());

  const editProdSlug = `cascade-edit-product-${Date.now()}`;
  await db('products').insert({
    business_id: sampleBusiness.id,
    name: 'Editable Test Product',
    slug: editProdSlug,
    description: 'Product for testing image replacement',
    category: 'Electronics',
    price_usd: 99,
    price_zig: 2623,
    images: JSON.stringify([`${domain}/${oldImgKey}`, `${domain}/${keptImgKey}`]),
  });

  console.log(`  Initial product images: [oldImgKey, keptImgKey]`);
  console.log(`  Sending PATCH to replace oldImgKey with newImgKey...`);

  const patchRes = await fetch(`http://localhost:3000/api/v1/products/${editProdSlug}`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({
      images: [`${domain}/${keptImgKey}`, `${domain}/${newImgKey}`],
    }),
  });
  console.log(`  ✔ Product PATCH API Status: ${patchRes.status}`);

  await sleep(1500);

  const oldStillExists = await checkObjectExistsInR2(oldImgKey);
  const keptStillExists = await checkObjectExistsInR2(keptImgKey);
  const newStillExists = await checkObjectExistsInR2(newImgKey);

  if (!oldStillExists && keptStillExists && newStillExists) {
    console.log(`  ✔ PASS: Replaced image (${oldImgKey}) was PURGED from Cloudflare R2! (404)`);
    console.log(`  ✔ PASS: Retained image (${keptImgKey}) remains safely in Cloudflare R2.`);
    console.log(`  ✔ PASS: New image (${newImgKey}) remains safely in Cloudflare R2.\n`);
  } else {
    throw new Error('FAIL: Replaced product image was not cleanly purged from Cloudflare R2!');
  }

  // Clean up edit product
  await fetch(`http://localhost:3000/api/v1/products/${editProdSlug}`, {
    method: 'DELETE',
    headers: authHeaders,
  });

  // --------------------------------------------------------------------------
  // TEST 3: Business Deletion & Mass Cascading Purge (Logo, Cover, KYC, Products, Ads, CVs)
  // --------------------------------------------------------------------------
  console.log('▶ [TEST 3] Complete Business Deletion & Cascading Purge Across All Assets');
  const bizLogoKey = `business-logos/cascade-biz-logo-${Date.now()}.jpg`;
  const bizCoverKey = `business-covers/cascade-biz-cover-${Date.now()}.jpg`;
  const bizKycKey = `kyc-documents/cascade-biz-cr14-${Date.now()}.pdf`;
  const bizProdImgKey = `marketplace-products/cascade-biz-prod-${Date.now()}.jpg`;
  const bizAdImgKey = `adverts/cascade-biz-ad-${Date.now()}.jpg`;
  const bizCvKey = `resumes/cascade-biz-resume-${Date.now()}.pdf`;

  // 1. Upload all 6 assets directly to Cloudflare R2
  await uploadDirectToR2(bizLogoKey, createSampleJpeg());
  await uploadDirectToR2(bizCoverKey, createSampleJpeg());
  await uploadDirectToR2(bizKycKey, createSamplePdf('CR14 CERTIFICATE OF INCORPORATION'), 'application/pdf');
  await uploadDirectToR2(bizProdImgKey, createSampleJpeg());
  await uploadDirectToR2(bizAdImgKey, createSampleJpeg());
  await uploadDirectToR2(bizCvKey, createSamplePdf('APPLICANT CURRICULUM VITAE'), 'application/pdf');

  console.log(`  Pre-seeded 6 assets into Cloudflare R2:`);
  console.log(`    - Logo       : ${bizLogoKey}`);
  console.log(`    - Cover      : ${bizCoverKey}`);
  console.log(`    - KYC Doc    : ${bizKycKey}`);
  console.log(`    - Product    : ${bizProdImgKey}`);
  console.log(`    - Advert     : ${bizAdImgKey}`);
  console.log(`    - Resume CV  : ${bizCvKey}`);

  // 2. Insert test business into PostgreSQL
  const testBizSlug = `cascade-test-enterprise-${Date.now()}`;
  const [createdBiz] = await db('businesses')
    .insert({
      name: 'Cascade Test Enterprise Private Limited',
      slug: testBizSlug,
      province: 'Harare',
      city: 'Harare',
      address: '100 Samora Machel Avenue',
      sector: 'Technology & Hardware',
      business_type: 'Registered Company',
      phone: '+263771122334',
      email: `cascade-${Date.now()}@example.co.zw`,
      logo_url: `${domain}/${bizLogoKey}`,
      cover_url: `${domain}/${bizCoverKey}`,
      kyc_documents: JSON.stringify([
        {
          name: 'CR14_Certificate.pdf',
          docType: 'cr14',
          key: bizKycKey,
          url: `/api/v1/storage/view?key=${encodeURIComponent(bizKycKey)}`,
        },
      ]),
      is_verified: true,
      user_id: admin.id,
    })
    .returning('*');

  // Attach a product to this business
  const testBizProdSlug = `biz-product-${Date.now()}`;
  await db('products').insert({
    business_id: createdBiz.id,
    name: 'Enterprise Router',
    slug: testBizProdSlug,
    category: 'Electronics',
    price_usd: 250,
    price_zig: 6625,
    images: JSON.stringify([`${domain}/${bizProdImgKey}`]),
  });

  // Attach an advert to this business
  const [createdAd] = await db('adverts')
    .insert({
      id: randomUUID(),
      business_id: createdBiz.id,
      business_name: createdBiz.name,
      province: 'Harare',
      category: 'Technology & Hardware',
      offer_type: 'Special Discount',
      headline: 'Enterprise Grade Hardware',
      offer_text: 'Get 20% off all routers',
      image: `${domain}/${bizAdImgKey}`,
      is_active: true,
    })
    .returning('*');

  // Attach a job opening to this business
  const testJobSlug = `network-engineer-${Date.now()}`;
  const [createdJob] = await db('jobs')
    .insert({
      business_id: createdBiz.id,
      company_name: createdBiz.name,
      title: 'Senior Network Engineer',
      slug: testJobSlug,
      province: 'Harare',
      city: 'Harare',
      job_type: 'Full-time',
      salary_usd: '2500 USD',
      description: 'Looking for network engineers',
    })
    .returning('*');

  // Attach a job application with CV to this job
  await db('job_applications').insert({
    job_id: createdJob.id,
    applicant_name: 'Farai Moyo',
    applicant_email: 'farai.moyo@example.co.zw',
    applicant_phone: '+263772998877',
    cv_url: `${domain}/${bizCvKey}`,
    status: 'Submitted',
  });

  console.log(`  ✔ Created Business (ID=${createdBiz.id}) with attached Product, Advert, Job, and Applicant CV.`);

  // 3. Trigger DELETE /api/v1/businesses/[slug]
  console.log(`  Sending DELETE /api/v1/businesses/${testBizSlug}...`);
  const delBizRes = await fetch(`http://localhost:3000/api/v1/businesses/${testBizSlug}`, {
    method: 'DELETE',
    headers: authHeaders,
  });
  const delBizJson = await delBizRes.json();
  console.log(`  ✔ Business Delete API Status: ${delBizRes.status} (${delBizJson.message})`);

  // Wait 2.5 seconds for complete async cleanup
  await sleep(2500);

  // 4. Verify ALL 6 assets are physically destroyed in Cloudflare R2
  const results = await Promise.all([
    checkObjectExistsInR2(bizLogoKey),
    checkObjectExistsInR2(bizCoverKey),
    checkObjectExistsInR2(bizKycKey),
    checkObjectExistsInR2(bizProdImgKey),
    checkObjectExistsInR2(bizAdImgKey),
    checkObjectExistsInR2(bizCvKey),
  ]);

  const [logoLeft, coverLeft, kycLeft, prodImgLeft, adImgLeft, cvLeft] = results;

  console.log(`  Cloudflare R2 Verification After Business Deletion:`);
  console.log(`    - Logo       : ${logoLeft ? '✘ STILL PRESENT' : '✔ PURGED (404 Not Found)'}`);
  console.log(`    - Cover      : ${coverLeft ? '✘ STILL PRESENT' : '✔ PURGED (404 Not Found)'}`);
  console.log(`    - KYC Doc    : ${kycLeft ? '✘ STILL PRESENT' : '✔ PURGED (404 Not Found)'}`);
  console.log(`    - Product Img: ${prodImgLeft ? '✘ STILL PRESENT' : '✔ PURGED (404 Not Found)'}`);
  console.log(`    - Advert Img : ${adImgLeft ? '✘ STILL PRESENT' : '✔ PURGED (404 Not Found)'}`);
  console.log(`    - Applicant CV: ${cvLeft ? '✘ STILL PRESENT' : '✔ PURGED (404 Not Found)'}`);

  if (!logoLeft && !coverLeft && !kycLeft && !prodImgLeft && !adImgLeft && !cvLeft) {
    console.log('  ✔ PASS: 100% of all business media, KYC documents, and applicant files permanently destroyed!\n');
  } else {
    throw new Error('FAIL: Some business assets remained in Cloudflare R2 after business deletion!');
  }

  // --------------------------------------------------------------------------
  // TEST 4: Normal User Avatar Updates, Removal & User Deletion
  // --------------------------------------------------------------------------
  console.log('▶ [TEST 4] Normal User Profile Avatar Update, Removal, & Account Deletion');
  const userAvatarA = `avatars/cascade-user-avatar-a-${Date.now()}.jpg`;
  const userAvatarB = `avatars/cascade-user-avatar-b-${Date.now()}.jpg`;
  const userAvatarC = `avatars/cascade-user-avatar-c-${Date.now()}.jpg`;

  await uploadDirectToR2(userAvatarA, createSampleJpeg());
  await uploadDirectToR2(userAvatarB, createSampleJpeg());
  await uploadDirectToR2(userAvatarC, createSampleJpeg());

  // Create temporary test user
  const [testUser] = await db('users')
    .insert({
      id: randomUUID(),
      email: `cascade-user-${Date.now()}@example.co.zw`,
      password_hash: '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890',
      full_name: 'Tendai Mutasa',
      role: 'customer',
      account_type: 'personal',
      status: 'active',
      is_verified: true,
      avatar_url: `${domain}/${userAvatarA}`,
    })
    .returning('*');

  console.log(`  Created test user: ID=${testUser.id}, initial avatar=${userAvatarA}`);

  // Update avatar to B -> avatar A should be purged
  console.log(`  Updating avatar from Avatar A to Avatar B...`);
  await fetch(`http://localhost:3000/api/v1/users/${testUser.id}`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({ avatar_url: `${domain}/${userAvatarB}` }),
  });
  await sleep(1500);

  const avatarAExists = await checkObjectExistsInR2(userAvatarA);
  const avatarBExists = await checkObjectExistsInR2(userAvatarB);

  if (!avatarAExists && avatarBExists) {
    console.log(`  ✔ PASS: Replaced avatar (${userAvatarA}) was PURGED from Cloudflare R2! (404)`);
    console.log(`  ✔ PASS: New avatar (${userAvatarB}) is active in Cloudflare R2.`);
  } else {
    throw new Error('FAIL: Previous user avatar was not purged on update!');
  }

  // User clicks "Remove Photo" (avatar_url: null) -> avatar B should be purged
  console.log(`  User removes photo (avatar_url: null)...`);
  await fetch(`http://localhost:3000/api/v1/users/${testUser.id}`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({ avatar_url: null }),
  });
  await sleep(1500);

  const avatarBStillExists = await checkObjectExistsInR2(userAvatarB);
  if (!avatarBStillExists) {
    console.log(`  ✔ PASS: Removed avatar (${userAvatarB}) was PURGED from Cloudflare R2! (404)`);
  } else {
    throw new Error('FAIL: Removed user avatar was not purged on photo removal!');
  }

  // Set avatar C on user and then delete user account
  console.log(`  Setting Avatar C on user and deleting user account...`);
  await fetch(`http://localhost:3000/api/v1/users/${testUser.id}`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({ avatar_url: `${domain}/${userAvatarC}` }),
  });
  await sleep(1000);

  // Delete user account
  const delUserRes = await fetch(`http://localhost:3000/api/v1/users/${testUser.id}`, {
    method: 'DELETE',
    headers: authHeaders,
  });
  console.log(`  ✔ User Delete API Status: ${delUserRes.status}`);
  await sleep(1500);

  const avatarCExists = await checkObjectExistsInR2(userAvatarC);
  if (!avatarCExists) {
    console.log(`  ✔ PASS: User avatar (${userAvatarC}) was PURGED from Cloudflare R2 upon account deletion!\n`);
  } else {
    throw new Error('FAIL: User avatar was not purged when user account was deleted!');
  }

  // --------------------------------------------------------------------------
  // TEST 5: Standalone Advert Deletion Purge
  // --------------------------------------------------------------------------
  console.log('▶ [TEST 5] Standalone Advert Deletion & Banner Purge');
  const standaloneAdBannerKey = `adverts/cascade-standalone-ad-${Date.now()}.jpg`;
  await uploadDirectToR2(standaloneAdBannerKey, createSampleJpeg());

  const [standaloneAd] = await db('adverts')
    .insert({
      id: randomUUID(),
      business_name: 'Standalone Tech Promo',
      province: 'Bulawayo',
      category: 'Electronics',
      offer_type: 'Clearance Sale',
      headline: 'End of Year Clearance',
      offer_text: 'Up to 50% off select gadgets',
      image: `${domain}/${standaloneAdBannerKey}`,
      is_active: true,
    })
    .returning('*');

  console.log(`  Created test advert: ID=${standaloneAd.id}, Banner=${standaloneAdBannerKey}`);

  await fetch(`http://localhost:3000/api/v1/adverts/${standaloneAd.id}`, {
    method: 'DELETE',
    headers: authHeaders,
  });
  await sleep(1500);

  const adBannerExists = await checkObjectExistsInR2(standaloneAdBannerKey);
  if (!adBannerExists) {
    console.log(`  ✔ PASS: Advert banner (${standaloneAdBannerKey}) was PURGED from Cloudflare R2! (404)\n`);
  } else {
    throw new Error('FAIL: Advert banner remained in Cloudflare R2 after advert deletion!');
  }

  // --------------------------------------------------------------------------
  // TEST 6: Standalone Job Application Deletion & CV Purge
  // --------------------------------------------------------------------------
  console.log('▶ [TEST 6] Standalone Job Application Deletion & CV Purge');
  const standaloneCvKey = `resumes/cascade-standalone-cv-${Date.now()}.pdf`;
  await uploadDirectToR2(standaloneCvKey, createSamplePdf('CANDIDATE RESUME FOR REMOVAL'), 'application/pdf');

  const sampleJob = await db('jobs').first();
  const [standaloneApp] = await db('job_applications')
    .insert({
      id: randomUUID(),
      job_id: sampleJob.id,
      applicant_name: 'Chipo Dube',
      applicant_email: 'chipo.dube@example.co.zw',
      applicant_phone: '+263773112233',
      cv_url: `${domain}/${standaloneCvKey}`,
      status: 'Submitted',
    })
    .returning('*');

  console.log(`  Created test application: ID=${standaloneApp.id}, CV=${standaloneCvKey}`);

  await fetch(`http://localhost:3000/api/v1/jobs/applications/${standaloneApp.id}`, {
    method: 'DELETE',
    headers: authHeaders,
  });
  await sleep(1500);

  const standaloneCvExists = await checkObjectExistsInR2(standaloneCvKey);
  if (!standaloneCvExists) {
    console.log(`  ✔ PASS: Applicant CV (${standaloneCvKey}) was PURGED from Cloudflare R2! (404)\n`);
  } else {
    throw new Error('FAIL: Applicant CV remained in Cloudflare R2 after application deletion!');
  }

  console.log('=============================================================================');
  console.log('  ALL 6 PHYSICAL LIVE CASCADING DELETION TESTS PASSED WITH 100% SUCCESS!     ');
  console.log('=============================================================================');
  process.exit(0);
}

runLivePhysicalDeletionTests().catch((err) => {
  console.error('\n✘ TEST SUITE FAILED WITH ERROR:', err);
  process.exit(1);
});
