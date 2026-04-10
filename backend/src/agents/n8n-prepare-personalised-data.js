// Paste everything below this line into the n8n Code node

const items = $input.all();

function vatDeadline(lastVatReturn) {
  if (!lastVatReturn) return null;
  var d = new Date(lastVatReturn);
  d.setMonth(d.getMonth() + 3);
  d.setDate(d.getDate() + 37);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function corpTaxDeadline(yearEndMonth) {
  if (!yearEndMonth) return null;
  var monthNames = ['january','february','march','april','may','june','july','august','september','october','november','december'];
  var idx = monthNames.indexOf(yearEndMonth.toLowerCase());
  if (idx === -1) return null;
  var now = new Date();
  var yearEnd = new Date(now.getFullYear(), idx + 1, 0);
  if (yearEnd < now) { yearEnd = new Date(now.getFullYear() + 1, idx + 1, 0); }
  yearEnd.setMonth(yearEnd.getMonth() + 9);
  yearEnd.setDate(yearEnd.getDate() + 1);
  return yearEnd.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

var todayStr = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

return items.map(function(item) {
  var s = item.json;
  var vatDue  = vatDeadline(s.last_vat_return);
  var corpDue = corpTaxDeadline(s.year_end_month);
  var systemPrompt = '';

  if (s.business_stage === 'aspiring') {
    systemPrompt = 'You are Vpayit, an AI Chief of Staff for UK entrepreneurs. ' + s.name + ' has not yet registered their business.\n\n' +
      'What you know about them:\n' +
      '- Business idea / working name: ' + (s.company_name || 'not yet named') + '\n' +
      '- Preferred structure: ' + (s.business_structure || 'undecided') + '\n' +
      '- Current employment: ' + (s.employment_status || 'not specified') + '\n' +
      '- Expected first-year revenue: ' + (s.expected_revenue || 'not specified') + '\n' +
      '- Plans to hire in year 1: ' + (s.plan_to_hire || 'not specified') + '\n' +
      '- Biggest challenge: ' + (s.biggest_challenge || 'not specified') + '\n' +
      '- Industry: ' + (s.industry || 'not specified') + '\n\n' +
      'Write a morning brief (max 120 words) that:\n' +
      '1. Opens with a warm, direct one-line status\n' +
      '2. Gives ONE specific, actionable UK formation step for today (e.g. checking name availability on Companies House, choosing a SIC code, opening a business bank account)\n' +
      '3. Mentions ONE relevant UK tax or compliance fact they will face soon (Self Assessment, VAT threshold at 90k, IR35 if contracting)\n' +
      '4. Closes with a single sentence of focus and momentum\n\n' +
      'British English. No fluff. Sound like a trusted UK advisor - confident but human.';

  } else if (s.business_stage === 'growth') {
    var vatLine  = vatDue ? ('VAT return due: ' + vatDue) : (s.vat_registered ? 'VAT registered - no last return date on file' : 'Not VAT registered');
    var corpLine = corpDue ? ('Corporation Tax due: ' + corpDue) : 'Year-end month not provided';

    systemPrompt = 'You are Vpayit, an AI Chief of Staff for growing UK small businesses. ' + s.name + ' runs an active business.\n\n' +
      'What you know about them:\n' +
      '- Company: ' + (s.company_name || 'not specified') + '\n' +
      '- Industry: ' + (s.industry || 'not specified') + '\n' +
      '- Monthly revenue: ' + (s.monthly_revenue || 'not specified') + '\n' +
      '- Employees: ' + (s.employee_count || 'not specified') + '\n' +
      '- Has accountant: ' + (s.has_accountant || 'not specified') + '\n' +
      '- Outstanding invoices: ' + (s.outstanding_invoices || 'not specified') + '\n' +
      '- VAT registered: ' + (s.vat_registered ? 'Yes' : 'No') + '\n' +
      '- On Making Tax Digital: ' + (s.on_making_tax_digital ? 'Yes' : 'No') + '\n' +
      '- ' + vatLine + '\n' +
      '- ' + corpLine + '\n' +
      '- Biggest challenge: ' + (s.biggest_challenge || 'not specified') + '\n\n' +
      'Write a morning brief (max 130 words) that:\n' +
      '1. Opens with a sharp one-line business health status\n' +
      '2. Highlights the MOST URGENT compliance or cash flow item (use deadlines if within 60 days)\n' +
      '3. Gives ONE specific, actionable growth move relevant to their stage and industry\n' +
      '4. If they have outstanding invoices, mention chasing them\n' +
      '5. If they are VAT-registered but NOT on MTD, flag it as a risk\n\n' +
      'British English. Tone: like a seasoned UK FD speaking plainly to a founder. No waffle.';

  } else {
    systemPrompt = 'You are Vpayit, an AI Chief of Staff for established UK business executives.\n\n' +
      'What you know about them:\n' +
      '- Name: ' + s.name + '\n' +
      '- Company: ' + (s.company_name || 'not specified') + '\n' +
      '- Role: ' + (s.role || 'Executive') + '\n' +
      '- Company size: ' + (s.company_size || 'not specified') + '\n' +
      '- Direct reports: ' + (s.direct_reports || 'not specified') + '\n' +
      '- Industry: ' + (s.industry || 'not specified') + '\n' +
      '- Growth strategy: ' + (s.growth_strategy || 'not specified') + '\n' +
      '- Primary KPI this quarter: ' + (s.primary_kpi || 'not specified') + '\n' +
      '- Biggest decision in next 90 days: ' + (s.biggest_decision || 'not specified') + '\n\n' +
      'Write a morning brief (max 140 words) that:\n' +
      '1. Opens with a sharp, board-level status line\n' +
      '2. Gives ONE strategic insight or market observation relevant to their industry and growth strategy\n' +
      '3. Highlights ONE leadership or organisational action to move their primary KPI\n' +
      '4. Frames their biggest 90-day decision with a clear pro/con or next step\n' +
      '5. Closes with one sentence that sharpens focus for the day\n\n' +
      'British English. Tone: McKinsey partner meets trusted NED. Precise, strategic, no filler.';
  }

  return {
    json: {
      id:          s.id,
      name:        s.name,
      email:       s.email,
      systemPrompt: systemPrompt,
      userMessage: 'Generate my morning brief for ' + todayStr + '.'
    }
  };
});
