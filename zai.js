const { Readable } = require('node:stream');
const crypto = require('node:crypto');
const axios = require('axios');

class ZAI {
  constructor() {
    this.BASE_URL = 'https://chat.z.ai';
    this.FE_VERSION = 'prod-fe-1.0.262';
    this.SIG_SECRET = 'key-@@@@)))()((9))-xxxx&&&%%%%%';
    this.UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36';
    
    this.ins = axios.create({
      baseURL: this.BASE_URL,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Accept-Language': 'en-US',
        'User-Agent': this.UA
      }
    });
    
    this._model = {
      'glm-4.6': 'GLM-4-6-API-V1',
      'glm-4.5v': 'glm-4.5v',
      'glm-4.5': '0727-360B-API',
      'glm-4.5-air': '0727-106B-API',
      'glm-4-32b': 'main_chat',
      'glm-4.1v-9b-thinking': 'GLM-4.1V-Thinking-FlashX',
      'z1-rumination': 'deep-research',
      'z1-32b': 'zero',
      'glm-4-flash': 'glm-4-flash',
      'glm-5': 'glm-5'
    };
  }
  
  sign(userId, token, chatId, prompt) {
    const now = new Date();
    const ts = String(Date.now());
    const requestId = crypto.randomUUID();
    const sigI = { timestamp: ts, requestId, user_id: userId };
    const shrt = Object.entries(sigI).sort((a, b) => a[0].localeCompare(b[0])).join(',');
    const S = Math.floor(Number(ts) / 300_000);
    const E = crypto.createHmac('sha256', this.SIG_SECRET).update(String(S)).digest('hex');
    const d = `${shrt}|${Buffer.from(prompt).toString('base64')}|${ts}`;
    const signature = crypto.createHmac('sha256', E).update(d).digest('hex');
    const params = {
      timestamp: ts,
      requestId,
      user_id: userId,
      version: '0.0.1',
      platform: 'web',
      token,
      user_agent: this.UA,
      language: 'en-US',
      languages: 'en-US,id-ID,id,en',
      timezone: 'Asia/Jakarta',
      cookie_enabled: 'true',
      screen_width: '1920',
      screen_height: '1080',
      screen_resolution: '1920x1080',
      viewport_height: '900',
      viewport_width: '1920',
      viewport_size: '1920x900',
      color_depth: '24',
      pixel_ratio: '1',
      current_url: `${this.BASE_URL}/c/${chatId}`,
      pathname: `/c/${chatId}`,
      search: '',
      hash: '',
      host: 'chat.z.ai',
      hostname: 'chat.z.ai',
      protocol: 'https:',
      referrer: '',
      title: 'Z.ai - Free AI Chatbot & Agent powered by GLM-5 & GLM-4.7',
      timezone_offset: '-420',
      local_time: now.toISOString(),
      utc_time: now.toUTCString(),
      is_mobile: 'false',
      is_touch: 'false',
      max_touch_points: '0',
      browser_name: 'Chrome',
      os_name: 'Linux',
      signature_timestamp: ts,
    };
    return { signature, params, ts, requestId, now };
  }
  
  async parseStream(streamData) {
    let buffer = '';
    const thinking = [];
    const answer = [];
    let usage = null;
    
    for await (const chunk of streamData) {
      buffer += chunk.toString('utf-8');
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data: ')) continue;
        const jsonStr = trimmed.slice(6).trim();
        
        if (jsonStr === '[DONE]') continue;
        
        try {
          const parsed = JSON.parse(jsonStr);
          if (parsed.type !== 'chat:completion' || !parsed.data) continue;
          
          const { delta_content, phase, usage: u } = parsed.data;
          if (u) usage = u;
          if (!delta_content) continue;
          
          if (phase === 'thinking') thinking.push(delta_content);
          else if (phase === 'answer') answer.push(delta_content);
        } catch {
          continue;
        }
      }
    }
    
    return {
      thinking: thinking.join(''),
      answer: answer.join(''),
      search: [],
      usage
    };
  }
  
  getModel() {
    return Object.keys(this._model);
  }
  
  async chat(question, { model = 'glm-4.6', search = false, deepthink = false } = {}) {
    try {
      if (!question) throw new Error('Pertanyaan diperlukan.');
      const targetModel = this._model[model] || this._model['glm-5'];
      
      const authRes = await this.ins.get('/api/v1/auths/');
      const user = authRes.data;
      const messageId = crypto.randomUUID();
      const nowSecs = Math.floor(Date.now() / 1000);
      
      const chatPayload = {
        chat: {
          id: '',
          title: 'New Chat',
          models: [targetModel],
          params: {},
          history: {
            messages: {
              [messageId]: {
                id: messageId,
                parentId: null,
                childrenIds: [],
                role: 'user',
                content: question,
                timestamp: nowSecs,
                models: [targetModel],
              },
            },
            currentId: messageId,
          },
          tags: [],
          flags: [],
          features: [{ type: 'tool_selector', server: 'tool_selector_h', status: 'hidden' }],
          mcp_servers: [],
          enable_thinking: deepthink,
          auto_web_search: search,
          message_version: 1,
          extra: {},
          timestamp: Date.now(),
        },
      };
      
      const chatRes = await this.ins.post('/api/v1/chats/new', chatPayload, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const chatId = chatRes.data.id;
      
      const sigData = this.sign(user.id, user.token, chatId, question);
      const reqBody = {
        stream: true,
        model: targetModel,
        messages: [
          { role: 'user', content: question }
        ],
        signature_prompt: question,
        params: {},
        extra: {},
        features: {
          image_generation: false,
          web_search: search,
          auto_web_search: search,
          preview_mode: true,
          flags: [],
          enable_thinking: deepthink,
        },
        variables: {
          '{{USER_NAME}}': user.name || 'Guest',
          '{{USER_LOCATION}}': 'Unknown',
          '{{CURRENT_DATETIME}}': sigData.now.toISOString().replace('T', ' ').slice(0, 19),
          '{{CURRENT_DATE}}': sigData.now.toISOString().slice(0, 10),
          '{{CURRENT_TIME}}': sigData.now.toISOString().slice(11, 19),
          '{{CURRENT_WEEKDAY}}': sigData.now.toLocaleDateString('en-US', { weekday: 'long' }),
          '{{CURRENT_TIMEZONE}}': 'Asia/Jakarta',
          '{{USER_LANGUAGE}}': 'en-US',
        },
        chat_id: chatId,
        id: sigData.requestId,
        current_user_message_id: messageId,
        current_user_message_parent_id: null,
        background_tasks: { title_generation: true, tags_generation: true },
      };
      
      const res = await this.ins.post('/api/v2/chat/completions', reqBody, {
        responseType: 'stream',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'X-FE-Version': this.FE_VERSION,
          'X-Signature': sigData.signature,
        },
        params: sigData.params,
      });
      
      const hasil = await this.parseStream(res.data);
      
      return {
        status: true,
        data: hasil
      };
    } catch (error) {
      return {
        status: false,
        msg: error.message,
        details: error?.response?.data || error?.response?.statusText || {}
      };
    }
  }
}


// How To Use

// Basic Chat

const ai = new ZAI()

const res = await ai.chat(`Hai, siapa kamu`, {
  model: 'glm-4.6',
})

console.log(res)

// Using Search Information
const ai = new ZAI()

const res = await ai.chat(`Berita hari ini`, {
  model: 'glm-4.6',
  search: true
})

console.log(res)

// Deep Thinking / Reasoning
const ai = new ZAI()

const res = await ai.chat(`Siapakah penemu AI, jelaskan lebih detail`, {
  model: 'glm-4.6',
  deepthink: true
})

console.log(res)


// Using System Prompt (Deprecated / Not Working)
const ai = new ZAI()

const res = await ai.chat(`Hai, siapa kamu`, {
  model: 'glm-4.6',
  system_prompt: "Kamu adalah plana dari Blue Archive"
})

console.log(res)

// Get Available Models
const ai = new ZAI()

const res = ai.getModel()

console.log(res)

// Available Models

| Model | Description |
| glm-4.6 | Latest GLM 4.6 |
| glm-4.5v | Vision Model |
| glm-4.5 | GLM 4.5 |
| glm-4.5-air | Lightweight Model |
| glm-4-32b | 32B Model |
| glm-4.1v-9b-thinking | Thinking Vision Model |
| z1-rumination | Deep Research |
| z1-32b | Zero Model |
| glm-4-flash | Fast Model |
| glm-5 | Latest GLM-5 |



// Example Response

{
  status: true,
  data: {
    thinking: '',
    answer: 'Halo! Saya adalah AI...',
    search: [],
    usage: {
      prompt_tokens: 10,
      completion_tokens: 120
    }
  }
}




// Notes
// `search: true` enables web search capability.
// `deepthink: true` enables reasoning/thinking mode.
// `system_prompt` is currently deprecated and may not work.
// Stream response is automatically parsed internally.
