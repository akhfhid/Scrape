/*
Creator: Akhfhid
*/

async function pinterest(url) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)" },
      redirect: "follow"
    })
    const data = await res.text()
    const video = data.match(/"contentUrl":"(https:\/\/v1\.pinimg\.com\/videos\/[^"]+\.mp4)"/)
    const image =
      data.match(/"imageSpec_736x":\{"url":"(https:\/\/i\.pinimg\.com\/736x\/[^"]+)"/) ||
      data.match(/"imageSpec_564x":\{"url":"(https:\/\/i\.pinimg\.com\/564x\/[^"]+)"/)
    const title = data.match(/"name":"([^"]+)"/)
    const author = data.match(/"fullName":"([^"]+)".+?"username":"([^"]+)"/)
    return {
      type: video ? "video" : "image",
      title: title?.[1] || "-",
      author: author?.[1] || "-",
      username: author?.[2] || "-",
      media: video?.[1] || image?.[1] || "-",
    }
  } catch (e) {
    return { error: e.message }
  }
}
//Example
async function run() {
  console.log(await pinterest("https://pin.it/lOPdveAO7"))
}
run()
/*
Json
{
  type: 'video',
  title: 'Art',
  author: 'ShiroAMV7',
  username: 'shiroamv7',
  media: 'https://v1.pinimg.com/videos/iht/expMp4/73/62/df/7362df9bf4d0db39680a0ee892db7f3b_720w.mp4'
}
*/
