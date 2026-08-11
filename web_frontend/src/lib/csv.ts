function detectDelimiter(text: string): ',' | ';' {
  let quoted = false;
  let commas = 0;
  let semicolons = 0;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === '"') {
      if (quoted && text[i + 1] === '"') { i += 1; continue; }
      quoted = !quoted;
      continue;
    }
    if (!quoted && (char === '\n' || char === '\r')) break;
    if (!quoted && char === ',') commas += 1;
    if (!quoted && char === ';') semicolons += 1;
  }
  return semicolons > commas ? ';' : ',';
}

export function parseCsv(input: string): Array<Record<string, string>> {
  const text = input.replace(/^\uFEFF/, '');
  const delimiter = detectDelimiter(text);
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;

  const pushField = () => { row.push(field.trim()); field = ''; };
  const pushRow = () => {
    pushField();
    if (row.some((value) => value.length > 0)) rows.push(row);
    row = [];
  };

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') { field += '"'; i += 1; }
      else if (char === '"') quoted = false;
      else field += char;
      continue;
    }

    if (char === '"') quoted = true;
    else if (char === delimiter) pushField();
    else if (char === '\n') pushRow();
    else if (char !== '\r') field += char;
  }
  if (field.length || row.length) pushRow();
  if (quoted) throw new Error('CSV possui aspas não fechadas.');
  if (rows.length < 2) throw new Error('CSV deve possuir cabeçalho e ao menos um registro.');

  const headers = rows[0].map((header) => header.trim());
  if (headers.some((header) => !header)) throw new Error('CSV possui coluna sem nome.');
  if (new Set(headers.map((header) => header.toLowerCase())).size !== headers.length) {
    throw new Error('CSV possui cabeçalhos duplicados.');
  }

  return rows.slice(1).map((values, index) => {
    if (values.length > headers.length) throw new Error(`Linha ${index + 2} possui colunas extras.`);
    return Object.fromEntries(headers.map((header, column) => [header, values[column] ?? '']));
  });
}
