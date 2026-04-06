/**
 * Helm Morning Brief Agent
 *
 * What this does: Every morning at 8am UK time, this script asks Claude AI
 * to write a personalised morning briefing email for your business,
 * then sends it to you via Zoho email.
 *
 * Right now it uses MOCK (fake) data so you can test the whole flow
 * without connecting any databases. Later you'll swap in real Supabase data.
 */

const cron = require('node-cron');
const { Resend } = require('resend');
const Anthropic = require('@anthropic-ai/sdk');

// ─── MOCK BUSINESS DATA ────────────────────────────────────────────
// This is fake but realistic data for testing.
// Later you'll replace this with real data from Supabase.
const mockBusinessData = {
  company: 'Helm Ltd',
  owner: 'Sarah Chen',
  date: new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }),
  bankBalance: 8420,
  balanceChange: -340,
  overdueInvoices: [
    {
      client: 'CloudCo Ltd',
      amount: 1800,
      daysOverdue: 5,
      invoiceNumber: 'INV-2026-041',
    },
  ],
  upcomingDeadlines: [
    {
      title: 'VAT return (quarter ending 31 March 2026)',
      dueIn: '21 days',
      dueDate: '26 April 2026',
    },
    {
      title: 'Companies House confirmation statement',
      dueIn: '9 days',
      dueDate: '14 April 2026',
    },
  ],
  todaysMeetings: [
    {
      time: '11:00 AM',
      title: 'Accountant call — quarterly review',
    },
  ],
  quickWins: [
    'Revenue up 18% vs last month',
    '3 new enquiries this week',
  ],
};

// ─── SYSTEM PROMPT FOR CLAUDE ──────────────────────────────────────
// This tells Claude what role to play and how to format the email.
const SYSTEM_PROMPT = `You are Helm's Morning Brief engine — an AI Chief of Staff for UK small businesses.

Your job is to generate a clean, professional HTML email body for a daily morning briefing.

Rules:
- Use British English throughout (colour, organisation, favour, etc.)
- Use £ for currency, never $
- Use UK date format (5 April 2026, not April 5, 2026)
- Return ONLY the HTML — no markdown, no code fences, no explanation
- Use inline CSS styles (this is for email clients which don't support <style> blocks)
- Keep the tone warm, professional, and encouraging — like a trusted chief of staff
- Keep it scannable: short paragraphs, bullet points, clear sections
- The email should feel premium but not corporate — friendly but competent

Structure the email with these sections:
1. Greeting headline with the date
2. Money Snapshot — bank balance, change from yesterday, any concerns
3. Actions Required — overdue invoices or urgent items (numbered)
4. Upcoming Deadlines — what's coming up in the next 30 days
5. Day Ahead — today's meetings/schedule
6. Quick Win — something positive to start the day with confidence

Use a clean colour scheme: #1a1a2e for dark text, #4361ee for accent/links, #f8f9fa for section backgrounds. Add a subtle Helm branding footer.`;

// ─── THE MAIN FUNCTION THAT GENERATES AND SENDS THE BRIEF ─────────
async function sendMorningBrief() {
  console.log('[Morning Brief] Starting generation...');

  // Step 1: Call Claude to generate the email HTML
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  let emailHtml;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Generate today's morning brief email using this business data:\n\n${JSON.stringify(mockBusinessData, null, 2)}\n\nReturn only the complete HTML email body.`,
        },
      ],
    });

    emailHtml = message.content[0].text;
    console.log('[Morning Brief] Claude generated the email successfully.');
  } catch (err) {
    console.error('[Morning Brief] ERROR calling Claude API:', err.message);
    return; // Stop here — don't send a broken email
  }

  // Step 2: Send the email via Resend
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { data, error } = await resend.emails.send({
      from: 'Helm AI <onboarding@resend.dev>',
      to: 'venkatsrinivas0612@gmail.com',
      subject: `Morning Brief — ${mockBusinessData.date}`,
      html: emailHtml,
    });

    if (error) {
      console.error('[Morning Brief] ERROR sending email:', error.message);
    } else {
      console.log(`[Morning Brief] Email sent! ID: ${data.id}`);
    }
  } catch (err) {
    console.error('[Morning Brief] ERROR sending email:', err.message);
  }
}

// ─── SCHEDULE: RUNS AT 8AM LONDON TIME EVERY DAY ──────────────────
// The cron expression "0 8 * * *" means "at 08:00 every day".
// The timezone option makes sure it's 8am in London, not UTC.
function startMorningBriefAgent() {
  console.log('[Morning Brief] Agent started. Will send brief at 8:00 AM London time daily.');

  cron.schedule('0 8 * * *', () => {
    console.log('[Morning Brief] Cron triggered — generating brief...');
    sendMorningBrief();
  }, {
    timezone: 'Europe/London',
  });

  // Also expose a way to trigger it manually for testing
  return { sendMorningBrief };
}

module.exports = { startMorningBriefAgent, sendMorningBrief };
