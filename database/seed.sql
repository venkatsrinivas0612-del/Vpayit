-- ============================================================
-- Vpayit Supplier Seed Data — 41 real UK suppliers
-- Run AFTER schema.sql
-- ============================================================

INSERT INTO public.suppliers (name, category, patterns, avg_monthly_rate) VALUES

-- ── ENERGY ────────────────────────────────────────────────
('British Gas',    'energy',    ARRAY['BRITISH GAS', 'BRITISHGAS', 'BG GAS SERVICES', 'BG ENERGY', 'BRITISH GAS BUS'],          180.00),
('EDF Energy',     'energy',    ARRAY['EDF ENERGY', 'EDF SUPPLY', 'EDF UK', 'EDF ELECTRIC', 'EDF LIMITED'],                     165.00),
('Octopus Energy', 'energy',    ARRAY['OCTOPUS ENERGY', 'OCTOPUS ELECT', 'OCTOPUS GAS', 'OCTOPUSENERGY', 'OCTOPUS EN'],          145.00),
('E.ON Next',      'energy',    ARRAY['EON ENERGY', 'E.ON UK', 'EON NEXT', 'E ON ENERGY', 'EON UK', 'EONENERGY'],                158.00),
('Scottish Power', 'energy',    ARRAY['SCOTTISH POWER', 'SCOTTISHPOWER', 'SP ENERGY', 'SP MANWEB'],                              172.00),
('SSE',            'energy',    ARRAY['SSE ENERGY', 'SSE ELECTRIC', 'SSE GAS', 'SOUTHERN ELECTRIC', 'SSE PLC'],                  160.00),
('Shell Energy',   'energy',    ARRAY['SHELL ENERGY', 'SHELL GAS ELECTRIC', 'FIRST UTILITY', 'SHELLENERGY'],                    155.00),

-- ── WATER ─────────────────────────────────────────────────
('Thames Water',      'water',  ARRAY['THAMES WATER', 'THAMESWATER', 'THAMES UTILITIES', 'TW WATER'],                           45.00),
('Anglian Water',     'water',  ARRAY['ANGLIAN WATER', 'ANGLIANWATER', 'ANGLIAN WTR', 'ANGLIAN WATER SVC'],                      38.00),
('Yorkshire Water',   'water',  ARRAY['YORKSHIRE WATER', 'YORKSHIRE WTR', 'YW WATER', 'YW SERVICES'],                           35.00),
('Severn Trent',      'water',  ARRAY['SEVERN TRENT', 'STWATER', 'SEVERN TRENT WATER', 'ST WATER'],                             40.00),
('United Utilities',  'water',  ARRAY['UNITED UTILITIES', 'UU WATER', 'UNITED UTIL', 'UNITEDUTILITIES'],                        42.00),

-- ── INSURANCE ─────────────────────────────────────────────
('Aviva',          'insurance', ARRAY['AVIVA', 'AVIVA INS', 'AVIVA INSURANCE', 'AVIVA UK', 'AVIVA DIRECT'],                     95.00),
('Zurich',         'insurance', ARRAY['ZURICH', 'ZURICH INS', 'ZURICH INSURANCE', 'ZURICH UK', 'ZURICH COMMERCIAL'],           110.00),
('AXA',            'insurance', ARRAY['AXA', 'AXA INS', 'AXA INSURANCE', 'AXA UK', 'AXA DIRECT'],                              85.00),
('Direct Line',    'insurance', ARRAY['DIRECT LINE', 'DIRECTLINE', 'DL INSURANCE', 'DIRECT LINE INS', 'DIRECT LINE GRP'],       75.00),
('RSA Insurance',  'insurance', ARRAY['RSA', 'RSA INS', 'RSA INSURANCE', 'RSA GROUP', 'ROYAL SUN ALLIANCE'],                    90.00),
('Hiscox',         'insurance', ARRAY['HISCOX', 'HISCOX INS', 'HISCOX UK', 'HISCOX LIMITED'],                                  120.00),

-- ── TELECOMS ──────────────────────────────────────────────
('BT',             'telecoms',  ARRAY['BT GROUP', 'BT BUSINESS', 'BRITISH TELECOM', 'BT OPENREACH', 'BT PLC', 'BT COMM'],       65.00),
('Vodafone',       'telecoms',  ARRAY['VODAFONE', 'VODAFONE BUS', 'VODAFONE UK', 'VODAFONE LTD', 'VODAFONE BUSINESS'],          55.00),
('Sky',            'telecoms',  ARRAY['SKY', 'SKY BUS', 'SKY BUSINESS', 'SKY BROADBAND', 'SKY TV', 'SKY UK'],                   70.00),
('Virgin Media',   'telecoms',  ARRAY['VIRGIN MEDIA', 'VIRGINMEDIA', 'VIRGIN BUSINESS', 'VIRGIN MEDIA BUS', 'VM MEDIA'],        60.00),
('EE',             'telecoms',  ARRAY['EE', 'EE MOBILE', 'EE BUSINESS', 'EE UK', 'EE LIMITED'],                                 45.00),
('O2',             'telecoms',  ARRAY['O2', 'O2 BUSINESS', 'O2 UK', 'TELEFONICA UK', 'VIRGIN O2'],                              40.00),
('Three',          'telecoms',  ARRAY['THREE', 'HUTCHISON 3G', '3 MOBILE', 'THREE UK', 'THREE BUSINESS'],                       35.00),

-- ── SOFTWARE & SAAS ───────────────────────────────────────
('Sage',           'software',  ARRAY['SAGE', 'SAGE PAY', 'SAGE GRP', 'SAGE GROUP', 'SAGE UK', 'SAGE CLOUD'],                   35.00),
('Xero',           'software',  ARRAY['XERO', 'XERO LIMITED', 'XERO UK', 'XERO LTD', 'XERO ACCOUNTING'],                       28.00),
('QuickBooks',     'software',  ARRAY['QUICKBOOKS', 'INTUIT', 'INTUIT QUICKBOOKS', 'QB ONLINE', 'QUICKBK'],                     30.00),
('Microsoft 365',  'software',  ARRAY['MICROSOFT', 'MSFT', 'MICROSOFT 365', 'MS365', 'MICROSOFT CORP', 'MICROSOFT IRELAND'],    20.00),
('Google Workspace','software', ARRAY['GOOGLE', 'GOOGLE WORKSPACE', 'GOOGLE IRELAND', 'GOOGLE LLC', 'GSUITE'],                  12.00),
('Slack',          'software',  ARRAY['SLACK', 'SLACK TECHNOL', 'SLACK TECHNOLOGIES', 'SLACK INC'],                             18.00),
('Zoom',           'software',  ARRAY['ZOOM', 'ZOOM.US', 'ZOOM VIDEO', 'ZOOM COMMUNIC', 'ZOOM UK'],                             14.00),
('Dropbox',        'software',  ARRAY['DROPBOX', 'DROPBOX INC', 'DROPBOX.COM', 'DROPBOX UK'],                                   10.00),

-- ── COUNCIL / BUSINESS RATES ──────────────────────────────
('Hackney Council',         'rates', ARRAY['HACKNEY COUNCIL', 'LB HACKNEY', 'LONDON BOROUGH OF HACKNEY', 'HACKNEY BC'],        350.00),
('Westminster City Council','rates', ARRAY['WESTMINSTER CITY', 'WCC RATES', 'CITY OF WESTMINSTER', 'WESTMINSTER CC'],           500.00),
('Manchester City Council', 'rates', ARRAY['MANCHESTER CITY', 'MCC RATES', 'MANCHESTER CITY COUNCIL', 'MAN CC'],               280.00),
('Birmingham City Council', 'rates', ARRAY['BIRMINGHAM CITY', 'BCC RATES', 'BIRMINGHAM CC', 'BIRMINGHAM COUNCIL'],             320.00),

-- ── WASTE MANAGEMENT ──────────────────────────────────────
('Biffa Waste',    'waste',             ARRAY['BIFFA', 'BIFFA WASTE', 'BIFFA GROUP', 'BIFFA LTD', 'BIFFA PLC'],                 85.00),
('Veolia',         'waste',             ARRAY['VEOLIA', 'VEOLIA WASTE', 'VEOLIA ENV', 'VEOLIA UK', 'VEOLIA WATER'],             95.00),

-- ── OTHER ─────────────────────────────────────────────────
('Royal Mail',     'postage',           ARRAY['ROYAL MAIL', 'ROYALMAIL', 'ROYAL MAIL GRP', 'RM GROUP', 'ROYAL MAIL PLC'],       25.00),
('Worldpay',       'payment_processing',ARRAY['WORLDPAY', 'WORLDPAY INT', 'WORLDPAY UK', 'WORLDPAY LTD', 'WORLDPAY FEES'],      30.00),
('Stripe',         'payment_processing',ARRAY['STRIPE', 'STRIPE UK', 'STRIPE PAYMENTS', 'STRIPE.COM', 'STRIPE IRELAND'],         0.00),
('HMRC',           'tax',               ARRAY['HMRC', 'HM REVENUE', 'HMRC PAYE', 'HMRC VAT', 'HM REVENUE CUSTOMS', 'HMRC CUST'], 0.00),
('Companies House','compliance',        ARRAY['COMPANIES HOUSE', 'COMP HOUSE', 'COMPANIES HSE'],                                  13.00)

ON CONFLICT DO NOTHING;
