/**
 * # OverChat Claude Scraper
 **/

import crypto from "node:crypto";
import fs from "node:fs/promises";

const API = "https://api.overchat.ai/v1/chat/completions";
const SESSION_FILE = "./overchat-claude-session.json";

// Fungsi untuk memuat sesi
async function loadSession() {
  try {
    const raw = await fs.readFile(SESSION_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return {
      chatId: crypto.randomUUID(),
      deviceId: crypto.randomUUID(),
      messages: [],
    };
  }
}

// Fungsi untuk menyimpan sesi
async function saveSession(session) {
  await fs.writeFile(SESSION_FILE, JSON.stringify(session, null, 2), "utf8");
}

// Fungsi utama untuk bertanya ke OverChat
async function overchat({ input = "Halo gimana kabarmu?" } = {}) {
  const session = await loadSession();

  const userMessage = {
    id: crypto.randomUUID(),
    role: "user",
    content: input,
  };

  const systemMessage = {
    id: crypto.randomUUID(),
    role: "system",
    content: "Ikuti bahasa user dan jawab dengan gaya natural, singkat, dan jelas.",
  };

  const body = {
    chatId: session.chatId,
    model: "claude-haiku-4-5-20251001",
    messages: [...session.messages, userMessage, systemMessage],
    personaId: "claude-haiku-4-5-landing",
    frequency_penalty: 0,
    max_tokens: 4000,
    presence_penalty: 0,
    stream: true,
    temperature: 0.5,
    top_p: 0.95,
  };

  const headers = {
    "sec-ch-ua-platform": `"Android"`,
    "x-device-uuid": session.deviceId,
    "sec-ch-ua": `"Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"`,
    "sec-ch-ua-mobile": "?1",
    "x-device-language": "id-ID",
    "x-device-platform": "web",
    "x-device-version": "1.0.44",
    "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36",
    accept: "*/*",
    "content-type": "application/json",
    origin: "https://overchat.ai",
    referer: "https://overchat.ai/",
    "accept-language": "id-ID,id;q=0.9",
    priority: "u=1, i",
  };

  const response = await fetch(API, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Error: ${response.status} - ${text}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let buffer = "";
  let answer = "";
  let responseId = null;
  let model = null;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line.startsWith("data:")) continue;

      const data = line.slice(5).trim();
      if (!data || data === "[DONE]") continue;

      try {
        const json = JSON.parse(data);
        if (typeof json.id === "string") responseId = json.id;
        if (typeof json.model === "string") model = json.model;

        const content = json.choices?.[0]?.delta?.content;
        if (typeof content === "string") {
          answer += content;
        }
      } catch {}
    }
  }

  const assistantMessage = {
    id: crypto.randomUUID(),
    role: "assistant",
    content: answer,
  };

  session.messages.push(userMessage, assistantMessage);
  await saveSession(session);

  return {
    status: true,
    question: input,
    chatId: session.chatId,
    deviceId: session.deviceId,
    responseId,
    model,
    answer,
  };
}

// Export fungsi utama
export default overchat;
