
// make module https biar 
const https = require('https');
const fs = require('fs');
const path = require('path');

function req(options, body = null) {
  return new Promise((resolve, reject) => {
    const r = https.request(options, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({
        status: res.statusCode,
        headers: res.headers,
        body: Buffer.concat(chunks).toString(),
      }));
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

function reqBuf(options, body = null) {
  return new Promise((resolve, reject) => {
    const r = https.request(options, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({
        status: res.statusCode,
        headers: res.headers,
        body: Buffer.concat(chunks).toString(),
      }));
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

async function nanobana(input) {
  const { imagePath, prompt } = input;

  const TM = {
    'Content-Type': 'application/json',
    'Application-Name': 'web',
    'Application-Version': '4.0.0',
    'X-CORS-Header': 'iaWg3pchvFx48fY',
  };

  const tmNew = await req({ hostname: 'api.internal.temp-mail.io', path: '/api/v3/email/new', method: 'POST', headers: TM }, JSON.stringify({ min_name_length: 10, max_name_length: 10 }));
  const { email, token } = JSON.parse(tmNew.body);

  await req({ hostname: 'www.nanobana.net', path: '/api/auth/email/send', method: 'POST', headers: { 'Content-Type': 'application/json' } }, JSON.stringify({ email }));

  let code = null;
  for (let i = 0; i < 15; i++) {
    await new Promise(r => setTimeout(r, 3000));
    const inbox = await req({ hostname: 'api.internal.temp-mail.io', path: `/api/v3/email/${email}/messages`, method: 'GET', headers: { ...TM, 'X-Mail-Token': token } });
    const msgs = JSON.parse(inbox.body);
    if (msgs.length > 0) {
      const m = msgs[0].subject.match(/\d{6}/);
      if (m) { code = m[0]; break; }
    }
  }
  if (!code) throw new Error('Code not received');

  const csrfRes = await req({ hostname: 'www.nanobana.net', path: '/api/auth/csrf', method: 'GET', headers: { 'Content-Type': 'application/json' } });
  const { csrfToken } = JSON.parse(csrfRes.body);
  const csrfCookies = (csrfRes.headers['set-cookie'] || []).map(c => c.split(';')[0]).join('; ');

  const payload = new URLSearchParams({ email, code, redirect: 'false', csrfToken, callbackUrl: 'https://www.nanobana.net/' }).toString();
  const loginRes = await req({
    hostname: 'www.nanobana.net',
    path: '/api/auth/callback/email-code?',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(payload),
      'Cookie': csrfCookies,
      'Origin': 'https://www.nanobana.net',
      'Referer': 'https://www.nanobana.net/',
      'X-Auth-Return-Redirect': '1',
    },
  }, payload);

  const sessionCookies = (loginRes.headers['set-cookie'] || []).map(c => c.split(';')[0]).join('; ');

  const fileBuffer = fs.readFileSync(imagePath);
  const filename = path.basename(imagePath);
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).slice(2);
  const ext = path.extname(filename).toLowerCase();
  const mime = ext === '.png' ? 'image/png' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/jpeg';

  const pre = Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\nContent-Type: ${mime}\r\n\r\n`);
  const post = Buffer.from(`\r\n--${boundary}--\r\n`);
  const multipart = Buffer.concat([pre, fileBuffer, post]);

  const uploadRes = await reqBuf({
    hostname: 'www.nanobana.net',
    path: '/api/upload/image',
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': multipart.length,
      'Cookie': sessionCookies,
      'Origin': 'https://www.nanobana.net',
      'Referer': 'https://www.nanobana.net/',
      'X-Original-Size': fileBuffer.length,
    },
  }, multipart);

  const { url: imageUrl } = JSON.parse(uploadRes.body);

  const genBody = JSON.stringify({
    prompt,
    aspect_ratio: '1:1',
    image_input: [imageUrl],
    output_format: 'png',
    resolution: '1K',
  });

  const genRes = await req({
    hostname: 'www.nanobana.net',
    path: '/api/nano-banana-pro/generate',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(genBody),
      'Cookie': sessionCookies,
      'Origin': 'https://www.nanobana.net',
      'Referer': 'https://www.nanobana.net/',
    },
  }, genBody);

  const { data: { taskId } } = JSON.parse(genRes.body);

  let result = null;
  const encodedPrompt = encodeURIComponent(prompt);
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 3000));
    const taskRes = await req({
      hostname: 'www.nanobana.net',
      path: `/api/nano-banana-pro/task/${taskId}?save=1&prompt=${encodedPrompt}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': sessionCookies,
        'Referer': 'https://www.nanobana.net/',
      },
    });
    const taskData = JSON.parse(taskRes.body);
    if (taskData.data?.status === 'completed') {
      result = taskData;
      break;
    }
  }

  return result;
}

module.exports = nanobanana

/*nanobana({ imagePath: '/sdcard/DCIM/Camera/9500d6a39ebc3ab801661a711eba527b.png', prompt: 'Make him wearing shirt' }).then(res => {
  console.log(JSON.stringify(res, null, 2));
}).catch(console.error);
*/
