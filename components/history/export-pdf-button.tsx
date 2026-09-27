'use client'

import { Printer, Download, Sparkles } from 'lucide-react'

export function ExportPDFButton({ title }: { title: string }) {
  const handlePrint = () => {
    window.print()
  }

  return (
    <>
      <button
        onClick={handlePrint}
        className="no-print inline-flex items-center gap-2 bg-[#14142b] hover:bg-[#1e1b4b] text-[#818cf8] hover:text-white border border-[#3730a3] hover:border-[#6366f1] font-mono text-xs font-semibold uppercase tracking-wider px-3.5 py-2 rounded-lg transition-all shadow-[0_0_15px_rgba(79,70,229,0.15)] cursor-pointer shrink-0"
        title="Print or Save as PDF"
      >
        <Download className="h-4 w-4" />
        <span>Export PDF Scorecard</span>
      </button>

      {/* Embedded Print Stylesheet for High-Fidelity PDF Output */}
      <style jsx global>{`
        @media print {
          /* Hide app chrome, sidebar, navbars, and interactive buttons */
          nav,
          aside,
          header,
          .no-print,
          button:not(.print-include) {
            display: none !important;
          }

          /* Force black background & white text for crisp PDF export */
          body,
          html,
          main,
          div {
            background-color: #ffffff !important;
            color: #0f172a !important;
            box-shadow: none !important;
          }

          /* Printable card styling */
          .border,
          .border-b,
          .border-t {
            border-color: #cbd5e1 !important;
          }

          /* Text color overrides for print */
          h1, h2, h3, h4, p, span {
            color: #0f172a !important;
          }

          .text-[#818cf8],
          .text-[#6366f1],
          .text-white {
            color: #312e81 !important;
          }

          .text-[#9ca3af],
          .text-[#64748b] {
            color: #475569 !important;
          }

          /* Question blocks page break control */
          .print-block {
            break-inside: avoid;
            page-break-inside: avoid;
            margin-bottom: 1.5rem !important;
            border: 1px solid #cbd5e1 !important;
            border-radius: 8px !important;
            padding: 1rem !important;
          }

          @page {
            margin: 1.5cm;
            size: A4 portrait;
          }
        }
      `}</style>
    </>
  )
}
