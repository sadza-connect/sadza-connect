import assert from 'node:assert';

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('\n======================================================');
  console.log('💼 Phase 6: Careers, Vacancies & Candidate Tracking Tests');
  console.log('======================================================\n');

  let passed = 0;
  let total = 0;

  async function test(name: string, fn: () => Promise<void>) {
    total++;
    try {
      await fn();
      console.log(`  ✓ [TEST ${total}] ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ✗ [TEST ${total}] ${name}`);
      console.error(`    Error: ${err.message}`);
    }
  }

  // Helper for admin login
  async function getAdminToken(): Promise<string> {
    const loginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@sadzaconnect.co.zw',
        password: 'SadzaAdmin2026!',
      }),
    });
    assert.strictEqual(loginRes.status, 200, 'Admin login should succeed');
    const loginJson = await loginRes.json();
    return loginJson.data.accessToken;
  }

  // 1. Jobs Listing & Pagination
  let sampleJobSlug = '';
  await test('GET /api/v1/jobs - returns active vacancies list with pagination metadata', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/jobs?limit=10`);
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert(Array.isArray(json.data.jobs), 'jobs should be an array');
    assert(json.data.jobs.length > 0, 'should return at least 1 job opening');
    assert(typeof json.data.total === 'number', 'total should be a number');

    const first = json.data.jobs[0];
    assert(first.id, 'job must have id');
    assert(first.title, 'job must have title');
    assert(first.slug, 'job must have slug');
    sampleJobSlug = first.slug;
  });

  // 2. Full-Text Search on Vacancies
  await test('GET /api/v1/jobs?search=solar - performs search across job title and description', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/jobs?search=solar`);
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert(json.data.jobs.length >= 1, 'should find solar vacancies');
    const matches = json.data.jobs.some((j: any) =>
      j.title.toLowerCase().includes('solar') ||
      (j.description && j.description.toLowerCase().includes('solar')) ||
      (j.company_name && j.company_name.toLowerCase().includes('solar'))
    );
    assert(matches, 'search results should match solar vacancies');
  });

  // 3. Province Filter
  await test('GET /api/v1/jobs?province=Harare - filters vacancies by province', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/jobs?province=Harare`);
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert(json.data.jobs.length >= 1, 'should return Harare vacancies');
    json.data.jobs.forEach((j: any) => {
      assert(j.province.toLowerCase().includes('harare'), 'Province must be Harare');
    });
  });

  // 4. Job Type Filter
  await test('GET /api/v1/jobs?job_type=Full-time - filters vacancies by employment type', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/jobs?job_type=Full-time`);
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert(json.data.jobs.length >= 1, 'should return Full-time vacancies');
    json.data.jobs.forEach((j: any) => {
      assert.strictEqual(j.job_type, 'Full-time');
    });
  });

  // 5. Single Job Dossier by Slug
  await test('GET /api/v1/jobs/[slug] - retrieves single job opening with details', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/jobs/${sampleJobSlug}`);
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.data.job.slug, sampleJobSlug);
    assert(json.data.job.title, 'job must have title');
    assert(json.data.job.description, 'job must have description');
  });

  // 6. Post New Job Vacancy (Authenticated Admin)
  let createdJobSlug = '';
  let adminToken = '';
  await test('POST /api/v1/jobs - creates verified job posting linked to enterprise', async () => {
    adminToken = await getAdminToken();

    // Fetch existing business to link
    const bizRes = await fetch(`${BASE_URL}/api/v1/businesses?limit=1`);
    const bizJson = await bizRes.json();
    const testBiz = bizJson.data.businesses[0];

    const uniqueId = Date.now().toString().slice(-4);
    const res = await fetch(`${BASE_URL}/api/v1/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        business_id: testBiz.id,
        title: `Senior Inverter Specialist ${uniqueId}`,
        province: 'Harare',
        city: 'Harare',
        job_type: 'Full-time',
        salary_usd: '$850 – $1,200 USD',
        category: 'Clean Energy & Electrical',
        whatsapp: '263772555666',
        description: 'Lead high-voltage hybrid inverter and LiFePO4 battery commissioning for commercial solar setups in Harare.',
        requirements: [
          'Degree or Diploma in Electrical Engineering',
          'Victron and Deye certification preferred',
          'Clean Class 4 Driver License',
        ],
        is_featured: true,
      }),
    });

    assert.strictEqual(res.status, 201);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert(json.data.job.slug, 'created job must have a slug');
    createdJobSlug = json.data.job.slug;
  });

  // 7. Update Job Vacancy (PATCH /api/v1/jobs/[slug])
  await test('PATCH /api/v1/jobs/[slug] - updates vacancy terms and salary band', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/jobs/${createdJobSlug}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        salary_usd: '$950 – $1,400 USD',
        description: 'Updated: Lead high-voltage hybrid inverter and LiFePO4 battery installation across Harare and Mashonaland.',
      }),
    });

    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.data.job.salary_usd, '$950 – $1,400 USD');
  });

  // 8. Candidate Application Submission
  let applicationRecordId = '';
  await test('POST /api/v1/jobs/[slug]/apply - candidate submits CV application and receives HR contact link', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/jobs/${createdJobSlug}/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        applicant_name: 'Tendai Mukamuri',
        applicant_email: 'tendai.mukamuri@example.co.zw',
        applicant_phone: '+263771888999',
        experience_summary: '5 years commercial solar inverter engineering with 48V and 400V 3-phase hybrid systems.',
        cv_file_name: 'Tendai_Mukamuri_CV.pdf',
        cv_url: '/uploads/resumes/sample-cv.pdf',
      }),
    });

    assert.strictEqual(res.status, 201);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert(json.data.application.id, 'application must have id');
    const waLink = json.data.whatsapp_hr_link || json.data.whatsapp_url;
    assert(waLink && waLink.includes('https://wa.me/'), 'should return whatsapp HR direct contact url');
    applicationRecordId = json.data.application.id;
  });

  // 9. Candidate Applications Listing
  await test('GET /api/v1/jobs/applications - employer/admin views submitted candidate pipeline', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/jobs/applications?limit=20`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert(Array.isArray(json.data.applications), 'applications should be an array');
    assert(json.data.applications.length > 0, 'should return applications');

    const found = json.data.applications.some((a: any) => a.id === applicationRecordId);
    assert(found, 'newly created application must appear in candidate pipeline');
  });

  // 10. Candidate Status Workflow & Clean Vacancy Removal
  await test('PATCH /api/v1/jobs/applications/[id] & DELETE /api/v1/jobs/[slug] - updates status and deletes test vacancy', async () => {
    // 10a. Update status to Shortlisted
    const patchRes = await fetch(`${BASE_URL}/api/v1/jobs/applications/${applicationRecordId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        status: 'Shortlisted',
      }),
    });

    assert.strictEqual(patchRes.status, 200);
    const patchJson = await patchRes.json();
    assert.strictEqual(patchJson.success, true);
    assert.strictEqual(patchJson.data.application.status, 'Shortlisted');

    // 10b. Cleanly delete test vacancy
    const delRes = await fetch(`${BASE_URL}/api/v1/jobs/${createdJobSlug}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    assert.strictEqual(delRes.status, 200);
    const delJson = await delRes.json();
    assert.strictEqual(delJson.success, true);

    // Verify vacancy is gone
    const verifyRes = await fetch(`${BASE_URL}/api/v1/jobs/${createdJobSlug}`);
    assert.strictEqual(verifyRes.status, 404, 'Deleted job should return 404');
  });

  console.log('\n======================================================');
  console.log(`Results: ${passed}/${total} Phase 6 tests passed!`);
  console.log('======================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal error during Phase 6 test execution:', err);
  process.exit(1);
});
