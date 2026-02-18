
const { parse, HtmlGenerator } = require('latex.js');

// Mock content simulating a Scientific Report with Abstract and Tables
const rawLatex = `
\\documentclass[11pt,a4paper]{article}

\\begin{abstract}
This is the abstract.
\\end{abstract}

\\section{Introduction}

\\begin{table}[h]
\\centering
\\begin{tabular}{|l|c|r|}
\\hline
Metric & Target & Actual \\\\
\\hline
Latency & <100ms & 50ms \\\\
\\hline
\\end{tabular}
\\end{table}

\\end{document}
`;

// logic from LatexEditor.tsx (approx)
let rawBody = rawLatex
    .replace(/\\documentclass[\s\S]*?\{.*?\}/, '')
    .replace(/\\begin\s*\{document\}/, '')
    .replace(/\\end\s*\{document\}/, '')
    .replace(/\\maketitle/g, '')
    .replace(/\\title\{.*?\}/g, '')
    .replace(/\\date\{.*?\}/g, '')
    .replace(/\\author\{.*?\}/g, '');

// The "Strip Environments" logic as currently applied
rawBody = rawBody
    .replace(/\\href\{[^}]+\}\{(.+?)\}/g, '$1')
    .replace(/\\url\{(.*?)\}/g, '$1')
    .replace(/\\begin\{abstract\}/g, '\\textbf{Abstract}\n\n')
    .replace(/\\end\{abstract\}/g, '\n\n')
    // Strip environments
    .replace(/\\begin\{table\}(\[.*?\])?/g, '')
    .replace(/\\end\{table\}/g, '')
    .replace(/\\centering/g, '')
    .replace(/\\begin\{tabular\}\{.*?\}/g, '')
    .replace(/\\end\{tabular\}/g, '')
    .replace(/\\hline/g, '')
    // Replace separators
    .replace(/&/g, ' | ')
    .replace(/\\\\/g, '\n\n');

const fragmentPreview = rawBody.trim();

console.log('--- PROCESSED PREVIEW CONTENT ---');
console.log(fragmentPreview);
console.log('--------------------------------');

try {
    const generator = new HtmlGenerator({ hyphenate: false });
    const doc = parse(fragmentPreview, { generator: generator }).htmlDocument();
    console.log('Parse SUCCESS');
} catch (e) {
    console.log('Parse FAILED');
    console.log(e.message);
}
