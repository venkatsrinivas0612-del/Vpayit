const { serviceClient } = require('../config/supabase');
const cache = require('../utils/cache');

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

async function loadSuppliers() {
  const cached = cache.get('suppliers');
  if (cached) return cached;
  const { data, error } = await serviceClient.from('suppliers').select('*');
  if (error) throw error;
  cache.set('suppliers', data, CACHE_TTL_MS);
  // Also cache the unique bill categories derived from suppliers
  const categories = [...new Set(data.map(s => s.category).filter(Boolean))];
  cache.set('bill_categories', categories, CACHE_TTL_MS);
  return data;
}

// ── Generic bill signal patterns ─────────────────────────
const GENERIC_BILL_PATTERNS = [
  { regex: /DIRECT\s?DEBIT/i,       category: 'unknown'    },
  { regex: /STANDING\s?ORDER/i,     category: 'unknown'    },
  { regex: /COUNCIL\s?TAX/i,        category: 'rates'      },
  { regex: /WATER\s?RATES/i,        category: 'water'      },
  { regex: /BUSINESS\s?RATES/i,     category: 'rates'      },
  { regex: /RENT\s?PAYMENT/i,       category: 'rent'       },
  { regex: /MORTGAGE/i,             category: 'mortgage'   },
  { regex: /\bINSURANCE\b/i,        category: 'insurance'  },
  { regex: /\bENERGY\b/i,           category: 'energy'     },
  { regex: /\bELECTRIC\b/i,        category: 'energy'     },
  { regex: /\bGAS\s+SUPPLY\b/i,    category: 'energy'     },
  { regex: /\bBROADBAND\b/i,       category: 'telecoms'   },
  { regex: /\bMOBILE\b/i,          category: 'telecoms'   },
  { regex: /\bTELEPHONE\b/i,      category: 'telecoms'   },
  { regex: /\bSUBSCRIPT/i,        category: 'software'   },
  { regex: /\bLICENCE\b/i,        category: 'software'   },
];

/**
 * Normalises a transaction description for pattern matching.
 */
function normalise(text) {
  return text
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Classifies a single transaction.
 * @returns {{ isBill, supplier, billCategory, confidence }}
 */
async function classifyTransaction(description) {
  const suppliers = await loadSuppliers();
  const normalised = normalise(description);

  // 1. Exact supplier pattern match
  for (const supplier of suppliers) {
    for (const pattern of supplier.patterns) {
      if (normalised.includes(pattern.toUpperCase())) {
        return {
          isBill:       true,
          supplier,
          billCategory: supplier.category,
          confidence:   'high',
        };
      }
    }
  }

  // 2. Generic bill keyword match
  for (const { regex, category } of GENERIC_BILL_PATTERNS) {
    if (regex.test(description)) {
      return {
        isBill:       true,
        supplier:     null,
        billCategory: category,
        confidence:   'medium',
      };
    }
  }

  return { isBill: false, supplier: null, billCategory: null, confidence: 'low' };
}

/**
 * Groups bill transactions by supplier/description and detects recurring patterns.
 * @param {Array} transactions - transactions with is_bill = true
 * @returns {Array} array of detected recurring-bill objects ready for the bills table
 */
function detectRecurringBills(transactions) {
  // Group by supplier_id first, then fall back to normalised description prefix
  const groups = {};

  for (const txn of transactions) {
    const key = txn.supplier_id
      ? `supplier:${txn.supplier_id}`
      : `desc:${normalise(txn.description).slice(0, 20)}`;

    if (!groups[key]) groups[key] = [];
    groups[key].push(txn);
  }

  const recurring = [];

  for (const txns of Object.values(groups)) {
    if (txns.length < 2) continue;

    txns.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate average interval in days
    const intervals = [];
    for (let i = 1; i < txns.length; i++) {
      const days = Math.round(
        (new Date(txns[i].date) - new Date(txns[i - 1].date)) / 86_400_000
      );
      intervals.push(days);
    }
    const avgDays = intervals.reduce((s, d) => s + d, 0) / intervals.length;

    let frequency;
    if (avgDays <= 10)       frequency = 'weekly';
    else if (avgDays <= 35)  frequency = 'monthly';
    else if (avgDays <= 100) frequency = 'quarterly';
    else                     frequency = 'annual';

    const latest = txns[txns.length - 1];
    const prev   = txns[txns.length - 2];

    recurring.push({
      supplierId:     latest.supplier_id || null,
      category:       latest.bill_category || 'unknown',
      currentAmount:  Math.abs(latest.amount),
      previousAmount: Math.abs(prev.amount),
      frequency,
      nextDueDate:    _nextDueDate(latest.date, frequency),
    });
  }

  return recurring;
}

function _nextDueDate(lastDateStr, frequency) {
  const d = new Date(lastDateStr);
  if (frequency === 'weekly')    d.setDate(d.getDate() + 7);
  if (frequency === 'monthly')   d.setMonth(d.getMonth() + 1);
  if (frequency === 'quarterly') d.setMonth(d.getMonth() + 3);
  if (frequency === 'annual')    d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split('T')[0];
}

/** Bust the supplier/category cache (e.g. after seeding) */
function bustCache() {
  cache.delete('suppliers');
  cache.delete('bill_categories');
}

module.exports = { classifyTransaction, detectRecurringBills, bustCache };
