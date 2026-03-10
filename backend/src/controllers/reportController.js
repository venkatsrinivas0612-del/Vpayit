const PDFDocument = require('pdfkit');

// Helpers
const fmtGBP = (n) => `\u00a3${(n ?? 0).toFixed(2)}`;
const fmtPct = (n) => (n >= 0 ? '+' : '') + n.toFixed(1) + '%';

function getMonthsAgo(n) {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  d.setDate(1);
  return d.toISOString().slice(0, 10);
}

function drawHRule(doc, y, colour = '#E8ECF1') {
  doc.save().strokeColor(colour).lineWidth(1).moveTo(50, y).lineTo(545, y).stroke().restore();
}

function drawTableRow(doc, cols, y, isHeader = false, shade = false) {
  if (shade) {
    doc.save().rect(50, y - 4, 495, 18).fillColor('#F8F9FB').fill().restore();
  }
  const font   = isHeader ? 'Helvetica-Bold' : 'Helvetica';
  const colour = isHeader ? '#374151'        : '#1A1A2E';
  doc.font(font).fontSize(9).fillColor(colour);
  let x = 50;
  cols.forEach(({ text, width, align = 'left' }) => {
    doc.text(text, x + 4, y, { width: width - 8, align });
    x += width;
  });
}

const exportReport = async (req, res, next) => {
  try {
    const numMonths = Math.min(Math.max(parseInt(req.query.months) || 6, 1), 24);
    const userId    = req.user.id;
    const supabase  = req.supabase;

    const since = getMonthsAgo(numMonths);

    // ── Fetch all data concurrently ──
    const [profileRes, billsRes, savingsRes, txnsRes] = await Promise.allSettled([
      supabase.from('users').select('*').eq('id', userId).single(),
      supabase
        .from('bills')
        .select('*, supplier:suppliers(name, category)')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('current_amount', { ascending: false }),
      supabase
        .from('savings_opportunities')
        .select('*, bill:bills(category, supplier:suppliers(name))')
        .eq('user_id', userId)
        .neq('status', 'dismissed')
        .order('annual_saving', { ascending: false }),
      supabase
        .from('transactions')
        .select('date, amount, is_bill, bill_category')
        .eq('user_id', userId)
        .gte('date', since)
        .order('date', { ascending: true }),
    ]);

    const profile = profileRes.status === 'fulfilled' ? profileRes.value.data  : null;
    const bills   = billsRes.status   === 'fulfilled' ? billsRes.value.data   ?? [] : [];
    const savings = savingsRes.status === 'fulfilled' ? savingsRes.value.data ?? [] : [];
    const txns    = txnsRes.status    === 'fulfilled' ? txnsRes.value.data    ?? [] : [];

    // ── Build monthly summary ──
    const monthlyMap = {};
    for (const txn of txns) {
      const key = txn.date.slice(0, 7);
      if (!monthlyMap[key]) monthlyMap[key] = { total: 0, bills: 0 };
      const abs = Math.abs(txn.amount ?? 0);
      if ((txn.amount ?? 0) < 0) {
        monthlyMap[key].total += abs;
        if (txn.is_bill) monthlyMap[key].bills += abs;
      }
    }
    const monthlyRows = Object.entries(monthlyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, d]) => ({
        label:      new Date(key + '-01').toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
        total:      d.total,
        billSpend:  d.bills,
        otherSpend: d.total - d.bills,
      }));

    const totalBillSpend = bills.reduce((s, b) => s + (b.current_amount ?? 0), 0);
    const totalSavingsFd = savings.reduce((s, o) => s + (o.annual_saving ?? 0), 0);
    const totalSpend     = monthlyRows.reduce((s, m) => s + m.total, 0);
    const businessName   = profile?.business_name || 'Your Business';
    const now            = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const sinceLabel     = new Date(since).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

    // ── Build PDF ──
    const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="vpayit-report-${new Date().toISOString().slice(0, 10)}.pdf"`,
    );
    doc.pipe(res);

    // ── Cover / header ──
    doc.rect(0, 0, 595, 90).fillColor('#1E3A5F').fill();
    doc.font('Helvetica-Bold').fontSize(28).fillColor('#FFFFFF').text('Vpayit', 50, 24);
    doc.font('Helvetica').fontSize(11).fillColor('rgba(255,255,255,0.7)').text('Business Bill Report', 50, 56);
    doc.font('Helvetica').fontSize(9).fillColor('rgba(255,255,255,0.55)')
       .text(`${businessName}  ·  ${sinceLabel} – ${now}`, 0, 70, { align: 'right' });

    let y = 115;

    // ── Summary cards row ──
    doc.font('Helvetica-Bold').fontSize(13).fillColor('#0F172A').text('Summary', 50, y);
    y += 24;

    const cards = [
      { label: 'Total spend',         value: fmtGBP(totalSpend),     col: '#2563EB' },
      { label: 'Bill spend',           value: fmtGBP(totalBillSpend), col: '#059669' },
      { label: 'Potential savings/yr', value: fmtGBP(totalSavingsFd), col: '#D97706' },
    ];
    const cW = 155, cH = 60, cGap = 10;
    cards.forEach((c, i) => {
      const cx = 50 + i * (cW + cGap);
      doc.save()
         .roundedRect(cx, y, cW, cH, 6)
         .fillColor('#F8F9FB').fill()
         .roundedRect(cx, y, cW, cH, 6).strokeColor('#E8ECF1').lineWidth(1).stroke()
         .restore();
      doc.font('Helvetica').fontSize(8).fillColor('#6B7280').text(c.label, cx + 10, y + 10, { width: cW - 20 });
      doc.font('Helvetica-Bold').fontSize(18).fillColor(c.col).text(c.value, cx + 10, y + 24, { width: cW - 20 });
    });
    y += cH + 28;

    drawHRule(doc, y);
    y += 16;

    // ── Active bills table ──
    doc.font('Helvetica-Bold').fontSize(13).fillColor('#0F172A').text('Active Bills', 50, y);
    y += 20;

    const billCols = [
      { text: 'Supplier / Category', width: 180 },
      { text: 'Category',             width: 100 },
      { text: 'Monthly',              width: 80,  align: 'right' },
      { text: 'Change',               width: 80,  align: 'right' },
      { text: 'Frequency',            width: 80 },
    ];
    drawTableRow(doc, billCols, y, true, false);
    drawHRule(doc, y + 14, '#D1D5DB');
    y += 20;

    if (bills.length === 0) {
      doc.font('Helvetica').fontSize(9).fillColor('#9CA3AF').text('No active bills found.', 54, y);
      y += 18;
    } else {
      bills.forEach((b, i) => {
        if (y > 720) { doc.addPage(); y = 50; }
        const name     = b.supplier?.name || b.category || 'Unknown';
        const category = b.category ? b.category.charAt(0).toUpperCase() + b.category.slice(1) : '—';
        const pct      = b.previous_amount && b.previous_amount > 0
          ? ((b.current_amount - b.previous_amount) / b.previous_amount) * 100
          : null;
        const changeStr = pct !== null ? fmtPct(pct) : '—';
        const changeCol = pct === null ? '#6B7280' : pct > 0 ? '#DC2626' : '#059669';

        drawTableRow(doc, [
          { text: name,                     width: 180 },
          { text: category,                 width: 100 },
          { text: fmtGBP(b.current_amount), width: 80, align: 'right' },
          { text: changeStr,                width: 80, align: 'right' },
          { text: b.frequency || '—',       width: 80 },
        ], y, false, i % 2 === 1);

        // Colour the change column
        if (pct !== null) {
          doc.font('Helvetica').fontSize(9).fillColor(changeCol)
             .text(changeStr, 410 + 4, y, { width: 72, align: 'right' });
        }
        y += 18;
      });
    }

    y += 10;
    drawHRule(doc, y);
    y += 16;

    // ── Monthly spending table ──
    if (y > 650) { doc.addPage(); y = 50; }
    doc.font('Helvetica-Bold').fontSize(13).fillColor('#0F172A').text('Monthly Spending', 50, y);
    y += 20;

    const mCols = [
      { text: 'Month',      width: 120 },
      { text: 'Bill spend', width: 130, align: 'right' },
      { text: 'Other spend',width: 130, align: 'right' },
      { text: 'Total',      width: 115, align: 'right' },
    ];
    drawTableRow(doc, mCols, y, true);
    drawHRule(doc, y + 14, '#D1D5DB');
    y += 20;

    if (monthlyRows.length === 0) {
      doc.font('Helvetica').fontSize(9).fillColor('#9CA3AF').text('No transaction data found.', 54, y);
      y += 18;
    } else {
      monthlyRows.forEach((m, i) => {
        if (y > 720) { doc.addPage(); y = 50; }
        drawTableRow(doc, [
          { text: m.label,              width: 120 },
          { text: fmtGBP(m.billSpend),  width: 130, align: 'right' },
          { text: fmtGBP(m.otherSpend), width: 130, align: 'right' },
          { text: fmtGBP(m.total),      width: 115, align: 'right' },
        ], y, false, i % 2 === 1);
        y += 18;
      });
    }

    y += 10;
    drawHRule(doc, y);
    y += 16;

    // ── Savings opportunities table ──
    if (savings.length > 0) {
      if (y > 650) { doc.addPage(); y = 50; }
      doc.font('Helvetica-Bold').fontSize(13).fillColor('#0F172A').text('Savings Opportunities', 50, y);
      y += 20;

      const sCols = [
        { text: 'Current bill',          width: 160 },
        { text: 'Alternative supplier',  width: 160 },
        { text: 'Alt. monthly cost',     width: 105, align: 'right' },
        { text: 'Annual saving',         width: 110, align: 'right' },
      ];
      drawTableRow(doc, sCols, y, true);
      drawHRule(doc, y + 14, '#D1D5DB');
      y += 20;

      savings.forEach((s, i) => {
        if (y > 720) { doc.addPage(); y = 50; }
        const billName = s.bill?.supplier?.name || s.bill?.category || '—';
        drawTableRow(doc, [
          { text: billName,                         width: 160 },
          { text: s.alternative_supplier || '—',   width: 160 },
          { text: fmtGBP(s.alternative_cost),      width: 105, align: 'right' },
          { text: fmtGBP(s.annual_saving),         width: 110, align: 'right' },
        ], y, false, i % 2 === 1);

        doc.font('Helvetica').fontSize(9).fillColor('#059669')
           .text(fmtGBP(s.annual_saving), 430 + 4, y, { width: 106, align: 'right' });
        y += 18;
      });
    }

    // ── Footer on each page ──
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      drawHRule(doc, 800);
      doc.font('Helvetica').fontSize(8).fillColor('#9CA3AF')
         .text(
           `Vpayit  ·  Generated ${now}  ·  Page ${i + 1} of ${range.count}`,
           50, 808, { align: 'center', width: 495 },
         );
    }

    doc.end();
  } catch (err) {
    next(err);
  }
};

module.exports = { exportReport };
