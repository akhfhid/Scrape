
class ChatMusicAPI {
  constructor() {
    this.baseUrl = 'https://api.chatmusicpro.com';
    this.identityId = this.generateUUID();
    this.token = null;
    this.headers = {
      'User-Agent': 'android',
      'Accept-Encoding': 'gzip',
      'Content-Type': 'application/x-www-form-urlencoded',
      'region-code': 'ID',
      'user-type': 'android',
      'version': '1.0.3',
      'app-type': '1',
      'language': 'EN',
      'identity-id': this.identityId,
      'app-market': 'google_play'
    };
  }

  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16).toUpperCase();
    });
  }

  async request(endpoint, data = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const body = new URLSearchParams(data).toString();
    const headers = { ...this.headers };

    if (this.token) {
      headers['token'] = this.token;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: body
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async login() {
    const result = await this.request('/v1/user/device_login', {
      source_site: 'google_play',
      identity_id: this.identityId
    });

    if (result.code === 200) {
      this.token = result.data.token;
      return result.data;
    }
    throw new Error(`Login failed: ${result.message}`);
  }

  getModelList() {
    return [
      { "id": 6, "version": "v5.0" },
      { "id": 5, "version": "v4.5-plus" },
      { "id": 4, "version": "v4.5" },
      { "id": 3, "version": "v4.0" },
      { "id": 1, "version": "v3.5" }
    ]
  }

  async generateMusic(params) {
    const payload = {
      music_model_id: params.modelId || 6,
      title: params.title || 'rock',
      prompt: params.prompt || '',
      lyrics: params.lyrics || '',
      is_instrumental: params.isInstrumental || 0,
      music_style: params.musicStyle || '',
      music_style_code: params.musicStyleCode || '',
      gender_type: params.genderType || 0
    };

    const result = await this.request('/music/create-music', payload);
    if (result.code === 200) return result.data.create_id;
    throw new Error(`Creation failed: ${result.message}`);
  }

  async getProgress(id) {
    const result = await this.request('/music/get-music-progress', { id });
    if (result.code === 200) return result.data;
    throw new Error(`Progress check failed for ${id}: ${result.message}`);
  }

  async waitTasks(ids) {
    const completed = new Set();
    const results = [];

    while (completed.size < ids.length) {
      for (const id of ids) {
        if (completed.has(id)) continue;
        try {
          const status = await this.getProgress(id);
          if (status.music_file) {
            completed.add(id);
            results.push(status);
          }
        } catch (e) {
          // Ignore
        }
      }
      if (completed.size < ids.length) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    return results;
  }

  async generate(payload) {
    try {
      await this.login();
      const taskIds = await this.generateMusic(payload);
      return await this.waitTasks(taskIds);
    } catch (error) {
      throw error;
    }
  }
}