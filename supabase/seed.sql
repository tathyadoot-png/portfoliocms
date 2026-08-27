-- Local development fixtures only. Never applied to production.
-- Everything below is obviously fake dev data - not a real politician.

insert into public.portfolios (slug, full_name_en, full_name_hi, designation_en, designation_hi, about_en, about_hi, status, theme)
values (
  'test-portfolio',
  'Test Portfolio (Dev Fixture)',
  'परीक्षण प्रोफ़ाइल (डेव फिक्स्चर)',
  'Sample Designation',
  'नमूना पदनाम',
  'This is placeholder about text for local development only.',
  'यह केवल स्थानीय विकास के लिए प्लेसहोल्डर टेक्स्ट है।',
  'active',
  'default'
)
on conflict (slug) where deleted_at is null do nothing;

insert into public.cloudinary_configs (portfolio_id, cloud_name, upload_preset, default_folder)
select id, 'demo-cloud-test-portfolio', 'unsigned-test-preset', 'test-portfolio'
from public.portfolios
where slug = 'test-portfolio'
on conflict (portfolio_id) do nothing;

insert into public.seo_meta (portfolio_id, meta_title_en, meta_title_hi, meta_description_en, meta_description_hi)
select id, 'Test Portfolio | Dev Fixture', 'परीक्षण प्रोफ़ाइल | डेव फिक्स्चर', 'Local dev fixture only.', 'केवल स्थानीय विकास फिक्स्चर।'
from public.portfolios
where slug = 'test-portfolio'
on conflict (portfolio_id) do nothing;

insert into public.social_links (portfolio_id, platform, url, sort_order)
select id, 'website', 'https://example.com/test-portfolio', 0
from public.portfolios
where slug = 'test-portfolio';

insert into public.portfolio_settings (portfolio_id, contact_email, contact_phone, address_en, address_hi)
select id, 'test-fixture@example.com', '+91-0000000000', '123 Placeholder Street, Test City', '123 प्लेसहोल्डर स्ट्रीट, टेस्ट शहर'
from public.portfolios
where slug = 'test-portfolio'
on conflict (portfolio_id) do nothing;

insert into public.media (portfolio_id, role, kind, cloudinary_public_id, cloudinary_secure_url, alt_text_en, alt_text_hi)
select id, 'cover', 'image', 'test-portfolio/fixtures/sample-cover', 'https://res.cloudinary.com/demo-cloud-test-portfolio/image/upload/v1/test-portfolio/fixtures/sample-cover.jpg', 'Placeholder cover image', 'प्लेसहोल्डर कवर छवि'
from public.portfolios
where slug = 'test-portfolio';

insert into public.activities (portfolio_id, slug, title_en, title_hi, description_en, description_hi, location_en, location_hi, activity_date, display_date, status, is_featured)
select id, 'sample-community-visit', 'Sample Community Visit', 'नमूना सामुदायिक यात्रा', 'Placeholder description for local development only.', 'केवल स्थानीय विकास के लिए प्लेसहोल्डर विवरण।', 'Sample Town Hall', 'नमूना टाउन हॉल', '2026-07-24', '24 July 2026', 'published', true
from public.portfolios
where slug = 'test-portfolio'
on conflict (portfolio_id, slug) where deleted_at is null do nothing;
