/**
 * # ElevenLabs Scraper
 **/

const axios = require("axios");

class ElevenLabs {
  constructor() {
    this.ins = axios.create({
      baseURL: "https://tts1.squinty.art/api/v1",
      headers: {
        "content-type": "application/json; charset=UTF-8",
        "user-agent": "NX/1.0.0",
      }
    });
  }

  // Generate random login data
  genLogin() {
    const randHex = l => crypto.randomUUID().replace(/-/g,'').slice(0,l);
    const randNum = d => String(Math.floor(Math.random() * 10 ** d)).padStart(d, '0');
    const getRand = (a,b) => (~~(Math.random()*(~~b-~~a+1))+~~a);
    const b = getRand(0, 4);

    const [devices, country, lang, zone, ...nn] = [
      [
        'Samsung Galaxy S25 Ultra', 'Google Pixel 10',
        'OnePlus 13', 'Xiaomi 15 Ultra', 'Oppo Find X8 Pro'
      ],
      ['ID', 'VN', 'PH', 'MM', 'JP'],
      ['id', 'vi', 'en', 'my', 'jp'],
      ['Asia/Jakarta', 'Asia/Ho_Chi_Minh', 'Asia/Manila', 'Asia/Yangon', 'Asia/Tokyo'],
      ['Hiro', 'Yuki', 'Sora', 'Riku', 'Kaito'],
      ['Tanaka', 'Sato', 'Nakamura', 'Kobayashi', 'Yamamoto'],
    ];
    const [fn, ln] = nn.map(z => z[Math.floor(Math.random() * z.length)]);

    return {
      build: '14',
      country: country[b],
      deviceId: randHex(16),
      deviceModel: `${devices[getRand(0, devices.length)]}`,
      displayName: `${fn} ${ln}`,
      email: `${fn.toLowerCase()}${randNum(4)}${randHex(4)}@gmail.com`,
      googleAccountId: randNum(18),
      language: lang[b],
      osVersion: String(26 + Math.floor(Math.random() * 4)),
      platform: 'android',
      timeZone: zone[b],
      version: '1.1.4'
    };
  }

  // Login to ElevenLabs API
  async login() {
    const z = await this.ins.post("/login/login", this.genLogin());
    this.ins.defaults.headers.common.authorization = "Bearer " + z.data.token;
  }

  // Get user credit info
  async userInfo() {
    return this.ins.get("/credit/getUserCreditInfo").then(i => i.data);
  }

  // Get generation history
  async history() {
    return this.ins.get("/history/getHistory").then(i => i.data);
  }

  // Get available voices
  async getVoiceList() {
    return this.ins.get("/voices/getVoices").then(i => i.data);
  }

  // Get available models
  async getModelList() {
    return this.ins.get("/models/getModels").then(i => i.data);
  }

  // Generate TTS voice
  async create({
    text = "hello",
    id = "2EiwWnXFnvU5JabPnv8n",
    model = "eleven_turbo_v2_5",
    exaggeration = "50",
    clarity = "50",
    stability = "50"
  } = {}) {
    return this.ins.post("/generate/generate", {
      text,
      voiceId: id,
      modelId: model,
      styleExaggeration: exaggeration,
      claritySimilarityBoost: clarity,
      stability,
    }).then(i => i.data);
  }

  // Delete history by ID
  async del(id = "") {
    return this.ins.post("/history/delete", {
      documentId: id
    }).then(i => i.data);
  }
}

// Export the ElevenLabs class
module.exports = ElevenLabs;
