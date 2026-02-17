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
  let latex = md;

  // 1. Headers
  latex = latex.replace(/^# (.*$)/gm, (_, t) => `\\section*{${escapeLatex(t)}}`);
  latex = latex.replace(/^## (.*$)/gm, (_, t) => `\\subsection*{${escapeLatex(t)}}`);
  latex = latex.replace(/^### (.*$)/gm, (_, t) => `\\subsubsection*{${escapeLatex(t)}}`);
  
  // 2. Bold & Italic
  latex = latex.replace(/\*\*(.*?)\*\*/g, (_, t) => `\\textbf{${escapeLatex(t)}}`);
  latex = latex.replace(/\*(.*?)\*/g, (_, t) => `\\textit{${escapeLatex(t)}}`);

  // 3. Links
  // Note: We need to be careful not to escape the URL part too early or late.
  // We'll simplisticly handle standard [text](url)
  // We match [text](url) structure.
  latex = latex.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, url) => {
    return `\\href{${url}}{${escapeLatex(text)}}`; // URL usually shouldn't imply latex escaping, but specific chars might break it. 
    // Ideally user raw urls or minimal escaping for url.
  });

  // 4. Lists
  // Unordered lists
  // This is a naive implementation; for nested lists or complex structures, a proper parser is needed.
  // We'll wrap blocks of lines starting with - in itemize
  
  const lines = latex.split('\n');
  let inList = false;
  const processedLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('- ')) {
      if (!inList) {
        processedLines.push('\\begin{itemize}');
        inList = true;
      }
      processedLines.push(`  \\item ${escapeLatex(trimmed.substring(2))}`);
    } else {
      if (inList) {
        processedLines.push('\\end{itemize}');
        inList = false;
      }
      
      // If the line was already processed by header replacement (starts with \section etc), don't escape again completely
      // But we handled headers via regex on the full string BEFORE split. 
      // Wait, if we replace headers first, they look like "\section*{...}".
      // We shouldn't escape backslashes in commands we just inserted.
      
      // Better approach: Escape text chunks, THEN apply formatting.
      // But we can't easily identify chunks vs markup.
      
      // Let's refine the strategy:
      // We will perform formatting line-by-line or block-by-block.
      
      // For this simplified version, let's stick to the current flow but fix the escaping issue.
      // We should NOT have escaped everything in the replace checks above if we iterate lines here.
      
      // RESTARTING STRATEGY FOR ROBUSTNESS:
      // 1. Split lines.
      // 2. Process each line.
      // 3. Handle state (lists).
      
      processedLines.push(line); // Placeholder, see improved logic below
    }
  }
  if (inList) processedLines.push('\\end{itemize}');
  
  // Re-do with robust line processing
  return processLinesRobustly(md);
}

function processLinesRobustly(md: string): string {
  const lines = md.split('\n');
  const out: string[] = [];
  let inList = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('#')) {
      if (inList) { out.push('\\end{itemize}'); inList = false; }
      
      const level = trimmed.match(/^#+/)?.[0].length || 0;
      const text = trimmed.substring(level).trim();
      const escapedText = formatInline(text);
      
      if (level === 1) out.push(`\\section*{${escapedText}}`);
      else if (level === 2) out.push(`\\subsection*{${escapedText}}`);
      else if (level >= 3) out.push(`\\subsubsection*{${escapedText}}`);
      else out.push(escapedText + '\\\\'); // Fallback
      
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
  
  return out.join('\n');
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
  
  // Warning: This simplistic approach might fail on complex nested markdown. 
  // It is acceptable for a "cheatsheet" style report generator.
  
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
  // Actually, since we process bold first and consume it into 'bold' parts, standard italic regex shouldn't see the bold stars as text.
  // But we must be careful with *italic*.

  
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
\\begin{itemize}
${sources.map(s => `  \\item \\textbf{${escapeLatex(s.title || 'Source')}}: \\href{${s.url}}{${escapeLatex(s.url)}}`).join('\n')}
\\end{itemize}
`;
  }

  return `
${LATEX_PREAMBLE}
\\title{${escapeLatex(title)}}
\\date{\\today}
\\maketitle

${body}

${sourcesSection}

${LATEX_POSTAMBLE}
`;
}
