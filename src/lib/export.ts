// Client-side data export utilities (CSV / JSON)

export function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function toCSV(rows: Record<string, any>[], columns?: string[]): string {
  if (rows.length === 0) return "";
  const cols = columns || Object.keys(rows[0]);
  const header = cols.join(",");
  const lines = rows.map((r) =>
    cols
      .map((c) => {
        const v = r[c];
        if (v === undefined || v === null) return "";
        const s = String(v);
        // escape quotes and wrap if contains comma/quote/newline
        if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
        return s;
      })
      .join(",")
  );
  return [header, ...lines].join("\n");
}

export function exportJSON(filename: string, data: any) {
  downloadFile(filename, JSON.stringify(data, null, 2), "application/json");
}

export function exportCSV(filename: string, rows: Record<string, any>[], columns?: string[]) {
  downloadFile(filename, toCSV(rows, columns), "text/csv;charset=utf-8");
}

export function timestamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
}
