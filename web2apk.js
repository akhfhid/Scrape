const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

class WebAppBuilder {
    constructor() {
        this.baseUrl = 'https://webappcreator.amethystlab.org';
        this.headers = {
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
            'Origin': 'https://webappcreator.amethystlab.org',
            'Referer': 'https://webappcreator.amethystlab.org/',
            'sec-ch-ua': '"Chromium";v="146", "Not-A.Brand";v="24", "Google Chrome";v="146"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Linux"'
        };
    }

    async buildApk(websiteUrl, appName, iconPath, packageName = null, versionName = '1.0.0', versionCode = 1) {
        const form = new FormData();
        form.append('websiteUrl', websiteUrl);
        form.append('appName', appName);
        form.append('icon', fs.createReadStream(iconPath));
        form.append('packageName', packageName || this.generatePackageName(appName));
        form.append('versionName', versionName);
        form.append('versionCode', versionCode);

        const response = await axios.post(`${this.baseUrl}/api/build-apk`, form, {
            headers: {
                ...this.headers,
                ...form.getHeaders()
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });

        if (response.data.success) {
            response.data.fullDownloadUrl = `${this.baseUrl}${response.data.downloadUrl}`;
        }

        return response.data;
    }

    generatePackageName(appName) {
        const cleaned = appName.toLowerCase().replace(/[^a-z0-9]/g, '');
        return `com.${cleaned}.app`;
    }
}

(async () => {
    const builder = new WebAppBuilder();
    const result = await builder.buildApk(
        'https://www.youtube.com/',
        'Youtube Virus',
        'jokowi.jpeg',
        'com.youtube.y',
        '1.0.0',
        1
    );
    console.log(JSON.stringify(result, null, 2));
})();