import { searchWeb, deepCrawl } from './src/lib/crawlers/free-crawler';

async function test() {
    console.log('Testing searchWeb("javascript frameworks")...');
    const results = await searchWeb('javascript frameworks');
    console.log('Search Results:', results.length);
    if (results.length > 0) {
        console.log('First Result:', results[0]);
    } else {
        console.log('No search results found.');
    }

    console.log('\nTesting deepCrawl("https://example.com")...');
    try {
        const crawl = await deepCrawl('https://example.com', 0, 1, 1);
        console.log('Crawl Results:', crawl.length);
        if (crawl.length > 0) {
            console.log('Title:', crawl[0].title);
            console.log('Markdown Length:', crawl[0].markdown.length);
        }
    } catch (e) {
        console.error('Crawl failed:', e);
    }
}

test();
