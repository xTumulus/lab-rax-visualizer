import * as XLSX from 'xlsx'
import type { BuildState } from '../domain/types'
import { buildPartsList } from '../domain/parts-list'

/**
 * Export the parts list as an .xlsx workbook.
 *
 * Note: the SheetJS community build cannot embed true interactive form-control
 * checkboxes, so the "Done" column uses a ☐ glyph you can tick manually (or
 * replace in your spreadsheet app). Switch to `exceljs` later if real
 * checkbox controls are required.
 */
export function exportXlsx(state: BuildState): void {
  const rows = buildPartsList(state)

  const aoa: (string | number)[][] = [
    ['Done', 'Part', 'Color', 'Pattern', 'Solid/Backplate', 'Qty'],
    ...rows.map((r) => ['☐', r.part, r.color, r.pattern, r.solid, r.quantity]),
  ]

  const ws = XLSX.utils.aoa_to_sheet(aoa)
  ws['!cols'] = [
    { wch: 6 },
    { wch: 22 },
    { wch: 12 },
    { wch: 14 },
    { wch: 16 },
    { wch: 6 },
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, `Lab Rax ${state.rackU}U`)
  XLSX.writeFile(wb, `lab-rax-${state.rackU}U-parts.xlsx`)
}
