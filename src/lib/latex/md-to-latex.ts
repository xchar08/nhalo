import { LATEX_PREAMBLE, LATEX_POSTAMBLE } from './latex-config';

function escapeLatex(text: string): string {
  return text
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/{/g, '\\{')
    .replace(/}/g, '\\}')
    .replace(/\$/g, '\\$')
    .replace(/&/g, '\\&')
    .replace(/#/g, '\\#')
    .replace(/\^/g, '\\textasciicircum{}')
    .replace(/_/g, '\\_')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/%/g, '\\%');
}

function processMarkdown(md: string): string {
  // This function is now just a wrapper around the robust processor
  return processLinesRobustly(md);
}

function processLinesRobustly(md: string): string {
  const lines = md.split('\n');
  const out: string[] = [];
  let inList = false;
  let inTable = false;
  let tableRows: string[][] = [];
  let tableAlignments: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // --- TABLE HANDLING ---
    if (trimmed.startsWith('|')) {
      if (inList) { out.push('\\end{itemize}'); inList = false; }
      
      // Parse row
      const row = trimmed.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      
      if (!inTable) {
        // This is potentially the header
        // Check next line for separator if possible, or just assume it is a table start
        // Markdown tables usually require a header and a separator.
        const nextLine = lines[i+1]?.trim();
        if (nextLine?.startsWith('|') && nextLine.includes('---')) {
            inTable = true;
            tableRows.push(row);
            // Process separator line immediately
            const separator = nextLine.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
            tableAlignments = separator.map(s => {
                if (s.startsWith(':') && s.endsWith(':')) return 'c';
                if (s.endsWith(':')) return 'r';
                return 'l';
            });
            i++; // Skip separator line
            continue;
        }
      } else {
        tableRows.push(row);
      }
      continue;
    } else if (inTable) {
      // Table ended
      out.push(renderLatexTable(tableRows, tableAlignments));
      inTable = false;
      tableRows = [];
      tableAlignments = [];
    }

    // --- HEADERS ---
    if (trimmed.startsWith('#')) {
      if (inList) { out.push('\\end{itemize}'); inList = false; }
      
      const level = trimmed.match(/^#+/)?.[0].length || 0;
      const text = trimmed.substring(level).trim();
      
      // Special Case: Abstract
      if (text.toLowerCase() === 'abstract') {
         out.push('\\begin{abstract}');
         out.push(`\\section*{${escapeLatex(text)}}`); 
      } else {
          const escapedText = formatInline(text);
          if (level === 1) out.push(`\\section*{${escapedText}}`);
          else if (level === 2) out.push(`\\subsection*{${escapedText}}`);
          else if (level >= 3) out.push(`\\subsubsection*{${escapedText}}`);
          else out.push(escapedText + '\\\\'); 
      }
      
    } else if (trimmed.startsWith('- ')) {
      if (!inList) { out.push('\\begin{itemize}'); inList = true; }
      out.push(`  \\item ${formatInline(trimmed.substring(2))}`);
      
    } else if (trimmed.length === 0) {
      if (inList) { out.push('\\end{itemize}'); inList = false; }
      out.push(''); // Blank line
      
    } else {
      if (inList) { out.push('\\end{itemize}'); inList = false; }
      // Regular paragraph text
      out.push(formatInline(trimmed) + '\n');
    }
  }
  
  if (inList) out.push('\\end{itemize}');
  if (inTable) out.push(renderLatexTable(tableRows, tableAlignments));
  
  return out.join('\n');
}

function renderLatexTable(rows: string[][], alignments: string[]): string {
    if (rows.length === 0) return '';
    
    // Default alignment if missing
    const alignStr = alignments.length > 0 ? `|${alignments.join('|')}|` : `|${rows[0].map(() => 'l').join('|')}|`;
    
    let latex = '\\begin{table}[h]\n\\centering\n';
    latex += `\\begin{tabular}{${alignStr}}\n\\hline\n`;
    
    // Header
    const header = rows[0];
    latex += header.map(c => `\\textbf{${formatInline(c)}}`).join(' & ') + ' \\\\\n\\hline\n';
    
    // Body
    for (let i = 1; i < rows.length; i++) {
        latex += rows[i].map(c => formatInline(c)).join(' & ') + ' \\\\\n\\hline\n';
    }
    
    latex += '\\end{tabular}\n\\end{table}\n';
    return latex;
}

function formatInline(text: string): string {
  // 1. Escape special chars - careful not to escape markdown symbols we need yet?
  // Actually, we must identify headers/links first if they mimic markdown. 
  // But we are inside a line that is NOT a header/list bullet.
  
  // We need to split properly.
  // A robust tokenizer is overkill. We'll use a simple token splitter for ** and [].
  
  // Quick hack: Replace markers with unique tokens, escape the rest, restore tokens & formatted.
  // But nested?
  
  // Let's do a simple recursive split or regex replace.
  // Challenge: "Text with **bold** and & ampersand" -> "Text with \textbf{bold} and \& ampersand"
  
  // Approach:
  // 1. Split by bold/italic/link regex.
  // 2. Map parts: if match, format; if string, escape.
  
  // Regex for bold, italic, link
  // Link: \[([^\]]+)\]\(([^)]+)\)
  // Bold: \*\*(.*?)\*\*
  // Italic: \*(.*?)\*
  
  // Order matters. Link first.
  
  let parts: {type: 'text'|'bold'|'italic'|'link', content: string, url?: string}[] = [{type: 'text', content: text}];
  
  // Helper to split parts
  const applyRule = (regex: RegExp, type: 'bold'|'italic'|'link') => {
    const newParts: typeof parts = [];
    for (const part of parts) {
      if (part.type === 'text') {
        let remaining = part.content;
        let lastIndex = 0;
        
        // Ensure regex is global
        const globalRegex = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g');
        let m;
        
        while ((m = globalRegex.exec(remaining)) !== null) {
          // Push text before match
          if (m.index > lastIndex) {
            newParts.push({type: 'text', content: remaining.substring(lastIndex, m.index)});
          }
          
          if (type === 'link') {
            newParts.push({type: 'link', content: m[1], url: m[2]});
          } else {
             newParts.push({type: type as any, content: m[1]});
          }
          
          lastIndex = globalRegex.lastIndex;
        }
        
        // Push remaining text
        if (lastIndex < remaining.length) {
          newParts.push({type: 'text', content: remaining.substring(lastIndex)});
        }
      } else {
        newParts.push(part);
      }
    }
    parts = newParts;
  };
  
  applyRule(/\[([^\]]+)\]\(([^)]+)\)/g, 'link');
  applyRule(/\*\*(.*?)\*\*/g, 'bold');
  applyRule(/(?<!\*)\*(?!\*)(.*?)\*/g, 'italic'); // Stronger italic regex to avoid matching inside bold if bold wasn't consummed, or use non-greedy carefully.

  
  return parts.map(p => {
    if (p.type === 'text') return escapeLatex(p.content);
    if (p.type === 'bold') return `\\textbf{${escapeLatex(p.content)}}`;
    if (p.type === 'italic') return `\\textit{${escapeLatex(p.content)}}`;
    if (p.type === 'link') return `\\href{${p.url}}{${escapeLatex(p.content)}}`;
    return '';
  }).join('');
}

export function markdownToLatex(title: string, markdownContent: string, sources: any[] = []): string {
  const body = processLinesRobustly(markdownContent);
  
  // Process sources into a bibliography section
  let sourcesSection = '';
  if (sources.length > 0) {
    sourcesSection = `
\\section*{Sources}
\\begin{enumerate}
${sources.map(s => `  \\item \\textbf{${escapeLatex(s.title || 'Source')}}: \\href{${s.url}}{${escapeLatex(s.url)}}`).join('\n')}
\\end{enumerate}
`;
  }

  return `
${LATEX_PREAMBLE}
\\title{${escapeLatex(title)}}
\\date{\\today}
\\maketitle

\\tableofcontents
\\newpage

${body}

${sourcesSection}

${LATEX_POSTAMBLE}
`;
}
