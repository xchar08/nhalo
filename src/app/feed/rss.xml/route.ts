// app/feed/rss.xml/route.ts
//
// This rss feed is for the global knowledge base
// for easy parsing of other applications

import { NextResponse } from 'next/server';
import { aggregateFeeds } from '@/lib/feed/rss-aggregator';

// This makes the feed rebuild at most every 10 minutes (great for Vercel)
export const revalidate = 600;

export async function GET() {
  try {
    console.log('[Feed] Aggregating global knowledge feed...');
    const feedItems = await aggregateFeeds();

    // Sort newest first + dedupe by link
    const seen = new Set<string>();
    const uniqueItems = feedItems.filter((item) => {
      if (!item.link || seen.has(item.link)) return false;
      seen.add(item.link);
      return true;
    });

    const siteUrl = process.env.NEXT_PUBLIC_APP_URL;

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Global Knowledge Feed — High-Signal Science & Tech</title>
    <link>${siteUrl}</link>
    <description>Curated mix of cutting-edge research and tech news from Nature, arXiv, MIT Tech Review, Hacker News, and more. Updated every ~10 minutes.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/feed/rss.xml" rel="self" type="application/rss+xml" />
    <generator>Next.js + rss-parser</generator>

    ${uniqueItems
        .slice(0, 50)
        .map(
          (item) => `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <link>${item.link}</link>
      <guid isPermaLink="false">${item.link}</guid>
      <pubDate>${new Date(item.isoDate || item.pubDate).toUTCString()}</pubDate>
      <description><![CDATA[
        <p>${item.contentSnippet}</p>
        <hr style="border:0;border-top:1px solid #444;margin:12px 0;" />
        <small>
          Source: <a href="${item.link}">${item.source}</a> • 
          ${new Date(item.isoDate || item.pubDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </small>
      ]]></description>
    </item>`
        )
        .join('')}
  </channel>
</rss>`;

    return new NextResponse(rss.trim(), {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 's-maxage=600, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('RSS feed generation failed:', error);
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Error</title>
    <description>Feed temporarily unavailable</description>
  </channel>
</rss>`,
      {
        status: 500,
        headers: { 'Content-Type': 'application/rss+xml' },
      }
    );
  }
}

// Optional: force static generation at build + ISR
export const dynamic = 'force-static';
