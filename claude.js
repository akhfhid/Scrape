const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");

//sell products BELAJAR ILMU COLI|MELIHAT FEMBOY TANPA BATAS, MENAHAN NAFSU PADA ANIME BERUSU BESAR 😹

const COOKIES = [
//KUKIS MANA😹 UDH NYOLI BELUM
];

const COOKIE_STRING = COOKIES.map(c => `${c.name}=${c.value}`).join("; ");

const ORG_ID = "mana_id_mu_men";
const MODEL = "claude-sonnet-4-6";
const DEVICE_ID = "mana_device_id_mu_men";
const ANON_ID = "mana_anoni_mu_men";
const MAX_IMAGES = 2;
const MAX_PROMPT = 2500;

const BASE_HEADERS = {
  "accept": "*/*",
  "accept-encoding": "gzip, deflate, br",
  "accept-language": "en-US,en;q=0.9",
  "anthropic-anonymous-id": ANON_ID,
  "anthropic-client-platform": "web_claude_ai",
  "anthropic-client-sha": "456b13de6bf5c5013fd09fbfc657137b90de112a",
  "anthropic-client-version": "1.0.0",
  "anthropic-device-id": DEVICE_ID,
  "cache-control": "no-cache",
  "cookie": COOKIE_STRING,
  "origin": "https://claude.ai",
  "pragma": "no-cache",
  "sec-ch-ua": '"Chromium";v="137", "Not/A)Brand";v="24"',
  "sec-ch-ua-mobile": "?1",
  "sec-ch-ua-platform": '"Android"',
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-origin",
  "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36",
};

async function createConversation() {
  const convId = uuidv4();
  const res = await axios.post(
    `https://claude.ai/api/organizations/${ORG_ID}/chat_conversations`,
    {
      uuid: convId,
      name: "",
      enabled_imagine: true,
      include_conversation_preferences: true,
      is_temporary: false,
    },
    {
      headers: {
        ...BASE_HEADERS,
        "content-type": "application/json",
        "referer": "https://claude.ai/new",
      },
      decompress: true,
    }
  );
  return res.data.uuid;
}

async function uploadFile(convId, filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const fileName = path.basename(filePath);
  const ext = path.extname(fileName).toLowerCase();

  const mimeMap = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
  };
  const mimeType = mimeMap[ext] || "application/octet-stream";

  const form = new FormData();
  form.append("file", fileBuffer, { filename: fileName, contentType: mimeType });

  const res = await axios.post(
    `https://claude.ai/api/organizations/${ORG_ID}/conversations/${convId}/wiggle/upload-file`,
    form,
    {
      headers: {
        ...BASE_HEADERS,
        ...form.getHeaders(),
        "referer": "https://claude.ai/new",
      },
      decompress: true,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    }
  );
  return res.data.file_uuid;
}

async function sendMessage(convId, prompt, fileUuids = []) {
  const humanUuid = uuidv4();
  const assistantUuid = uuidv4();

  const payload = {
    prompt,
    timezone: "Asia/Makassar",
    personalized_styles: [
      {
        isDefault: true,
        key: "Default",
        name: "Normal",
        nameKey: "normal_style_name",
        prompt: "Normal\n",
        summary: "Default responses from Claude",
        summaryKey: "normal_style_summary",
        type: "default",
      },
    ],
    locale: "en-US",
    attachments: [],
    files: fileUuids,
    model: MODEL,
    rendering_mode: "messages",
    sync_sources: [],
    tools: [],
    turn_message_uuids: {
      human_message_uuid: humanUuid,
      assistant_message_uuid: assistantUuid,
    },
  };

  const res = await axios.post(
    `https://claude.ai/api/organizations/${ORG_ID}/chat_conversations/${convId}/completion`,
    payload,
    {
      headers: {
        ...BASE_HEADERS,
        "accept": "text/event-stream",
        "content-type": "application/json",
        "referer": `https://claude.ai/chat/${convId}`,
      },
      responseType: "stream",
      decompress: true,
    }
  );

  return new Promise((resolve, reject) => {
    let fullText = "";
    let buffer = "";

    res.data.on("data", (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split("\n");
      buffer = lines.pop();

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const raw = line.slice(6).trim();
        if (!raw || raw === "[DONE]") continue;
        try {
          const evt = JSON.parse(raw);
          if (evt.type === "content_block_delta" && evt.delta?.type === "text_delta") {
            fullText += evt.delta.text;
            process.stdout.write(evt.delta.text);
          }
        } catch {}
      }
    });

    res.data.on("end", () => {
      console.log();
      resolve(fullText);
    });

    res.data.on("error", reject);
  });
}

async function claude(query, imagePaths = []) {
  if (query.length > MAX_PROMPT) {
    throw new Error(`Prompt melebihi ${MAX_PROMPT} karakter (${query.length})`);
  }
  if (imagePaths.length > MAX_IMAGES) {
    throw new Error(`Max ${MAX_IMAGES} gambar, kamu kasih ${imagePaths.length}`);
  }

  const convId = await createConversation();
  console.log(`[conv] ${convId}`);

  const fileUuids = [];
  for (const imgPath of imagePaths) {
    console.log(`[upload] ${imgPath}`);
    const uuid = await uploadFile(convId, imgPath);
    console.log(`[file_uuid] ${uuid}`);
    fileUuids.push(uuid);
  }

  const reply = await sendMessage(convId, query, fileUuids);
  return reply;
}

//return claude("Gambar ini isinya apa?", [
  "./media/face.jpg",
])

module.exports = claude
