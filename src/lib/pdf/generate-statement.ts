/**
 * Client-side PDF statement generator using jsPDF.
 * Must only be called from a 'use client' component event handler — never during SSR.
 * jsPDF references browser globals (window/document) and cannot be imported at module level.
 */

import { format } from 'date-fns'
import type { Transaction } from '@/types'
import { formatCurrency, type CurrencyCode } from '@/lib/currency'

export async function generateStatement(
  transactions: Transaction[],
  dateFrom: string,
  dateTo: string
): Promise<void> {
  // Dynamic imports — prevents SSR bundle inclusion (jsPDF references window)
  const { jsPDF } = await import('jspdf')
  await import('jspdf-autotable') // side-effect: registers doc.autoTable plugin

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  // --- Header ---
  doc.setFontSize(14)
  doc.text('2C2P Wave - Transaction Statement', 14, 18)

  doc.setFontSize(9)
  doc.text(`Period: ${dateFrom} to ${dateTo}`, 14, 26)
  doc.text(`Generated: ${format(new Date(), 'dd MMM yyyy HH:mm')}`, 14, 31)

  // --- Transactions table ---
  ;(doc as any).autoTable({
    startY: 38,
    head: [['Date', 'Description', 'Type', 'Amount', 'Status']],
    body: transactions.map((tx) => [
      format(new Date(tx.created_at), 'dd MMM yyyy'),
      tx.description,
      tx.type.replace(/_/g, ' '),
      formatCurrency(tx.amount, tx.currency as CurrencyCode),
      tx.status,
    ]),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [255, 230, 0], textColor: [33, 33, 33] },
  })

  // --- Footer ---
  const finalY = (doc as any).lastAutoTable?.finalY ?? 38
  doc.setFontSize(8)
  doc.text(`Total transactions: ${transactions.length}`, 14, finalY + 8)

  // --- Save / trigger browser download ---
  doc.save(`statement-${dateFrom}-${dateTo}.pdf`)
}
