const { Router } = require('express');
const Anthropic = require('@anthropic-ai/sdk');

const router = Router();
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are Vpayit, an AI Chief of Staff for UK small and medium-sized businesses. You help founders and executives understand their business finances, compliance obligations, and strategy.

Answer directly and concisely. Use British English. Use £ not $. Reference UK bodies and regulations (HMRC, Companies House, Making Tax Digital, FCA, Corporation Tax, VAT, PAYE) where relevant. Never fabricate specific numbers — if you lack real data, say so.

FORMATTING RULES — strictly follow these:
- Never use markdown: no ##, no **, no *, no bullet dashes, no numbered lists with dots
- Write in plain flowing prose only
- Maximum 80 words
- Lead with the direct answer, no preamble like "Great question" or "As your AI Chief of Staff"
- If listing steps, write them as: "First... Then... Finally..." in a single paragraph`;

router.post('/', async (req, res) => {
  const { question, context } = req.body;

  if (!question || !question.trim()) {
    return res.status(400).json({ error: 'Question is required.' });
  }

  const userMessage = context
    ? `Business context:\n${context}\n\nQuestion: ${question}`
    : question;

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });

    const reply = message.content[0]?.text ?? '';
    return res.json({ reply });
  } catch (err) {
    console.error('Ask route error:', err.message);
    return res.status(500).json({ error: 'AI request failed. Please try again.' });
  }
});

module.exports = router;
