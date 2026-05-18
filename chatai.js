/**
 * # Chat Ai Scraper
 **/

const FormData = require("form-data");
const axios = require("axios");

// Daftar model yang didukung
const listModels = [
  // deepseek
  "deepseek-v3",
  "deepseek-r1",

  // openai
  "gpt-oss-120b",
  "gpt-oss-20b",

  // kimi
  "kimi-k2-instruct",

  // llama
  "llama4-maverick-instruct-basic",
  "llama-v3p1-405b-instruct",
  "llama-v3p1-8b-instruct",

  // gemma
  "gemma-3-27b-it",
  "codegemma-7b",

  // mistral
  "mistral-small-24b-instruct-2501",
  "mistral-nemo-instruct-2407",
  "mixtral-8x22b-instruct",

  // phi
  "phi-3-vision-128k-instruct",
  "phi-3-mini-128k-instruct",

  // qwen
  "qwen3-235b-a22b-thinking-2507",
  "qwen3-coder-480b-a35b-instruct",
  "qwen3-235b-a22b-instruct-2507",
];

// Fungsi utama
async function chatai({ input = "Hii", model = "deepseek-v3" }) {
  try {
    const headers = {
      'origin': 'https://deep-seek.chat',
      'user-agent': 'Mozilla/5.0 (Android 15; Mobile; SM-F958; rv:130.0) Gecko/130.0 Firefox/130.0'
    };

    const wp = await axios.get(headers.origin, { headers }).then(dt => dt.data);
    const jz = wp.match(/window\.DeepSeekConfig = ({[\s\S]*?});/);

    let config;
    if (jz && jz[1]) {
      config = JSON.parse(jz[1]);
    } else {
      throw new Error("Not found config in website");
    }

    const form = new FormData();
    form.append('action', 'deepseek_chat');
    form.append('nonce', config.nonce);
    form.append('message', input);
    form.append('model', model);
    form.append('save_conversation', `0`);
    form.append('session_only', `1`);

    const res = await axios.post(config.ajax_url, form, {
      headers: { ...headers, ...form.getHeaders() }
    });
    return res.data;
  } catch(e) {
    throw new Error("Something error, message:" + e.message);
  }
}

// Contoh penggunaan
/*
chatai({
  input: "hai, apa kabar!",
  model: "deepseek-v3"
}).then(console.log).catch(console.error);
*/

// Export fungsi dan daftar model
module.exports = { chatai, listModels };
