'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Save, RefreshCw, Download, Share2, Users } from 'lucide-react';
import Editor, { OnMount } from '@monaco-editor/react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';
// @ts-ignore
import { parse, HtmlGenerator } from 'latex.js';
// @ts-ignore
import { createReportAction, getReportAction, shareReportAction } from '@/app/actions/report-access-actions';

interface LatexEditorProps {
  initialLatex: string;
  onClose: () => void;
  filename?: string;
  jobId?: string; // Optional: used to create initial doc
}

export default function LatexEditor({ initialLatex, onClose, filename = 'report.tex', jobId }: LatexEditorProps) {
  const [latex, setLatex] = useState(initialLatex);
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Collaboration State
  const [reportId, setReportId] = useState<string | null>(null);
  const [status, setStatus] = useState<'local' | 'syncing' | 'connected'>('local');
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareRole, setShareRole] = useState<'view'|'edit'>('view');

  const editorRef = useRef<any>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);
  const docRef = useRef<Y.Doc | null>(null);

  // Initialize: Create or Fetch Report ID
  useEffect(() => {
    // For this demo/v1, we create a new report doc every time "Edit" is clicked 
    // IF we don't have one passed in (future work: pass reportId prop).
    // But to simulate persistence, let's just create one for now or assume efficient upsert.
    
    // Actually, normally we'd check if a report exists for this job. 
    // For simplicity in this task: We start in 'local' mode.
    // User can click "Save/Connect" to go collaborative? 
    // OR we just auto-create. Let's auto-create to map to "Google Docs" feel.
    
    const initDoc = async () => {
       try {
         // Create a persistent record immediately
         const res = await createReportAction(filename, initialLatex);
         if (res.success && res.reportId) {
            setReportId(res.reportId);
         }
       } catch (e) {
         console.error('Failed to init report', e);
       }
    };
    initDoc();
  }, [filename, initialLatex]);

  // Setup Yjs when reportId is available
  useEffect(() => {
    if (!reportId || !editorRef.current) return;

    // 1. Create Yjs Doc
    const doc = new Y.Doc();
    docRef.current = doc;

    // 2. Connect to Websocket (Public Demo Server for this task, would use custom in prod)
    // Room name must be unique.
    // Room name must be unique.
    const roomName = `nhalo-report-${reportId}`;
    const provider = new WebsocketProvider('wss://demos.yjs.dev', roomName, doc);
    providerRef.current = provider;

    provider.on('status', (event: any) => {
      setStatus(event.status); // 'connected' or 'disconnected'
    });
    
    // Silently handle sync errors for demo
    provider.on('sync', (isSynced: boolean) => {
       if (isSynced) setStatus('connected');
    });
    
    provider.on('connection-error', () => {
       console.warn('Yjs WebSocket connection failed (using offline mode)');
       setStatus('local');
    });

    // 3. Bind to Monaco
    const type = doc.getText('monaco');
    const binding = new MonacoBinding(type, editorRef.current.getModel(), new Set([editorRef.current]), provider.awareness);

    // Initial value if empty
    if (doc.getText('monaco').toString() === '') {
       doc.getText('monaco').insert(0, initialLatex);
    }

    // Update local state for preview
    type.observe(() => {
       setLatex(type.toString());
    });
    
    // Set user awareness (random color for now)
    const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
    provider.awareness.setLocalStateField('user', {
      name: 'User ' + Math.floor(Math.random() * 100),
      color: randomColor
    });

    return () => {
      provider.disconnect();
      doc.destroy();
    };
  }, [reportId]); // Re-run if reportId changes (should only happen once)

  // Compile Preview (Debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      compileLatex();
    }, 800);
    return () => clearTimeout(timer);
  }, [latex]);

  const compileLatex = () => {
    try {
      setError(null);
      
      // Robust Preview Generation
      // 1. Strip all packages to prevent 'module not found' errors
      let cleanLatex = latex
        .replace(/\\usepackage\[.*?\]\{.*?\}/g, '')
        .replace(/\\usepackage\{.*?\}/g, '')
        .replace(/\\geometry\{[^}]+\}/g, '')
        .replace(/\\hypersetup\{[^}]+\}/g, '');

      // 2. Extract Body Content (Strip-and-Wrap Strategy)
      // This is the most robust way: We simply remove the wrapper tags and re-wrap.
      
      // 2. Extract Body Content (Strip-and-Wrap Strategy)
      // Regex-based split for robustness against whitespace
      // 2. Extract Body Content (Strip-and-Wrap Strategy)
      // Regex-based split for robustness against whitespace
      let bodyContent = cleanLatex;
      let isFullDocument = false; // Track if we found the structure
      
      const beginRegex = /\\begin\s*\{document\}/;
      const beginMatch = cleanLatex.match(beginRegex);
      
      if (beginMatch && beginMatch.index !== undefined) {
          // Found \begin{document} - Start from end of tag
          bodyContent = cleanLatex.substring(beginMatch.index + beginMatch[0].length);
          isFullDocument = true;
          
          // Also look for end tag to slice cleanly
          const endRegex = /\\end\s*\{document\}/;
          const endMatch = bodyContent.match(endRegex);
          if (endMatch && endMatch.index !== undefined) {
             bodyContent = bodyContent.substring(0, endMatch.index);
          }
      } 
      // If NOT found, we assume it's either a snippet (no preamble) OR a complex doc we failed to parse.
      // However, if it HAS \documentclass, we must treat it as RAW to avoid "Two \documentclass" error.
      else if (cleanLatex.includes('\\documentclass')) {
          isFullDocument = false; // It IS a full doc, but we failed to split it, so treat as raw to preserve structure
      }

      // Step C: Sanitize remaining preamble junk (Only needed if we are effectively extracting body)
      // If we are keeping the doc raw, we shouldn't aggressively strip things that might damage structure,
      // BUT we still need to kill known bad packages.
      // Ideally, the initial `cleanLatex` pass handled packages. 
      // Here we strip formatting commands that cause render issues.
      const sanitizedContent = bodyContent
        .replace(/\\titleformat[\s\S]*?\n\n/g, '')
        .replace(/\\pagestyle\{[^}]+\}/g, '')
        .replace(/\\fancyhf\{\}/g, '')
        .replace(/\\[rl](head|foot)\{.*?\}/g, '')
        .replace(/\\setlength\{.*?\}/g, '')
        .replace(/\\definecolor\{[^}]+\}\{[^}]+\}\{[^}]+\}/g, '');

      // 3. Construct Final Preview
      let finalPreview = '';
      
      if (isFullDocument) {
          // Case A: We successfully extracted body. Wrap it in safe shell.
          finalPreview = `
\\documentclass{article}
\\newcommand{\\href}[2]{#2} 
\\newcommand{\\url}[1]{#1}
\\begin{document}
${sanitizedContent}
\\end{document}`;
      } else if (cleanLatex.includes('\\documentclass')) {
          // Case B: It is a full doc, but we failed to split it OR chose to keep it raw.
          // Inject polyfills after documentclass
          finalPreview = cleanLatex.replace(
              /(\\documentclass.*?})/s, 
              '$1\n\\newcommand{\\href}[2]{#2}\n\\newcommand{\\url}[1]{#1}'
          );
      } else {
          // Case C: Snippet (No documentclass, no begin match). Wrap it.
          finalPreview = `
\\documentclass{article}
\\newcommand{\\href}[2]{#2} 
\\newcommand{\\url}[1]{#1}
\\begin{document}
${sanitizedContent}
\\end{document}`;
      }
      console.log('--- Latex Preview Debug ---');
      console.log('Mode:', isFullDocument ? 'Wrapped Body' : 'Raw/Other');
      console.log('Final Preview Preview (first 100 chars):', finalPreview.substring(0, 100).replace(/\n/g, '\\n'));

      let doc;
      try {
        console.log('Attempting Main Parse...');
        // Use a fresh generator for the main parse to avoid any previous state
        const mainGenerator = new HtmlGenerator({ hyphenate: false });
        doc = parse(finalPreview, { generator: mainGenerator }).htmlDocument();
      } catch (e1) {
        console.warn('Main Parse Failed, attempting Fallback Fragment:', e1);
        try {
           // Fallback: Just try parsing the sanitized body content as a fragment
           // KEY FIX 1: Strip structure AND metadata (title, date) which causes "Invalid URL" or macro errors in fragment mode
           let rawBody = sanitizedContent
              .replace(/\\documentclass[\s\S]*?\{.*?\}/, '')
              .replace(/\\begin\s*\{document\}/, '')
              .replace(/\\end\s*\{document\}/, '')
              .replace(/\\maketitle/g, '')
              .replace(/\\title\{.*?\}/g, '')
              .replace(/\\date\{.*?\}/g, '')
              .replace(/\\author\{.*?\}/g, '');

           // KEY FIX 2: Polyfill \href and \url via Regex replacement 
           // because \newcommand is often rejected or causes issues in fragment mode
           // \href{url}{text} -> text
           // \url{url} -> url
           rawBody = rawBody
              .replace(/\\href\{[^}]+\}\{(.+?)\}/g, '$1')
              .replace(/\\url\{(.*?)\}/g, '$1')
              // Strip environments
              .replace(/\\begin\{abstract\}/g, '\\textbf{Abstract}\n\n')
              .replace(/\\end\{abstract\}/g, '\n\n')
              .replace(/\\begin\{quote\}/g, '')
              .replace(/\\end\{quote\}/g, '')
              .replace(/\\begin\{table\}(\[.*?\])?/g, '')
              .replace(/\\end\{table\}/g, '')
              .replace(/\\centering/g, '')
              .replace(/\\begin\{tabular\}\{.*?\}/g, '')
              .replace(/\\end\{tabular\}/g, '')
              .replace(/\\hline/g, '')
              // Replace separators (naive, but works for preview)
              .replace(/&/g, ' | ')
              .replace(/\\\\/g, '\n\n');

           const fragmentPreview = rawBody.trim();

           console.log('Fallback Mode: Parsing raw content without wrappers or macros.');
           
           // KEY FIX 3: Use a FRESH generator instance. 
           // Reusing the same generator after a failed parse causes "Two \documentclass" errors due to retained state.
           const fallbackGenerator = new HtmlGenerator({ hyphenate: false });
           doc = parse(fragmentPreview, { generator: fallbackGenerator }).htmlDocument();
        } catch (e2) {
           console.error('Fragment Parse Failed:', e2);
           throw e2; 
        }
      }
      
      const styles = `
        <style>
          body { font-family: "Times New Roman", Times, serif; padding: 40px; line-height: 1.6; max-width: 800px; margin: 0 auto; background: white; color: black; }
          h1, h2, h3 { color: #004b78; margin-top: 1.5em; }
          a { color: #004b78; text-decoration: none; }
          .latex-js-logo { display: none; }
          li { margin-bottom: 0.5em; }
          table { border-collapse: collapse; width: 100%; margin: 1em 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      `;
      setHtmlContent(styles + doc.body.innerHTML);
    } catch (e: any) {
      console.error('LaTeX Compile Error:', e);
      setError(e.message || 'Syntax Error in LaTeX');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([latex], { type: 'application/x-tex' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (!reportId) return;
    try {
      await shareReportAction(reportId, shareEmail, shareRole);
      alert(`Shared with ${shareEmail}`);
      setShowShareModal(false);
      setShareEmail('');
    } catch (e: any) {
      alert('Share failed: ' + e.message);
    }
  };

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-[95vw] h-[90vh] bg-[#1e1e1e] rounded-xl border border-white/10 shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <div className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-white/5 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-white font-semibold flex items-center gap-2">
               Latex Editor 
               {status === 'connected' && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" title="Connected"></span>}
            </h2>
            <span className="text-xs text-gray-500 font-mono px-2 py-1 bg-black/30 rounded flex items-center gap-1">
               {filename} 
               {reportId && <span className="text-green-800"> (Cloud)</span>}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            
            <button 
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded hover:bg-blue-600/30 transition-colors text-sm font-medium mr-2"
            >
              <Share2 size={14} /> Share
            </button>

            <button 
              onClick={compileLatex}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="Force Refresh"
            >
              <RefreshCw size={16} />
            </button>
            <button 
              onClick={handleDownload}
              className="flex items-center gap-2 px-3 py-1.5 bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 rounded hover:bg-cyan-600/30 transition-colors text-sm font-medium"
            >
              <Download size={14} /> Download .tex
            </button>
            <div className="w-px h-6 bg-white/10 mx-2" />
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-red-400 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Editor Pane (Monaco) */}
          <div className="w-1/2 h-full flex flex-col border-r border-white/10 bg-[#1e1e1e]">
             <Editor
               height="100%"
               defaultLanguage="latex" // 'latex' might need plugin, 'markdown' is fallback
               defaultValue={initialLatex}
               theme="vs-dark"
               onMount={handleEditorDidMount}
               options={{
                 minimap: { enabled: false },
                 fontSize: 14,
                 wordWrap: 'on',
                 padding: { top: 20 }
               }}
             />
             
            {error && (
              <div className="h-auto max-h-32 bg-red-900/20 border-t border-red-500/30 p-4 overflow-y-auto shrink-0 z-10">
                <p className="text-red-400 text-xs font-mono">Error: {error}</p>
              </div>
            )}
          </div>

          {/* Preview Pane */}
          <div className="w-1/2 h-full bg-white relative">
             <div className="absolute inset-0 overflow-hidden">
               <iframe 
                 ref={iframeRef}
                 srcDoc={htmlContent}
                 className="w-full h-full border-none"
                 sandbox="allow-same-origin" 
               />
             </div>
          </div>
        </div>
        
        {/* Share Modal Overlay */}
        {showShareModal && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
             <div className="w-96 bg-[#252525] border border-white/10 rounded-xl p-6 shadow-2xl">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                   <Users size={18} /> Share Report
                </h3>
                <div className="space-y-4">
                   <div>
                     <label className="text-xs text-gray-400 mb-1 block">Friend's Email</label>
                     <input 
                        type="email" 
                        value={shareEmail} 
                        onChange={e => setShareEmail(e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded p-2 text-white text-sm focus:border-blue-500 outline-none" 
                        placeholder="colleague@example.com"
                     />
                   </div>
                   <div>
                     <label className="text-xs text-gray-400 mb-1 block">Permission</label>
                     <select 
                        value={shareRole} 
                        onChange={e => setShareRole(e.target.value as any)}
                        className="w-full bg-black/30 border border-white/10 rounded p-2 text-white text-sm focus:border-blue-500 outline-none"
                     >
                       <option value="view">Can View</option>
                       <option value="edit">Can Edit</option>
                     </select>
                   </div>
                   <button 
                     onClick={handleShare}
                     disabled={!shareEmail}
                     className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium text-sm transition-colors disabled:opacity-50"
                   >
                     Send Invitation
                   </button>
                   <button 
                     onClick={() => setShowShareModal(false)}
                     className="w-full py-2 bg-transparent hover:bg-white/5 text-gray-400 rounded font-medium text-sm transition-colors"
                   >
                     Cancel
                   </button>
                </div>
             </div>
          </div>
        )}

      </div>
    </div>
  );
}

