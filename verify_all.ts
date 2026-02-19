
import fs from 'fs';
import { markdownToLatex } from './src/lib/latex/md-to-latex';

console.log('🔍 VERIFYING FIXES...\n');

let allPassed = true;

// 1. Verify LaTeX Fix
console.log('1. Checking LaTeX Generation...');
const latex = markdownToLatex('Title', 'Body', [{ title: 'S1', url: 'u1' }]);
if (!latex.includes('\\arabic') && latex.includes('\\begin{enumerate}')) {
    console.log('✅ PASS: LaTeX uses standard enumeration (no \\arabic).');
} else {
    console.error('❌ FAIL: LaTeX still contains \\arabic or missing enumerate.');
    allPassed = false;
}

// 2. Verify Polling Interval
console.log('\n2. Checking Client Polling Interval...');
const clientHome = fs.readFileSync('./src/app/ClientHome.tsx', 'utf8');
if (clientHome.includes('setTimeout(r, 4000)')) {
    console.log('✅ PASS: Polling interval is set to 4000ms.');
} else {
    console.error('❌ FAIL: Polling interval not updated to 4000ms.');
    allPassed = false;
}

// 3. Verify Crawler Error Logging
console.log('\n3. Checking Serper Error Logging...');
const crawler = fs.readFileSync('./src/lib/crawlers/free-crawler.ts', 'utf8');
if (crawler.includes('🚨 SERPER') && crawler.includes('response.text()')) {
    console.log('✅ PASS: Serper error logging (Red Alert) is present.');
} else {
    console.error('❌ FAIL: Serper error log missing.');
    allPassed = false;
}

// 4. Verify Writer Fallback
console.log('\n4. Checking Writer Context Fallback...');
const writer = fs.readFileSync('./src/lib/ai/fast-summarizer.ts', 'utf8');
if (writer.includes('desc: \'Crunch\'') && writer.includes('attempt.ctxLen')) {
    console.log('✅ PASS: Context fallback logic (Standard -> Crunch) found.');
} else {
    console.error('❌ FAIL: Writer fallback logic missing.');
    allPassed = false;
}

console.log('\n-----------------------------------');
if (allPassed) {
    console.log('✨ ALL SYSTEMS GO. FIXES VERIFIED. ✨');
} else {
    console.error('⚠️ SOME CHECKS FAILED.');
    process.exit(1);
}
