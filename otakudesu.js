/**
 * Anime Scraper Otakudesu
 * Creator by: Affan Khulafa (Fan)
 * Description:
 * Scraper sederhana untuk mengambil:
 * - Daftar anime
 * - Status anime (Completed / On-Going)
 * - Detail anime
 * - Daftar episode
 */

const axios = require('axios');
const cheerio = require('cheerio');

class AnimeScraper {
    /**
     * Constructor
     * @param {string} baseUrl - Base URL website anime
     */
    constructor(baseUrl = 'https://otakudesu.best') {
        this.baseUrl = baseUrl;
        this.animeList = [];
        this.$ = null;
    }

    /**
     * Fetch halaman anime list
     * @returns {Promise<Array>}
     */
    async fetchAnimeList() {
        const response = await axios.get(`${this.baseUrl}/anime-list/`);
        this.$ = cheerio.load(response.data);
        return this.scrapeAnimeList();
    }

    /**
     * Scrape daftar anime dari halaman anime-list
     * @returns {Array}
     */
    scrapeAnimeList() {
        this.$('.jdlbar ul li').each((index, element) => {
            const linkElement = this.$(element).find('a.hodebgst');

            if (linkElement.length > 0) {
                // Ambil judul anime
                const title = linkElement
                    .text()
                    .replace(/\s*<color.*/, '')
                    .trim();

                // Ambil URL anime
                const url = linkElement.attr('href');

                // Default status
                let status = 'Completed';

                // Cek apakah anime masih On-Going
                const statusElement = linkElement.find('span');
                if (
                    statusElement.length > 0 &&
                    statusElement.text().includes('On-Going')
                ) {
                    status = 'On-Going';
                }

                // Simpan ke list
                this.animeList.push({
                    index: index + 1,
                    title,
                    url,
                    status
                });
            }
        });

        return this.animeList;
    }

    /**
     * Ambil anime terbaru (berdasarkan urutan list)
     * @param {number} limit
     * @returns {Array}
     */
    getLatestAnime(limit = 10) {
        return this.animeList.slice(0, limit);
    }

    /**
     * Cari anime berdasarkan keyword
     * @param {string} keyword
     * @returns {Array}
     */
    searchAnime(keyword) {
        const lowerKeyword = keyword.toLowerCase();
        return this.animeList.filter(anime =>
            anime.title.toLowerCase().includes(lowerKeyword)
        );
    }

    /**
     * Ambil detail anime + episode list
     * @param {string} url
     * @returns {Promise<Object>}
     */
    async getAnimeDetail(url) {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        // Detail info (Genre, Studio, dll)
        const detailInfo = {};
        $('.infozingle p').each((_, element) => {
            const text = $(element).text().trim();
            if (text.includes(':')) {
                const [key, value] = text.split(':').map(v => v.trim());
                detailInfo[key] = value;
            }
        });

        // List episode
        const episodeLinks = [];
        $('.episodelist ul li').each((_, element) => {
            const linkElement = $(element).find('a');
            const dateElement = $(element).find('.zeebr');

            if (linkElement.length > 0) {
                episodeLinks.push({
                    title: linkElement.text().trim(),
                    url: linkElement.attr('href'),
                    date: dateElement.text().trim()
                });
            }
        });

        return {
            title: $('.jdlrx h1')
                .text()
                .replace(/\(Episode.*/, '')
                .trim(),
            sinopsis: $('.sinopc p').text().trim(),
            detail: detailInfo,
            episodes: episodeLinks
        };
    }
}

/**
 * Example usage
 */
(async () => {
    const scraper = new AnimeScraper();

    // Fetch daftar anime
    await scraper.fetchAnimeList();

    // Ambil 3 anime terbaru
    const latestAnime = scraper.getLatestAnime(3);
    const animeDetails = [];

    // Ambil detail tiap anime
    for (const anime of latestAnime) {
        const detail = await scraper.getAnimeDetail(anime.url);
        animeDetails.push({
            ...detail,
            status: anime.status
        });
    }

    // Output hasil
    console.log(JSON.stringify(animeDetails, null, 2));
})();
