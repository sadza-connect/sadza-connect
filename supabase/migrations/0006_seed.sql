-- ============================================================================
--  MATECH Integrated Services — 0006: Seed data (GENERATED — do not edit by hand)
--  Generated from src/lib/data/* by scripts/gen-seed.mjs.
--  Run AFTER 0005. Re-runnable: content tables upsert by natural key;
--  receipts/leads insert-if-absent.
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- company_settings (singleton)
-- ---------------------------------------------------------------------------
insert into public.company_settings (is_singleton, name, short_name, legal_suffix, tagline, motto, rc_number, established, meta_description, vision, mission, core_values, scope, email, phones, whatsapp, address, hours, founder, social, stats, hero, formats)
values (true, 'MATECH INTEGRATED SERVICES', 'MATECH', 'Integrated Services', 'Powering Industry with Engineering Precision', 'Safety First', 'RC 2300231140', 2016, 'MATECH Integrated Services is a Nigerian engineering company delivering industrial & residential electrical works, solar and renewable energy, SCADA automation, and security surveillance across Northern Nigeria since 2016.', 'To be a leading professional engineering services company in the sub-Saharan region, recognised for technical excellence, reliability, and an uncompromising commitment to safety.', 'To deliver dependable, innovative and safe engineering solutions, from industrial electrical installations to renewable energy and automation, that empower our clients to operate with confidence.', $json$[{"title":"Safety","body":"Every task begins and ends with safety. We protect our people, our clients, and the communities we work in."},{"title":"Innovation","body":"We apply modern engineering methods, automation and renewable technology to solve real industrial problems."},{"title":"Quality","body":"We build to standard, clean terminations, documented work, and installations that last."},{"title":"Customer's Satisfaction","body":"We measure success by systems that keep running long after we hand them over."}]$json$::jsonb, array['Industrial electrical installations', 'Residential electrical installations', 'Renewable energy (solar & wind)', 'Electrical infrastructure upgrade', 'Security surveillance systems', 'SCADA monitoring & industrial automation']::text[], 'info@matechintegrated.com', array['080 9909 3452', '080 6892 1997', '070 6426 9353']::text[], '+2348068921997', $json${"line1":"Opposite BUK New Campus","line2":"Along Gwarzo Road","city":"Kano","state":"Kano State","country":"Nigeria"}$json$::jsonb, 'Monday to Saturday · 8:00 AM to 6:00 PM', $json${"name":"Eng. Muhammad Abdulmumin","role":"Managing Director / Chief Executive Officer","phone":"+234 806 892 1997","image":"/images/team/ceo-portrait.webp"}$json$::jsonb, $json${"facebook":"#","instagram":"#","linkedin":"#","twitter":"#"}$json$::jsonb, $json$[{"value":2016,"label":"Established","suffix":"","format":"year"},{"value":7,"label":"Solar Infrastructure","suffix":"MW","format":"number"},{"value":80,"label":"UPS Infrastructure","suffix":"kVA","format":"number"},{"value":100,"label":"Projects Delivered","suffix":"+","format":"number"}]$json$::jsonb, $json${}$json$::jsonb, $json${"receipt":"REC-MAT-YYYY-XXXX","staffEngineer":"MAT-ENG-XXXX","staffTechnician":"MAT-TECH-XXXX"}$json$::jsonb)
on conflict (is_singleton) do update set
  name = excluded.name,
  short_name = excluded.short_name,
  legal_suffix = excluded.legal_suffix,
  tagline = excluded.tagline,
  motto = excluded.motto,
  rc_number = excluded.rc_number,
  established = excluded.established,
  meta_description = excluded.meta_description,
  vision = excluded.vision,
  mission = excluded.mission,
  core_values = excluded.core_values,
  scope = excluded.scope,
  email = excluded.email,
  phones = excluded.phones,
  whatsapp = excluded.whatsapp,
  address = excluded.address,
  hours = excluded.hours,
  founder = excluded.founder,
  social = excluded.social,
  stats = excluded.stats,
  hero = excluded.hero,
  formats = excluded.formats;

-- ---------------------------------------------------------------------------
-- services
-- ---------------------------------------------------------------------------
insert into public.services (slug, display_index, name, short_name, tagline, summary, description, icon, hero_image, card_image, capabilities, features, process, deliverables, related_projects, faqs, featured, published, sort_order)
values ('electrical-engineering', '01', 'Electrical Engineering & Installation', 'Electrical', 'Industrial & residential power, built to standard.', 'Design, installation and upgrade of electrical systems, from residential wiring to industrial control panels, UPS infrastructure and distribution boards.', array['Electrical work is the foundation of everything MATECH does. We design and install power systems for factories, commercial buildings and homes across Northern Nigeria, with clean terminations, correct protection coordination, and fully documented installations.', 'Our teams have delivered everything from 80kVA UPS infrastructure at university campuses to complete residential wiring of multi-storey buildings. Every job is executed under our "Safety First" discipline and handed over with as-built documentation.']::text[], 'zap', '/images/services/electrical-hero.webp', '/images/projects/control-panel-team-kano.webp', array['Industrial control panel design & build', 'UPS & backup power infrastructure', 'LV distribution boards & panel upgrades', 'Residential & commercial wiring', 'Cable tray & containment systems', 'Electrical infrastructure audits']::text[], $json$[{"title":"Built to standard","body":"Correct cable sizing, protection coordination and labelling on every circuit, installations that pass inspection and last."},{"title":"Documented handover","body":"As-built drawings, panel schedules and test records delivered with every project, so your team can maintain the system confidently."},{"title":"Safety-led execution","body":"Lock-out/tag-out, PPE and method statements are standard practice, not an afterthought."}]$json$::jsonb, $json$[{"step":"01","title":"Site assessment","body":"Load study, site survey and requirements capture with your team."},{"step":"02","title":"Design & specification","body":"Single-line diagrams, panel schedules and a costed bill of materials."},{"step":"03","title":"Build & install","body":"Panel fabrication, wiring and installation by certified technicians."},{"step":"04","title":"Test & commission","body":"Continuity, insulation and functional testing before energisation."},{"step":"05","title":"Handover","body":"As-built documentation, labelling and operator walkthrough."}]$json$::jsonb, array['Single-line & schematic drawings', 'Panel schedules & load calculations', 'Test & commissioning records', 'As-built documentation pack']::text[], array['nwu-80kva-ups', 'buk-senate-wiring', 'golden-oil-panels']::text[], $json$[{"q":"Do you handle both industrial and residential jobs?","a":"Yes. We wire everything from private homes to industrial plants, the same standard applies to both."},{"q":"Can you upgrade an existing installation?","a":"We regularly carry out infrastructure upgrades: replacing ageing boards, correcting overloaded circuits and adding backup power."}]$json$::jsonb, false, true, 0)
on conflict (slug) do update set
  display_index = excluded.display_index,
  name = excluded.name,
  short_name = excluded.short_name,
  tagline = excluded.tagline,
  summary = excluded.summary,
  description = excluded.description,
  icon = excluded.icon,
  hero_image = excluded.hero_image,
  card_image = excluded.card_image,
  capabilities = excluded.capabilities,
  features = excluded.features,
  process = excluded.process,
  deliverables = excluded.deliverables,
  related_projects = excluded.related_projects,
  faqs = excluded.faqs,
  featured = excluded.featured,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into public.services (slug, display_index, name, short_name, tagline, summary, description, icon, hero_image, card_image, capabilities, features, process, deliverables, related_projects, faqs, featured, published, sort_order)
values ('solar-energy', '02', 'Solar & Renewable Energy', 'Solar', 'Reliable power where the grid falls short.', 'Solar PV, hybrid inverter and battery storage systems for homes, businesses and utility-scale sites, plus maintenance of existing arrays.', array['MATECH designs and installs solar and hybrid energy systems sized to the real load, not guesswork. From 3.5kVA residential hybrids to multi-megawatt utility studies, we help clients cut diesel dependence and keep critical loads running through outages.', 'We have installed residential solar across Kano, Maiduguri, Abuja, Kaduna, Yobe and Jigawa, maintained a 7MW solar plant at BUK New Site, and prepared solar-plus-storage proposals at the 4MW and 6MW scale.']::text[], 'sun', '/images/services/solar-hero.webp', '/images/projects/hybrid-inverter-bank.webp', array['Residential & commercial solar PV', 'Hybrid inverter & battery storage', 'Utility-scale solar studies & proposals', 'Solar plant operations & maintenance', 'Energy audits & load sizing', 'Battery bank design & replacement']::text[], $json$[{"title":"Sized to your load","body":"We measure real consumption before we design, so the system fits the way you actually use power."},{"title":"Hybrid-ready","body":"Solar, battery and grid/generator working together, with seamless changeover for critical loads."},{"title":"Maintained for the long run","body":"Panel cleaning, string testing and battery health checks keep generation where it should be."}]$json$::jsonb, $json$[{"step":"01","title":"Energy audit","body":"We profile your loads and outage patterns to size the system correctly."},{"step":"02","title":"System design","body":"Array, inverter and battery sizing with a clear generation estimate."},{"step":"03","title":"Installation","body":"Mounting, DC/AC wiring and protection installed to standard."},{"step":"04","title":"Commission & monitor","body":"Performance verification and monitoring setup."},{"step":"05","title":"Maintain","body":"Scheduled cleaning, testing and battery health checks."}]$json$::jsonb, array['Load profile & sizing report', 'System layout & wiring diagrams', 'Generation & payback estimate', 'O&M schedule']::text[], array['buk-7mw-solar-om', 'residential-solar-fleet', 'solar-storage-proposal']::text[], $json$[{"q":"Will solar run my whole building?","a":"It depends on your load and budget. We commonly design hybrid systems that guarantee critical loads and offset the rest."},{"q":"Do you maintain systems you did not install?","a":"Yes, we service and troubleshoot existing solar arrays, including large plants."}]$json$::jsonb, false, true, 1)
on conflict (slug) do update set
  display_index = excluded.display_index,
  name = excluded.name,
  short_name = excluded.short_name,
  tagline = excluded.tagline,
  summary = excluded.summary,
  description = excluded.description,
  icon = excluded.icon,
  hero_image = excluded.hero_image,
  card_image = excluded.card_image,
  capabilities = excluded.capabilities,
  features = excluded.features,
  process = excluded.process,
  deliverables = excluded.deliverables,
  related_projects = excluded.related_projects,
  faqs = excluded.faqs,
  featured = excluded.featured,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into public.services (slug, display_index, name, short_name, tagline, summary, description, icon, hero_image, card_image, capabilities, features, process, deliverables, related_projects, faqs, featured, published, sort_order)
values ('scada-automation', '03', 'SCADA & Industrial Automation', 'SCADA', 'Visibility and control over your process.', 'PLC/SCADA systems, machine monitoring and control panels that give plants real-time visibility and reliable automated control.', array['For process plants, uptime depends on control and visibility. MATECH builds and integrates PLC and SCADA systems that monitor machines, automate sequences and surface faults before they become downtime.', 'We delivered the control and monitoring systems for a 5-ton/hour sesame seed cleaning plant in Dawanau, and have worked on BUHLER-branded process lines, wiring, control panels and SCADA screens that operators actually trust.']::text[], 'cpu', '/images/services/scada-hero.webp', '/images/services/machine-monitoring.webp', array['PLC programming & integration', 'SCADA / HMI screen development', 'Motor control centres & panels', 'Machine & process monitoring', 'Instrumentation & sensor wiring', 'Retrofit of manual process lines']::text[], $json$[{"title":"Real-time visibility","body":"Operators see the whole line at a glance, states, alarms and throughput on one screen."},{"title":"Fault-aware","body":"Alarms and interlocks catch problems early and protect equipment automatically."},{"title":"Operator-friendly","body":"HMI screens designed around how your team actually runs the plant."}]$json$::jsonb, $json$[{"step":"01","title":"Process study","body":"We map the sequence, I/O and control philosophy with your engineers."},{"step":"02","title":"Control design","body":"Panel design, PLC/SCADA architecture and I/O schedules."},{"step":"03","title":"Build & program","body":"Panel fabrication, PLC logic and HMI/SCADA development."},{"step":"04","title":"Commission","body":"Loop checks, dry runs and live commissioning on the line."},{"step":"05","title":"Support","body":"Operator training and ongoing programming support."}]$json$::jsonb, array['Control philosophy & I/O schedule', 'PLC program & SCADA application', 'Panel drawings & loop diagrams', 'Operator training & manuals']::text[], array['dawanau-sesame-plant', 'buhler-scada']::text[], $json$[{"q":"Can you automate an existing manual line?","a":"Yes, retrofitting manual process lines with PLC control and monitoring is a core part of our work."},{"q":"Which platforms do you work with?","a":"We work across common industrial PLC/SCADA platforms and integrate with existing plant equipment such as BUHLER lines."}]$json$::jsonb, false, true, 2)
on conflict (slug) do update set
  display_index = excluded.display_index,
  name = excluded.name,
  short_name = excluded.short_name,
  tagline = excluded.tagline,
  summary = excluded.summary,
  description = excluded.description,
  icon = excluded.icon,
  hero_image = excluded.hero_image,
  card_image = excluded.card_image,
  capabilities = excluded.capabilities,
  features = excluded.features,
  process = excluded.process,
  deliverables = excluded.deliverables,
  related_projects = excluded.related_projects,
  faqs = excluded.faqs,
  featured = excluded.featured,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into public.services (slug, display_index, name, short_name, tagline, summary, description, icon, hero_image, card_image, capabilities, features, process, deliverables, related_projects, faqs, featured, published, sort_order)
values ('cctv-automation', '04', 'Security Surveillance & Smart Systems', 'Security', 'See everything. Control everything.', 'CCTV, access control, intercom and home automation, integrated security and smart-building systems for homes, offices and facilities.', array['MATECH secures homes, businesses and institutions with professional CCTV, access control and intercom systems, and ties them into smart-building automation where clients want it.', 'We have installed multi-channel Dahua CCTV systems and full building surveillance, including a complete CCTV deployment at the Abubakar Rasheed building. Our systems are designed for reliable recording, remote viewing and clean, concealed cabling.']::text[], 'cctv', '/images/projects/cctv-monitoring-wall.webp', '/images/projects/cctv-pole-abubakar-rasheed.webp', array['IP & HD-CCTV surveillance systems', 'Network video recorders & storage', 'Remote & mobile monitoring', 'Access control & intercom', 'Home & building automation', 'Structured cabling']::text[], $json$[{"title":"Coverage that makes sense","body":"Camera placement planned around real sightlines and blind spots, not just counts."},{"title":"Watch from anywhere","body":"Secure remote viewing on phone or desktop, with reliable local recording."},{"title":"Clean installation","body":"Concealed, labelled cabling and tidy terminations, infrastructure you can maintain."}]$json$::jsonb, $json$[{"step":"01","title":"Security survey","body":"We walk the site and map coverage, entry points and risk areas."},{"step":"02","title":"System design","body":"Camera plan, storage sizing and network design."},{"step":"03","title":"Installation","body":"Mounting, cabling and configuration by trained technicians."},{"step":"04","title":"Configure & train","body":"Recording, remote access and a walkthrough for your team."},{"step":"05","title":"Support","body":"Health checks and support to keep the system recording."}]$json$::jsonb, array['Coverage & camera placement plan', 'Network & storage design', 'Remote-access configuration', 'User walkthrough & support plan']::text[], array['abubakar-rasheed-cctv', 'dahua-16ch-cctv']::text[], $json$[{"q":"Can I view my cameras remotely?","a":"Yes. We configure secure remote viewing on mobile and desktop as standard."},{"q":"Do you offer home automation too?","a":"Yes, lighting, intercom and smart controls can be integrated alongside security."}]$json$::jsonb, false, true, 3)
on conflict (slug) do update set
  display_index = excluded.display_index,
  name = excluded.name,
  short_name = excluded.short_name,
  tagline = excluded.tagline,
  summary = excluded.summary,
  description = excluded.description,
  icon = excluded.icon,
  hero_image = excluded.hero_image,
  card_image = excluded.card_image,
  capabilities = excluded.capabilities,
  features = excluded.features,
  process = excluded.process,
  deliverables = excluded.deliverables,
  related_projects = excluded.related_projects,
  faqs = excluded.faqs,
  featured = excluded.featured,
  published = excluded.published,
  sort_order = excluded.sort_order;

-- ---------------------------------------------------------------------------
-- projects
-- ---------------------------------------------------------------------------
insert into public.projects (slug, title, client, location, year, category, services, summary, challenge, approach, outcome, metrics, cover_image, gallery, scope, featured, published, sort_order)
values ('nwu-80kva-ups', '80kVA UPS Infrastructure, North West University', 'North West University (Gidan Ado Bayero City Campus)', 'Kano, Nigeria', 2022, 'Electrical', array['electrical-engineering']::text[], 'Design and installation of an 80kVA UPS backup infrastructure to protect critical campus loads through unstable grid supply.', 'The city campus needed uninterrupted power for critical academic and administrative systems, but grid instability was causing frequent disruptions and risk to equipment.', array['Carried out a load study to size the UPS infrastructure against real critical demand.', 'Designed the distribution so essential loads transfer seamlessly to backup.', 'Installed and terminated the 80kVA UPS with correct protection and clean cable management.', 'Tested changeover and commissioned the system with campus facilities staff.']::text[], 'Critical campus systems now ride through grid disturbances without interruption, protecting sensitive equipment and keeping essential services online.', $json$[{"label":"UPS Capacity","value":"80 kVA"},{"label":"Campus","value":"City Campus"},{"label":"Critical Uptime","value":"Protected"}]$json$::jsonb, '/images/projects/ups-panel-install.webp', $json$[{"src":"/images/projects/ups-panel-install.webp","caption":"UPS panel installation and termination"},{"src":"/images/projects/control-panels-lineup.webp","caption":"Distribution and protection line-up"},{"src":"/images/gallery/cable-terminal.webp","caption":"Cable termination detail"}]$json$::jsonb, array['Load study', 'UPS installation', 'Distribution', 'Commissioning']::text[], true, true, 0)
on conflict (slug) do update set
  title = excluded.title,
  client = excluded.client,
  location = excluded.location,
  year = excluded.year,
  category = excluded.category,
  services = excluded.services,
  summary = excluded.summary,
  challenge = excluded.challenge,
  approach = excluded.approach,
  outcome = excluded.outcome,
  metrics = excluded.metrics,
  cover_image = excluded.cover_image,
  gallery = excluded.gallery,
  scope = excluded.scope,
  featured = excluded.featured,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into public.projects (slug, title, client, location, year, category, services, summary, challenge, approach, outcome, metrics, cover_image, gallery, scope, featured, published, sort_order)
values ('dawanau-sesame-plant', 'Sesame Seed Cleaning Plant, 5 Ton/Hour', 'Dawanau International Market', 'Dawanau, Kano', 2023, 'SCADA & Automation', array['scada-automation', 'electrical-engineering']::text[], 'Electrical and control systems for a 5-ton-per-hour sesame seed cleaning plant, power, control panels and process monitoring.', 'A new sesame processing line needed complete electrical infrastructure and automated control to run reliably at 5 tons per hour with minimal operator intervention.', array['Designed and built the motor control and process control panels for the cleaning line.', 'Wired the plant, instrumentation and drives to standard with full labelling.', 'Implemented control logic and monitoring so operators can run and supervise the line.', 'Commissioned the line and trained the operating team.']::text[], 'The plant runs at its rated 5 ton/hour throughput with automated control and clear process visibility, reducing manual intervention and downtime.', $json$[{"label":"Throughput","value":"5 t/hr"},{"label":"Scope","value":"Power + Control"},{"label":"Line","value":"Seed cleaning"}]$json$::jsonb, '/images/projects/sesame-control-panels.webp', $json$[{"src":"/images/projects/sesame-control-panels.webp","caption":"Process control panels"},{"src":"/images/projects/sesame-plant-panels-team.webp","caption":"MATECH team at the installed panels"},{"src":"/images/projects/sesame-plant-inspection.webp","caption":"Plant inspection and checks"},{"src":"/images/projects/silo-install-team.webp","caption":"Silo and structure installation"},{"src":"/images/projects/plc-panel-wiring.webp","caption":"PLC panel wiring detail"}]$json$::jsonb, array['Control panels', 'Plant wiring', 'PLC & monitoring', 'Commissioning']::text[], true, true, 1)
on conflict (slug) do update set
  title = excluded.title,
  client = excluded.client,
  location = excluded.location,
  year = excluded.year,
  category = excluded.category,
  services = excluded.services,
  summary = excluded.summary,
  challenge = excluded.challenge,
  approach = excluded.approach,
  outcome = excluded.outcome,
  metrics = excluded.metrics,
  cover_image = excluded.cover_image,
  gallery = excluded.gallery,
  scope = excluded.scope,
  featured = excluded.featured,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into public.projects (slug, title, client, location, year, category, services, summary, challenge, approach, outcome, metrics, cover_image, gallery, scope, featured, published, sort_order)
values ('buhler-scada', 'BUHLER Process Line, Control & SCADA', 'Industrial processing client', 'Kano, Nigeria', 2023, 'SCADA & Automation', array['scada-automation']::text[], 'Control panels, wiring and SCADA monitoring integrated with BUHLER-branded process equipment.', 'A BUHLER process line required reliable control panels and SCADA monitoring so operators could supervise the process and respond to faults quickly.', array['Built and wired the control panels serving the process line.', 'Integrated monitoring and SCADA screens with the existing BUHLER equipment.', 'Verified interlocks and alarms during commissioning.']::text[], 'Operators gained real-time visibility and reliable control over the process line, with alarms surfacing issues before they cause downtime.', $json$[{"label":"Equipment","value":"BUHLER"},{"label":"Scope","value":"Control + SCADA"},{"label":"Monitoring","value":"Real-time"}]$json$::jsonb, '/images/projects/buhler-panel-bank.webp', $json$[{"src":"/images/projects/buhler-panel-bank.webp","caption":"Control panel bank"},{"src":"/images/projects/scada-monitoring-buhler.webp","caption":"SCADA monitoring station"},{"src":"/images/services/machine-monitoring.webp","caption":"Machine monitoring interface"}]$json$::jsonb, array['Control panels', 'SCADA integration', 'Commissioning']::text[], true, true, 2)
on conflict (slug) do update set
  title = excluded.title,
  client = excluded.client,
  location = excluded.location,
  year = excluded.year,
  category = excluded.category,
  services = excluded.services,
  summary = excluded.summary,
  challenge = excluded.challenge,
  approach = excluded.approach,
  outcome = excluded.outcome,
  metrics = excluded.metrics,
  cover_image = excluded.cover_image,
  gallery = excluded.gallery,
  scope = excluded.scope,
  featured = excluded.featured,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into public.projects (slug, title, client, location, year, category, services, summary, challenge, approach, outcome, metrics, cover_image, gallery, scope, featured, published, sort_order)
values ('buk-7mw-solar-om', '7MW Solar Plant, Operations & Maintenance', 'Bayero University Kano (New Site)', 'Kano, Nigeria', 2023, 'Solar & Renewable', array['solar-energy']::text[], 'Maintenance of a 7MW solar plant, keeping a large PV array generating at its designed output.', 'A 7MW solar installation needed ongoing maintenance to sustain generation and catch faults across a large array of panels and inverters.', array['Carried out inspection and maintenance across the PV array and inverter infrastructure.', 'Identified and addressed underperforming strings and equipment.', 'Established checks to sustain generation over time.']::text[], 'The 7MW array is maintained to sustain its designed generation, with faults identified and resolved to protect output.', $json$[{"label":"Plant Size","value":"7 MW"},{"label":"Scope","value":"O&M"},{"label":"Site","value":"BUK New Site"}]$json$::jsonb, '/images/projects/buk-7mw-solar-array.webp', $json$[{"src":"/images/projects/buk-7mw-solar-array.webp","caption":"Section of the 7MW array"},{"src":"/images/services/solar-hero.webp","caption":"Solar field maintenance"}]$json$::jsonb, array['Array inspection', 'Inverter maintenance', 'Performance checks']::text[], true, true, 3)
on conflict (slug) do update set
  title = excluded.title,
  client = excluded.client,
  location = excluded.location,
  year = excluded.year,
  category = excluded.category,
  services = excluded.services,
  summary = excluded.summary,
  challenge = excluded.challenge,
  approach = excluded.approach,
  outcome = excluded.outcome,
  metrics = excluded.metrics,
  cover_image = excluded.cover_image,
  gallery = excluded.gallery,
  scope = excluded.scope,
  featured = excluded.featured,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into public.projects (slug, title, client, location, year, category, services, summary, challenge, approach, outcome, metrics, cover_image, gallery, scope, featured, published, sort_order)
values ('residential-solar-fleet', 'Residential Solar, Multi-State Deployment', 'Private residential clients', 'Kano, Maiduguri, Abuja, Kaduna, Yobe & Jigawa', 2024, 'Solar & Renewable', array['solar-energy', 'electrical-engineering']::text[], 'Installation of 10kVA, 5kVA and 3.5kVA residential hybrid solar systems across six states.', 'Homeowners across Northern Nigeria needed dependable power through frequent outages, sized to different household loads and budgets.', array['Sized 10kVA, 5kVA and 3.5kVA systems to each household load profile.', 'Installed hybrid inverter and battery systems with seamless changeover.', 'Commissioned each system and handed over to the homeowner.']::text[], 'Households across six states now run critical loads reliably through outages, with reduced generator dependence.', $json$[{"label":"System Sizes","value":"3.5 to 10 kVA"},{"label":"States","value":"6"},{"label":"Type","value":"Hybrid"}]$json$::jsonb, '/images/projects/hybrid-inverter-bank.webp', $json$[{"src":"/images/projects/hybrid-inverter-bank.webp","caption":"Hybrid inverter and battery bank"},{"src":"/images/products/inverter-battery-stack.webp","caption":"Inverter and battery installation"}]$json$::jsonb, array['Load sizing', 'Hybrid install', 'Battery banks', 'Commissioning']::text[], false, true, 4)
on conflict (slug) do update set
  title = excluded.title,
  client = excluded.client,
  location = excluded.location,
  year = excluded.year,
  category = excluded.category,
  services = excluded.services,
  summary = excluded.summary,
  challenge = excluded.challenge,
  approach = excluded.approach,
  outcome = excluded.outcome,
  metrics = excluded.metrics,
  cover_image = excluded.cover_image,
  gallery = excluded.gallery,
  scope = excluded.scope,
  featured = excluded.featured,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into public.projects (slug, title, client, location, year, category, services, summary, challenge, approach, outcome, metrics, cover_image, gallery, scope, featured, published, sort_order)
values ('buk-senate-wiring', 'Senate Building, Complete Electrical Wiring', 'Bayero University Kano', 'Kano, Nigeria', 2021, 'Infrastructure', array['electrical-engineering']::text[], 'Complete electrical wiring of a six-storey Senate building, distribution, circuits and terminations across all floors.', 'A six-storey administrative building required complete electrical wiring: distribution, lighting, power and protection across every floor, delivered to standard.', array['Designed the distribution and circuit layout across six floors.', 'Installed risers, distribution boards and final circuits.', 'Terminated and tested every circuit before energisation.']::text[], 'The six-storey building was fully wired and energised to standard, ready for occupancy with documented circuits.', $json$[{"label":"Floors","value":"6"},{"label":"Scope","value":"Full wiring"},{"label":"Building","value":"Senate"}]$json$::jsonb, '/images/projects/control-panels-lineup.webp', $json$[{"src":"/images/projects/control-panels-lineup.webp","caption":"Distribution board line-up"},{"src":"/images/gallery/cable-terminal.webp","caption":"Termination detail"}]$json$::jsonb, array['Distribution design', 'Risers & boards', 'Final circuits', 'Testing']::text[], false, true, 5)
on conflict (slug) do update set
  title = excluded.title,
  client = excluded.client,
  location = excluded.location,
  year = excluded.year,
  category = excluded.category,
  services = excluded.services,
  summary = excluded.summary,
  challenge = excluded.challenge,
  approach = excluded.approach,
  outcome = excluded.outcome,
  metrics = excluded.metrics,
  cover_image = excluded.cover_image,
  gallery = excluded.gallery,
  scope = excluded.scope,
  featured = excluded.featured,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into public.projects (slug, title, client, location, year, category, services, summary, challenge, approach, outcome, metrics, cover_image, gallery, scope, featured, published, sort_order)
values ('golden-oil-panels', 'Golden Oil Company, Cable Tray & Control Panels', 'Golden Oil Company', 'Nigeria', 2022, 'Electrical', array['electrical-engineering', 'scada-automation']::text[], 'Cable tray containment and control panel installation for an industrial oil processing facility.', 'The facility needed organised cable containment and control panels to support its processing equipment reliably and safely.', array['Installed cable tray containment for clean, maintainable routing.', 'Built and installed the control panels serving the plant.', 'Terminated and tested the installation.']::text[], 'The facility gained tidy, maintainable cable infrastructure and reliable control panels supporting its processing operations.', $json$[{"label":"Scope","value":"Trays + Panels"},{"label":"Sector","value":"Oil processing"},{"label":"Focus","value":"Reliability"}]$json$::jsonb, '/images/gallery/control-panel-golden-oil.webp', $json$[{"src":"/images/gallery/control-panel-golden-oil.webp","caption":"Installed control panel"},{"src":"/images/gallery/cable-terminal.webp","caption":"Cable tray and termination"}]$json$::jsonb, array['Cable tray', 'Control panels', 'Termination', 'Testing']::text[], false, true, 6)
on conflict (slug) do update set
  title = excluded.title,
  client = excluded.client,
  location = excluded.location,
  year = excluded.year,
  category = excluded.category,
  services = excluded.services,
  summary = excluded.summary,
  challenge = excluded.challenge,
  approach = excluded.approach,
  outcome = excluded.outcome,
  metrics = excluded.metrics,
  cover_image = excluded.cover_image,
  gallery = excluded.gallery,
  scope = excluded.scope,
  featured = excluded.featured,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into public.projects (slug, title, client, location, year, category, services, summary, challenge, approach, outcome, metrics, cover_image, gallery, scope, featured, published, sort_order)
values ('abubakar-rasheed-cctv', 'Abubakar Rasheed Building, CCTV Surveillance', 'Abubakar Rasheed Building', 'Kano, Nigeria', 2024, 'Security & CCTV', array['cctv-automation']::text[], 'Full CCTV surveillance deployment for a multi-level building, camera coverage, recording and remote viewing.', 'The building required comprehensive surveillance coverage with reliable recording and remote monitoring for security oversight.', array['Surveyed the building to plan camera coverage and entry points.', 'Installed cameras, poles and structured cabling.', 'Configured recording and secure remote viewing.']::text[], 'The building has full surveillance coverage with reliable recording and remote viewing, giving security staff continuous oversight.', $json$[{"label":"Coverage","value":"Full building"},{"label":"Viewing","value":"Remote"},{"label":"Recording","value":"Continuous"}]$json$::jsonb, '/images/projects/cctv-pole-abubakar-rasheed.webp', $json$[{"src":"/images/projects/cctv-pole-abubakar-rasheed.webp","caption":"Camera and pole installation"},{"src":"/images/projects/cctv-monitoring-wall.webp","caption":"Monitoring wall"}]$json$::jsonb, array['Security survey', 'Camera install', 'Recording', 'Remote access']::text[], true, true, 7)
on conflict (slug) do update set
  title = excluded.title,
  client = excluded.client,
  location = excluded.location,
  year = excluded.year,
  category = excluded.category,
  services = excluded.services,
  summary = excluded.summary,
  challenge = excluded.challenge,
  approach = excluded.approach,
  outcome = excluded.outcome,
  metrics = excluded.metrics,
  cover_image = excluded.cover_image,
  gallery = excluded.gallery,
  scope = excluded.scope,
  featured = excluded.featured,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into public.projects (slug, title, client, location, year, category, services, summary, challenge, approach, outcome, metrics, cover_image, gallery, scope, featured, published, sort_order)
values ('dahua-16ch-cctv', 'Dahua 16-Channel CCTV System', 'Commercial client', 'Kano, Nigeria', 2023, 'Security & CCTV', array['cctv-automation']::text[], 'Installation of a 16-channel Dahua CCTV system with network video recording and remote access.', 'A commercial premises needed multi-camera surveillance with centralised recording and the ability to review footage remotely.', array['Deployed a 16-channel Dahua system with cameras placed for full coverage.', 'Installed the NVR and configured storage and retention.', 'Set up secure remote viewing for the client.']::text[], 'The premises has 16 channels of reliable surveillance with centralised recording and remote review from mobile and desktop.', $json$[{"label":"Channels","value":"16"},{"label":"Brand","value":"Dahua"},{"label":"Access","value":"Remote"}]$json$::jsonb, '/images/projects/cctv-monitoring-wall.webp', $json$[{"src":"/images/projects/cctv-monitoring-wall.webp","caption":"16-channel monitoring wall"},{"src":"/images/projects/cctv-pole-abubakar-rasheed.webp","caption":"Exterior camera installation"}]$json$::jsonb, array['16-channel system', 'NVR & storage', 'Remote access']::text[], false, true, 8)
on conflict (slug) do update set
  title = excluded.title,
  client = excluded.client,
  location = excluded.location,
  year = excluded.year,
  category = excluded.category,
  services = excluded.services,
  summary = excluded.summary,
  challenge = excluded.challenge,
  approach = excluded.approach,
  outcome = excluded.outcome,
  metrics = excluded.metrics,
  cover_image = excluded.cover_image,
  gallery = excluded.gallery,
  scope = excluded.scope,
  featured = excluded.featured,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into public.projects (slug, title, client, location, year, category, services, summary, challenge, approach, outcome, metrics, cover_image, gallery, scope, featured, published, sort_order)
values ('solar-storage-proposal', 'Solar-plus-Storage, 4MW & 6MW Studies', 'Utility-scale clients', 'Northern Nigeria', 2024, 'Solar & Renewable', array['solar-energy']::text[], 'Engineering proposals for 4MW/1MWh and 6MW/2MWh solar-plus-storage installations.', 'Clients exploring large-scale renewable capacity needed credible engineering proposals for solar generation paired with battery storage.', array['Developed sizing and configuration for 4MW/1MWh and 6MW/2MWh systems.', 'Modelled generation, storage and load-shifting behaviour.', 'Prepared costed engineering proposals for client review.']::text[], 'Clients received detailed, buildable solar-plus-storage proposals at the 4MW and 6MW scale to inform investment decisions.', $json$[{"label":"Solar","value":"4 to 6 MW"},{"label":"Storage","value":"1 to 2 MWh"},{"label":"Stage","value":"Engineering"}]$json$::jsonb, '/images/projects/buk-7mw-solar-array.webp', $json$[{"src":"/images/projects/buk-7mw-solar-array.webp","caption":"Reference utility-scale array"},{"src":"/images/projects/hybrid-inverter-bank.webp","caption":"Storage and inverter configuration"}]$json$::jsonb, array['System sizing', 'Generation modelling', 'Costed proposal']::text[], false, true, 9)
on conflict (slug) do update set
  title = excluded.title,
  client = excluded.client,
  location = excluded.location,
  year = excluded.year,
  category = excluded.category,
  services = excluded.services,
  summary = excluded.summary,
  challenge = excluded.challenge,
  approach = excluded.approach,
  outcome = excluded.outcome,
  metrics = excluded.metrics,
  cover_image = excluded.cover_image,
  gallery = excluded.gallery,
  scope = excluded.scope,
  featured = excluded.featured,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into public.projects (slug, title, client, location, year, category, services, summary, challenge, approach, outcome, metrics, cover_image, gallery, scope, featured, published, sort_order)
values ('client-handover-tumfafi', 'Community Power Handover, Tumfafi', 'Community client', 'Tumfafi, Kano', 2023, 'Electrical', array['electrical-engineering', 'solar-energy']::text[], 'Installation and formal handover of a power system to a community client in Tumfafi.', 'A community client needed a reliable power installation delivered, commissioned and formally handed over with confidence in its operation.', array['Installed and commissioned the power system on site.', 'Verified operation and walked the client through the system.', 'Completed a formal handover.']::text[], 'The system was delivered and formally handed over, with the client confident in operating and maintaining it.', $json$[{"label":"Stage","value":"Delivered"},{"label":"Handover","value":"Formal"},{"label":"Location","value":"Tumfafi"}]$json$::jsonb, '/images/projects/client-handover-tumfafi.webp', $json$[{"src":"/images/projects/client-handover-tumfafi.webp","caption":"Formal client handover"}]$json$::jsonb, array['Installation', 'Commissioning', 'Handover']::text[], false, true, 10)
on conflict (slug) do update set
  title = excluded.title,
  client = excluded.client,
  location = excluded.location,
  year = excluded.year,
  category = excluded.category,
  services = excluded.services,
  summary = excluded.summary,
  challenge = excluded.challenge,
  approach = excluded.approach,
  outcome = excluded.outcome,
  metrics = excluded.metrics,
  cover_image = excluded.cover_image,
  gallery = excluded.gallery,
  scope = excluded.scope,
  featured = excluded.featured,
  published = excluded.published,
  sort_order = excluded.sort_order;

-- ---------------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------------
insert into public.products (slug, name, brand, category, type, availability, price_from, currency, price_note, short_description, description, image, specs, highlights, tags, featured, published, sort_order)
values ('hybrid-solar-system-5kva', '5kVA Hybrid Solar System', 'MATECH Engineered', 'Solar & Storage', 'System', 'Made to Order', 3200000, 'NGN', 'Installed, sized to load', 'Complete 5kVA hybrid solar system for homes and small offices, inverter, panels, battery and installation.', array['A complete 5kVA hybrid system sized for a typical home or small office. Solar, battery and grid/generator work together to keep your critical loads running through outages.', 'Supplied and installed by MATECH with load sizing, clean wiring and commissioning. Battery capacity is configured to your backup requirement.']::text[], '/images/projects/hybrid-inverter-bank.webp', $json$[{"label":"Inverter","value":"5kVA hybrid"},{"label":"System type","value":"Solar + battery + grid"},{"label":"Typical use","value":"Home / small office"},{"label":"Battery","value":"Configured to load"},{"label":"Installation","value":"Included"}]$json$::jsonb, array['Seamless changeover', 'Sized to your load', 'Professional installation', 'Commissioned & documented']::text[], array['solar', 'hybrid', 'inverter', 'battery', 'residential']::text[], true, true, 0)
on conflict (slug) do update set
  name = excluded.name,
  brand = excluded.brand,
  category = excluded.category,
  type = excluded.type,
  availability = excluded.availability,
  price_from = excluded.price_from,
  currency = excluded.currency,
  price_note = excluded.price_note,
  short_description = excluded.short_description,
  description = excluded.description,
  image = excluded.image,
  specs = excluded.specs,
  highlights = excluded.highlights,
  tags = excluded.tags,
  featured = excluded.featured,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into public.products (slug, name, brand, category, type, availability, price_from, currency, price_note, short_description, description, image, specs, highlights, tags, featured, published, sort_order)
values ('hybrid-solar-system-10kva', '10kVA Hybrid Solar System', 'MATECH Engineered', 'Solar & Storage', 'System', 'Made to Order', 6500000, 'NGN', 'Installed, sized to load', 'High-capacity 10kVA hybrid solar system for larger homes and business premises.', array['A 10kVA hybrid system for larger homes and commercial premises with heavier loads. Designed to carry more circuits through extended outages.', 'Includes load study, system design, installation and commissioning by MATECH engineers.']::text[], '/images/products/inverter-battery-stack.webp', $json$[{"label":"Inverter","value":"10kVA hybrid"},{"label":"System type","value":"Solar + battery + grid"},{"label":"Typical use","value":"Large home / business"},{"label":"Battery","value":"Expandable bank"},{"label":"Installation","value":"Included"}]$json$::jsonb, array['Higher capacity', 'Expandable battery', 'Business-ready', 'Full commissioning']::text[], array['solar', 'hybrid', 'inverter', 'battery', 'commercial']::text[], true, true, 1)
on conflict (slug) do update set
  name = excluded.name,
  brand = excluded.brand,
  category = excluded.category,
  type = excluded.type,
  availability = excluded.availability,
  price_from = excluded.price_from,
  currency = excluded.currency,
  price_note = excluded.price_note,
  short_description = excluded.short_description,
  description = excluded.description,
  image = excluded.image,
  specs = excluded.specs,
  highlights = excluded.highlights,
  tags = excluded.tags,
  featured = excluded.featured,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into public.products (slug, name, brand, category, type, availability, price_from, currency, price_note, short_description, description, image, specs, highlights, tags, featured, published, sort_order)
values ('lithium-battery-bank', 'Lithium Battery Storage Bank', 'Supplied brands', 'Solar & Storage', 'Product', 'On Request', null, 'NGN', null, 'Deep-cycle lithium battery storage for solar and backup systems, sized per project.', array['Deep-cycle lithium storage for solar and backup applications, longer life and deeper discharge than lead-acid, sized to your backup requirement.', 'Supplied and integrated by MATECH as part of a system or as a battery upgrade to an existing installation.']::text[], '/images/products/inverter-battery-stack.webp', $json$[{"label":"Chemistry","value":"Lithium (LiFePO₄)"},{"label":"Application","value":"Solar / backup"},{"label":"Capacity","value":"Configured per project"},{"label":"Integration","value":"By MATECH"}]$json$::jsonb, array['Long cycle life', 'Deep discharge', 'Scalable capacity', 'Professionally integrated']::text[], array['battery', 'lithium', 'storage', 'solar']::text[], false, true, 2)
on conflict (slug) do update set
  name = excluded.name,
  brand = excluded.brand,
  category = excluded.category,
  type = excluded.type,
  availability = excluded.availability,
  price_from = excluded.price_from,
  currency = excluded.currency,
  price_note = excluded.price_note,
  short_description = excluded.short_description,
  description = excluded.description,
  image = excluded.image,
  specs = excluded.specs,
  highlights = excluded.highlights,
  tags = excluded.tags,
  featured = excluded.featured,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into public.products (slug, name, brand, category, type, availability, price_from, currency, price_note, short_description, description, image, specs, highlights, tags, featured, published, sort_order)
values ('ups-backup-system', 'UPS Backup Infrastructure', 'MATECH Engineered', 'Power & UPS', 'System', 'Made to Order', null, 'NGN', 'Quoted per capacity', 'UPS backup infrastructure for critical loads, from small offices to campus-scale 80kVA installations.', array['Uninterruptible power infrastructure that protects critical loads from grid disturbances. MATECH has delivered up to 80kVA UPS infrastructure at campus scale.', 'We size, install, and commission the UPS with seamless changeover for your critical systems.']::text[], '/images/projects/ups-panel-install.webp', $json$[{"label":"Capacity","value":"Up to 80kVA+"},{"label":"Application","value":"Critical loads"},{"label":"Changeover","value":"Seamless"},{"label":"Installation","value":"Included"}]$json$::jsonb, array['Protects critical loads', 'Campus-scale capable', 'Seamless changeover', 'Commissioned & tested']::text[], array['ups', 'backup', 'power', 'critical', 'industrial']::text[], true, true, 3)
on conflict (slug) do update set
  name = excluded.name,
  brand = excluded.brand,
  category = excluded.category,
  type = excluded.type,
  availability = excluded.availability,
  price_from = excluded.price_from,
  currency = excluded.currency,
  price_note = excluded.price_note,
  short_description = excluded.short_description,
  description = excluded.description,
  image = excluded.image,
  specs = excluded.specs,
  highlights = excluded.highlights,
  tags = excluded.tags,
  featured = excluded.featured,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into public.products (slug, name, brand, category, type, availability, price_from, currency, price_note, short_description, description, image, specs, highlights, tags, featured, published, sort_order)
values ('industrial-control-panel', 'Industrial Control Panel', 'MATECH Engineered', 'Control & Automation', 'System', 'Made to Order', null, 'NGN', 'Designed & built to spec', 'Custom motor control and process control panels, designed and fabricated to your process.', array['Custom control panels, motor control centres, process control and distribution panels, designed and fabricated to your specification.', 'Built to standard with correct protection, labelling and documentation, and commissioned on your line.']::text[], '/images/projects/buhler-panel-bank.webp', $json$[{"label":"Types","value":"MCC / process / distribution"},{"label":"Design","value":"To specification"},{"label":"Documentation","value":"Full drawings"},{"label":"Commissioning","value":"Included"}]$json$::jsonb, array['Custom-designed', 'Built to standard', 'Fully documented', 'Commissioned on-site']::text[], array['control panel', 'automation', 'industrial', 'mcc', 'plc']::text[], true, true, 4)
on conflict (slug) do update set
  name = excluded.name,
  brand = excluded.brand,
  category = excluded.category,
  type = excluded.type,
  availability = excluded.availability,
  price_from = excluded.price_from,
  currency = excluded.currency,
  price_note = excluded.price_note,
  short_description = excluded.short_description,
  description = excluded.description,
  image = excluded.image,
  specs = excluded.specs,
  highlights = excluded.highlights,
  tags = excluded.tags,
  featured = excluded.featured,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into public.products (slug, name, brand, category, type, availability, price_from, currency, price_note, short_description, description, image, specs, highlights, tags, featured, published, sort_order)
values ('plc-scada-package', 'PLC & SCADA Integration Package', 'MATECH Engineered', 'Control & Automation', 'Service Package', 'On Request', null, 'NGN', 'Scoped per plant', 'PLC programming and SCADA/HMI development to automate and monitor your process line.', array['End-to-end PLC and SCADA integration, control logic, HMI screens and monitoring, to automate a process line and give operators real-time visibility.', 'Includes process study, programming, commissioning and operator training.']::text[], '/images/services/machine-monitoring.webp', $json$[{"label":"Scope","value":"PLC + SCADA/HMI"},{"label":"Includes","value":"Programming & commissioning"},{"label":"Training","value":"Operator training"},{"label":"Integration","value":"Existing equipment"}]$json$::jsonb, array['Real-time monitoring', 'Custom logic', 'Operator training', 'Integrates existing lines']::text[], array['plc', 'scada', 'automation', 'hmi', 'monitoring']::text[], false, true, 5)
on conflict (slug) do update set
  name = excluded.name,
  brand = excluded.brand,
  category = excluded.category,
  type = excluded.type,
  availability = excluded.availability,
  price_from = excluded.price_from,
  currency = excluded.currency,
  price_note = excluded.price_note,
  short_description = excluded.short_description,
  description = excluded.description,
  image = excluded.image,
  specs = excluded.specs,
  highlights = excluded.highlights,
  tags = excluded.tags,
  featured = excluded.featured,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into public.products (slug, name, brand, category, type, availability, price_from, currency, price_note, short_description, description, image, specs, highlights, tags, featured, published, sort_order)
values ('cctv-surveillance-system', 'CCTV Surveillance System', 'Dahua / supplied brands', 'Security', 'System', 'Made to Order', 850000, 'NGN', 'From, per coverage', 'Professional CCTV systems with NVR recording and remote viewing, from homes to full buildings.', array['Professional surveillance built around your site, HD/IP cameras, network video recording and secure remote viewing. MATECH has deployed multi-channel systems including 16-channel Dahua installations.', 'We plan coverage around real sightlines, install with clean cabling, and configure remote access.']::text[], '/images/projects/cctv-monitoring-wall.webp', $json$[{"label":"Cameras","value":"HD / IP"},{"label":"Recording","value":"NVR, configurable"},{"label":"Channels","value":"Up to 16+"},{"label":"Access","value":"Mobile & desktop"}]$json$::jsonb, array['Coverage-planned', 'Remote viewing', 'Reliable recording', 'Clean installation']::text[], array['cctv', 'security', 'surveillance', 'dahua', 'nvr']::text[], true, true, 6)
on conflict (slug) do update set
  name = excluded.name,
  brand = excluded.brand,
  category = excluded.category,
  type = excluded.type,
  availability = excluded.availability,
  price_from = excluded.price_from,
  currency = excluded.currency,
  price_note = excluded.price_note,
  short_description = excluded.short_description,
  description = excluded.description,
  image = excluded.image,
  specs = excluded.specs,
  highlights = excluded.highlights,
  tags = excluded.tags,
  featured = excluded.featured,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into public.products (slug, name, brand, category, type, availability, price_from, currency, price_note, short_description, description, image, specs, highlights, tags, featured, published, sort_order)
values ('access-control-intercom', 'Access Control & Intercom', 'Supplied brands', 'Security', 'System', 'On Request', null, 'NGN', null, 'Door access control and intercom systems for homes, offices and facilities.', array['Control who enters and communicate at the door with integrated access control and intercom systems.', 'Installed and configured by MATECH, and integrated with CCTV and building automation where required.']::text[], '/images/projects/cctv-pole-abubakar-rasheed.webp', $json$[{"label":"Access","value":"Card / code / device"},{"label":"Intercom","value":"Audio / video"},{"label":"Integration","value":"CCTV & automation"},{"label":"Setting","value":"Home / office / facility"}]$json$::jsonb, array['Entry control', 'Door intercom', 'Integrates with CCTV', 'Configured for you']::text[], array['access control', 'intercom', 'security', 'smart']::text[], false, true, 7)
on conflict (slug) do update set
  name = excluded.name,
  brand = excluded.brand,
  category = excluded.category,
  type = excluded.type,
  availability = excluded.availability,
  price_from = excluded.price_from,
  currency = excluded.currency,
  price_note = excluded.price_note,
  short_description = excluded.short_description,
  description = excluded.description,
  image = excluded.image,
  specs = excluded.specs,
  highlights = excluded.highlights,
  tags = excluded.tags,
  featured = excluded.featured,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into public.products (slug, name, brand, category, type, availability, price_from, currency, price_note, short_description, description, image, specs, highlights, tags, featured, published, sort_order)
values ('home-automation-package', 'Home & Building Automation', 'MATECH Engineered', 'Control & Automation', 'Service Package', 'On Request', null, 'NGN', null, 'Smart lighting, controls and integrated systems for modern homes and buildings.', array['Bring lighting, security and controls together into one manageable smart system for your home or building.', 'MATECH designs and installs automation that fits how you live and work, integrated with your electrical and security systems.']::text[], '/images/services/electrical-hero.webp', $json$[{"label":"Scope","value":"Lighting / controls / security"},{"label":"Integration","value":"CCTV, access, power"},{"label":"Setting","value":"Home / building"},{"label":"Design","value":"Bespoke"}]$json$::jsonb, array['Unified control', 'Integrated systems', 'Bespoke design', 'Professionally installed']::text[], array['automation', 'smart home', 'lighting', 'controls']::text[], false, true, 8)
on conflict (slug) do update set
  name = excluded.name,
  brand = excluded.brand,
  category = excluded.category,
  type = excluded.type,
  availability = excluded.availability,
  price_from = excluded.price_from,
  currency = excluded.currency,
  price_note = excluded.price_note,
  short_description = excluded.short_description,
  description = excluded.description,
  image = excluded.image,
  specs = excluded.specs,
  highlights = excluded.highlights,
  tags = excluded.tags,
  featured = excluded.featured,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into public.products (slug, name, brand, category, type, availability, price_from, currency, price_note, short_description, description, image, specs, highlights, tags, featured, published, sort_order)
values ('cable-tray-distribution', 'Cable Tray & Distribution', 'MATECH Engineered', 'Cabling & Distribution', 'Service Package', 'Made to Order', null, 'NGN', 'Per installation', 'Cable containment, distribution boards and clean power routing for industrial and commercial sites.', array['Organised, maintainable cable infrastructure, tray and containment systems, distribution boards and clean routing for industrial and commercial facilities.', 'MATECH installs to standard with proper labelling, as delivered for clients such as Golden Oil Company.']::text[], '/images/gallery/control-panel-golden-oil.webp', $json$[{"label":"Scope","value":"Trays / boards / routing"},{"label":"Setting","value":"Industrial / commercial"},{"label":"Finish","value":"Labelled & documented"},{"label":"Standard","value":"To spec"}]$json$::jsonb, array['Maintainable routing', 'Distribution boards', 'Labelled & documented', 'Industrial-grade']::text[], array['cable tray', 'distribution', 'containment', 'industrial']::text[], false, true, 9)
on conflict (slug) do update set
  name = excluded.name,
  brand = excluded.brand,
  category = excluded.category,
  type = excluded.type,
  availability = excluded.availability,
  price_from = excluded.price_from,
  currency = excluded.currency,
  price_note = excluded.price_note,
  short_description = excluded.short_description,
  description = excluded.description,
  image = excluded.image,
  specs = excluded.specs,
  highlights = excluded.highlights,
  tags = excluded.tags,
  featured = excluded.featured,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into public.products (slug, name, brand, category, type, availability, price_from, currency, price_note, short_description, description, image, specs, highlights, tags, featured, published, sort_order)
values ('residential-wiring-package', 'Residential Wiring Package', 'MATECH Engineered', 'Cabling & Distribution', 'Service Package', 'Made to Order', null, 'NGN', 'Per property', 'Complete home wiring, circuits, distribution, lighting and power to standard.', array['Complete residential wiring for new builds and rewires, lighting, power, distribution and protection, installed to standard.', 'Clean terminations, correct protection and a documented handover so your home is safe and maintainable.']::text[], '/images/gallery/cable-terminal.webp', $json$[{"label":"Scope","value":"Full home wiring"},{"label":"Includes","value":"Circuits / DB / protection"},{"label":"Handover","value":"Documented"},{"label":"Standard","value":"To code"}]$json$::jsonb, array['Complete wiring', 'Correct protection', 'Clean terminations', 'Documented handover']::text[], array['residential', 'wiring', 'electrical', 'home']::text[], false, true, 10)
on conflict (slug) do update set
  name = excluded.name,
  brand = excluded.brand,
  category = excluded.category,
  type = excluded.type,
  availability = excluded.availability,
  price_from = excluded.price_from,
  currency = excluded.currency,
  price_note = excluded.price_note,
  short_description = excluded.short_description,
  description = excluded.description,
  image = excluded.image,
  specs = excluded.specs,
  highlights = excluded.highlights,
  tags = excluded.tags,
  featured = excluded.featured,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into public.products (slug, name, brand, category, type, availability, price_from, currency, price_note, short_description, description, image, specs, highlights, tags, featured, published, sort_order)
values ('energy-audit-service', 'Energy Audit & Load Study', 'MATECH Engineered', 'Power & UPS', 'Service Package', 'In Stock', 150000, 'NGN', 'From, per site', 'Professional load study and energy audit, the right first step before any power or solar investment.', array['Before you invest in solar, UPS or an upgrade, know your real load. Our audit profiles consumption and outage patterns so any system is sized correctly.', 'You receive a clear report with recommendations and sizing, the foundation for a system that fits.']::text[], '/images/projects/sesame-plant-inspection.webp', $json$[{"label":"Deliverable","value":"Load & audit report"},{"label":"Use","value":"Solar / UPS / upgrade"},{"label":"Turnaround","value":"Per site"},{"label":"Outcome","value":"Correct sizing"}]$json$::jsonb, array['Real load data', 'Clear recommendations', 'Correct sizing', 'Investment-ready']::text[], array['audit', 'energy', 'load study', 'consulting']::text[], false, true, 11)
on conflict (slug) do update set
  name = excluded.name,
  brand = excluded.brand,
  category = excluded.category,
  type = excluded.type,
  availability = excluded.availability,
  price_from = excluded.price_from,
  currency = excluded.currency,
  price_note = excluded.price_note,
  short_description = excluded.short_description,
  description = excluded.description,
  image = excluded.image,
  specs = excluded.specs,
  highlights = excluded.highlights,
  tags = excluded.tags,
  featured = excluded.featured,
  published = excluded.published,
  sort_order = excluded.sort_order;

-- ---------------------------------------------------------------------------
-- staff_ids
-- ---------------------------------------------------------------------------
insert into public.staff_ids (staff_number, name, role, department, photo_path, blood_group, status, issued, expires, verified)
values ('MAT-ENG-0001', 'Eng. Muhammad Abdulmumin', 'Managing Director / CEO', 'Executive · Engineering', '/images/team/founder-portrait.webp', 'A+', 'Active', '2026-01-05'::date, '2028-01-05'::date, true)
on conflict (staff_number) do update set
  name = excluded.name,
  role = excluded.role,
  department = excluded.department,
  photo_path = excluded.photo_path,
  blood_group = excluded.blood_group,
  status = excluded.status,
  issued = excluded.issued,
  expires = excluded.expires,
  verified = excluded.verified;

insert into public.staff_ids (staff_number, name, role, department, photo_path, blood_group, status, issued, expires, verified)
values ('MAT-ENG-0007', 'Ibrahim Sani', 'Lead Electrical Engineer', 'Electrical Engineering', null, 'O+', 'Active', '2026-01-12'::date, '2028-01-12'::date, true)
on conflict (staff_number) do update set
  name = excluded.name,
  role = excluded.role,
  department = excluded.department,
  photo_path = excluded.photo_path,
  blood_group = excluded.blood_group,
  status = excluded.status,
  issued = excluded.issued,
  expires = excluded.expires,
  verified = excluded.verified;

insert into public.staff_ids (staff_number, name, role, department, photo_path, blood_group, status, issued, expires, verified)
values ('MAT-ENG-0012', 'Aisha Yusuf', 'Solar & Renewables Engineer', 'Renewable Energy', null, 'B+', 'Active', '2026-02-01'::date, '2028-02-01'::date, true)
on conflict (staff_number) do update set
  name = excluded.name,
  role = excluded.role,
  department = excluded.department,
  photo_path = excluded.photo_path,
  blood_group = excluded.blood_group,
  status = excluded.status,
  issued = excluded.issued,
  expires = excluded.expires,
  verified = excluded.verified;

insert into public.staff_ids (staff_number, name, role, department, photo_path, blood_group, status, issued, expires, verified)
values ('MAT-TECH-0023', 'Musa Bello', 'Senior Installation Technician', 'Field Operations', null, 'AB+', 'Active', '2026-02-14'::date, '2028-02-14'::date, true)
on conflict (staff_number) do update set
  name = excluded.name,
  role = excluded.role,
  department = excluded.department,
  photo_path = excluded.photo_path,
  blood_group = excluded.blood_group,
  status = excluded.status,
  issued = excluded.issued,
  expires = excluded.expires,
  verified = excluded.verified;

insert into public.staff_ids (staff_number, name, role, department, photo_path, blood_group, status, issued, expires, verified)
values ('MAT-TECH-0041', 'Sadiq Umar', 'CCTV & Automation Technician', 'Security Systems', null, 'O-', 'Active', '2026-03-03'::date, '2028-03-03'::date, true)
on conflict (staff_number) do update set
  name = excluded.name,
  role = excluded.role,
  department = excluded.department,
  photo_path = excluded.photo_path,
  blood_group = excluded.blood_group,
  status = excluded.status,
  issued = excluded.issued,
  expires = excluded.expires,
  verified = excluded.verified;

insert into public.staff_ids (staff_number, name, role, department, photo_path, blood_group, status, issued, expires, verified)
values ('MAT-TECH-0009', 'Former Contractor', 'Installation Technician', 'Field Operations', null, null, 'Expired', '2022-01-10'::date, '2024-01-10'::date, false)
on conflict (staff_number) do update set
  name = excluded.name,
  role = excluded.role,
  department = excluded.department,
  photo_path = excluded.photo_path,
  blood_group = excluded.blood_group,
  status = excluded.status,
  issued = excluded.issued,
  expires = excluded.expires,
  verified = excluded.verified;

-- ---------------------------------------------------------------------------
-- receipts (historic numbers preserved) + receipt_items
-- ---------------------------------------------------------------------------
insert into public.receipts (receipt_number, client, project, issue_date, subtotal, discount, vat, total, currency, payment_method, status, issued_by)
values ('REC-MAT-2024-0142', 'North West University', '80kVA UPS Infrastructure', '2024-03-18'::date, 4850000, 0, 0, 4850000, 'NGN', null, 'Paid', 'MATECH Accounts')
on conflict (receipt_number) do nothing;

insert into public.receipts (receipt_number, client, project, issue_date, subtotal, discount, vat, total, currency, payment_method, status, issued_by)
values ('REC-MAT-2024-0217', 'Dawanau International Market', 'Sesame Plant, Control Systems', '2024-06-02'::date, 7200000, 0, 0, 7200000, 'NGN', null, 'Paid', 'MATECH Accounts')
on conflict (receipt_number) do nothing;

insert into public.receipts (receipt_number, client, project, issue_date, subtotal, discount, vat, total, currency, payment_method, status, issued_by)
values ('REC-MAT-2025-0031', 'Private Client, Kano', '5kVA Hybrid Solar System', '2025-01-22'::date, 3200000, 0, 0, 3200000, 'NGN', null, 'Paid', 'MATECH Accounts')
on conflict (receipt_number) do nothing;

insert into public.receipts (receipt_number, client, project, issue_date, subtotal, discount, vat, total, currency, payment_method, status, issued_by)
values ('REC-MAT-2025-0088', 'Commercial Client, Kano', '16-Channel Dahua CCTV', '2025-04-11'::date, 1450000, 0, 0, 1450000, 'NGN', null, 'Partial', 'MATECH Accounts')
on conflict (receipt_number) do nothing;

insert into public.receipts (receipt_number, client, project, issue_date, subtotal, discount, vat, total, currency, payment_method, status, issued_by)
values ('REC-MAT-2025-0124', 'Abubakar Rasheed Building', 'Building CCTV Surveillance', '2025-06-30'::date, 2650000, 0, 0, 2650000, 'NGN', null, 'Paid', 'MATECH Accounts')
on conflict (receipt_number) do nothing;
insert into public.receipt_items (receipt_id, description, qty, unit_price, sort_order)
select r.id, v.description, v.qty, v.unit_price, v.sort_order
from public.receipts r
join (values
  ('REC-MAT-2024-0142', '80kVA UPS supply & installation', 1, 4200000, 0),
  ('REC-MAT-2024-0142', 'Distribution & protection works', 1, 450000, 1),
  ('REC-MAT-2024-0142', 'Commissioning & documentation', 1, 200000, 2),
  ('REC-MAT-2024-0217', 'Process & motor control panels', 3, 1600000, 0),
  ('REC-MAT-2024-0217', 'Plant wiring & instrumentation', 1, 1800000, 1),
  ('REC-MAT-2024-0217', 'PLC & monitoring integration', 1, 600000, 2),
  ('REC-MAT-2025-0031', '5kVA hybrid solar system (supply & install)', 1, 2900000, 0),
  ('REC-MAT-2025-0031', 'Battery bank', 1, 300000, 1),
  ('REC-MAT-2025-0088', '16-channel Dahua CCTV system', 1, 1100000, 0),
  ('REC-MAT-2025-0088', 'Installation & configuration', 1, 350000, 1),
  ('REC-MAT-2025-0124', 'Building-wide CCTV deployment', 1, 2200000, 0),
  ('REC-MAT-2025-0124', 'Poles, cabling & remote access setup', 1, 450000, 1)
) as v(receipt_number, description, qty, unit_price, sort_order)
  on v.receipt_number = r.receipt_number
where not exists (
  select 1 from public.receipt_items ri where ri.receipt_id = r.id
);

-- ---------------------------------------------------------------------------
-- quote_requests — DEMO leads (safe to delete). Reference preserved from MSG ids.
-- ---------------------------------------------------------------------------
insert into public.quote_requests (reference, name, email, phone, company, service, budget, message, items, status, priority, created_at)
values ('MSG-2025-0312', 'Abdullahi Garba', 'a.garba@example.com', '080 3311 2200', 'Garba Farms Ltd', 'Solar & Renewable Energy', '₦5M to ₦10M', 'We run an irrigation operation outside Kano and want to cut diesel costs. Interested in a hybrid solar system for the pumps and offices. Can you visit for an assessment?', $json$[]$json$::jsonb, 'New', 'High', '2025-08-10T09:24:00Z'::timestamptz)
on conflict (reference) do nothing;

insert into public.quote_requests (reference, name, email, phone, company, service, budget, message, items, status, priority, created_at)
values ('MSG-2025-0311', 'Sarah Momoh', 's.momoh@example.com', '070 8842 1190', null, 'Security Surveillance & Smart Systems', '₦1M to ₦3M', 'Need CCTV for a 2-storey office building, around 12 cameras with remote viewing on our phones. What would that cost installed?', $json$[]$json$::jsonb, 'Reviewing', 'Normal', '2025-08-09T14:05:00Z'::timestamptz)
on conflict (reference) do nothing;

insert into public.quote_requests (reference, name, email, phone, company, service, budget, message, items, status, priority, created_at)
values ('MSG-2025-0309', 'BUK Facilities Office', 'facilities@example.com', '080 9909 3452', 'Bayero University Kano', 'Electrical Engineering & Installation', 'On request', 'Following up on maintenance of the solar plant at New Site and a possible extension. Please share availability for a meeting.', $json$[]$json$::jsonb, 'Reviewing', 'High', '2025-08-08T11:40:00Z'::timestamptz)
on conflict (reference) do nothing;

insert into public.quote_requests (reference, name, email, phone, company, service, budget, message, items, status, priority, created_at)
values ('MSG-2025-0305', 'Chinedu Okafor', 'c.okafor@example.com', '081 2200 7788', 'Okafor Textiles', 'SCADA & Industrial Automation', '₦10M+', 'We want to automate and monitor our production line. Currently everything is manual. Do you retrofit existing machines with PLC control?', $json$[]$json$::jsonb, 'New', 'High', '2025-08-07T16:18:00Z'::timestamptz)
on conflict (reference) do nothing;

insert into public.quote_requests (reference, name, email, phone, company, service, budget, message, items, status, priority, created_at)
values ('MSG-2025-0301', 'Fatima Aliyu', 'f.aliyu@example.com', '090 5566 3344', null, 'Solar & Renewable Energy', '₦3M to ₦5M', 'Looking for a 5kVA solar system for my home in Kaduna. How long does installation take and do you offer a warranty?', $json$[]$json$::jsonb, 'Completed', 'Normal', '2025-08-05T08:52:00Z'::timestamptz)
on conflict (reference) do nothing;

insert into public.quote_requests (reference, name, email, phone, company, service, budget, message, items, status, priority, created_at)
values ('MSG-2025-0298', 'Ahmed Lawal', 'a.lawal@example.com', '080 1234 5678', 'Lawal Properties', 'Electrical Engineering & Installation', '₦5M to ₦10M', 'We are building a block of flats and need complete electrical wiring plus a backup power solution. Can you quote for both?', $json$[]$json$::jsonb, 'Completed', 'Normal', '2025-08-02T13:30:00Z'::timestamptz)
on conflict (reference) do nothing;

insert into public.quote_requests (reference, name, email, phone, company, service, budget, message, items, status, priority, created_at)
values ('MSG-2025-0294', 'Grace Emmanuel', 'g.emmanuel@example.com', '070 9988 1122', null, 'Security Surveillance & Smart Systems', '₦1M to ₦3M', 'Interested in home automation, smart lighting and CCTV together. Do you handle both in one project?', $json$[]$json$::jsonb, 'New', 'Low', '2025-08-01T10:15:00Z'::timestamptz)
on conflict (reference) do nothing;

commit;
