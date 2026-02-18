
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function test() {
    console.log('Fetching api.duckduckgo.com...');
    const query = 'javascript frameworks';
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`;
    
    try {
        const res = await fetch(url);
        console.log('Status:', res.status);
        const json = await res.json();
        console.log('Abstract:', json.AbstractText);
        console.log('AbstractURL:', json.AbstractURL);
        console.log('RelatedTopics:', (json.RelatedTopics || []).length);
        
        if (json.RelatedTopics && json.RelatedTopics.length > 0) {
            console.log('First Topic:', json.RelatedTopics[0]);
        }
    } catch (e) {
        console.error(e);
    }
}

test();
