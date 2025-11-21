/*
Creator: akhfhid
Website: https://akhfhid.my.id
*/


const axios = require('axios');

async function spotify(input) {
    try {
        if (!input) throw new Error('Input is required.');

        const { data: s } = await axios.get(`https://spotdown.org/api/song-details?url=${encodeURIComponent(input)}`, {
            headers: {
                origin: 'https://spotdown.org',
                referer: 'https://spotdown.org/',
                'user-agent': 'Mozilla/5.0 (Linux; Android 15; SM-F958 Build/AP3A.240905.015) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.86 Mobile Safari/537.36'
            }
        });

        const song = s.songs[0];
        if (!song) throw new Error('Track not found.');

        const { data } = await axios.post('https://spotdown.org/api/download', {
            url: song.url
        }, {
            headers: {
                origin: 'https://spotdown.org',
                referer: 'https://spotdown.org/',
                'user-agent': 'Mozilla/5.0 (Linux; Android 15; SM-F958 Build/AP3A.240905.015) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.86 Mobile Safari/537.36'
            },
            responseType: 'arraybuffer'
        });

        return {
            metadata: {
                title: song.title,
                artist: song.artist,
                duration: song.duration,
                cover: song.thumbnail,
                url: song.url
            },
            audio: data
        };
    } catch (error) {
        throw new Error(error.message);
    }
};

// Usage:
// spotify('tek it').then(console.log);
spotify('https://open.spotify.com/track/0MnTkIEP4zZN1IUSu8MvIz').then(console.log);
