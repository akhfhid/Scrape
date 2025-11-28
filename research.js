const WebSocket = require('ws');

async function searchai(query) {
    if (!query) throw new Error('Query is required');
    
    const socket = new WebSocket('wss://searc.ai/ws');
    const result = {
        query: query,
        subqueries: [],
        report: '',
        source_url: [],
        selected_images: [],
        files: {},
        metadata: {
            total_cost: null,
            agent_type: null,
            scraped_pages: 0,
            scraped_images: 0
        }
    };
    
    return new Promise(async (resolve, reject) => {
        socket.on('open', () => {
            socket.send('start ' + JSON.stringify({
                task: query,
                report_type: 'research_report',
                report_source: 'web',
                tone: 'Objective',
                query_domains: []
            }));
        });

        socket.on('message', (data) => {
            const d = JSON.parse(data);
            // ... (kode kamu yg tadi)
        });

        socket.on('error', (err) => {
            reject(err);
        });
    });
}

(async () => {
    const resp = await searchai('What is internet?');
    console.log(resp);
})();
