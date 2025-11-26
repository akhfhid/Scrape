/* 
Creator: akhfhid
Website: https://akhfhid.my.id
*/

const axios = require("axios");

const srv = {
  us: Array.from({ length: 20 }, (_, x) => "https://us" + (x + 1) + ".proxysite.com"),
  eu: Array.from({ length: 20 }, (_, x) => "https://eu" + (x + 1) + ".proxysite.com")
};

async function fetchViaProxy(url, region = "us", srvNum = 1) {
  const ix = srvNum - 1
  const host = srv[region][ix]
  const post = host + "/includes/process.php?action=update"

  const body = new URLSearchParams({
    "server-option": region + srvNum,
    d: url,
    allowCookies: "on"
  })

  const r1 = await axios.post(post, body.toString(), {
    maxRedirects: 0,
    validateStatus: s => true,
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Content-Type": "application/x-www-form-urlencoded",
      "Origin": "https://www.proxysite.com",
      "Referer": "https://www.proxysite.com/"
    }
  })

  let loc = r1.headers.location
  if (!loc) throw new Error("redirect_missing")
  if (!loc.startsWith("http")) loc = host + loc

  const r2 = await axios.get(loc, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Referer": "https://www.proxysite.com/"
    }
  })

  return r2.data
}

module.exports = { fetchViaProxy }

// Cara pakai ini url,region,nomor server sampe 20 ada us ama eu oke 
if (require.main === module) {
  (async () => {
    try {
      const out = await fetchViaProxy("https://cloudkuimages.guru/status", "us", 1)
      console.log(out)
    } catch (e) {
      console.error(e.message)
    }
  })()
}
