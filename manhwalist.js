import * as cheerio from 'cheerio'

const base_url = 'https://manhwalist02.asia'

const config = {
  latest_page: 1,
  popular_page: 1,
  search_query: '',
  detail_slug: '',
}

async function fetch_html(url) {
  const res = await fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',
      'accept-language': 'en-US,en;q=0.9',
    },
  })
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return cheerio.load(await res.text())
}

function extract_card($, el) {
  const card = $(el)
  const url = card.find('div.bsx > a').attr('href') || ''
  const title = card.find('div.tt').text().trim()
  const thumb = card.find('div.limit img').attr('data-src') || ''
  const chapter = card.find('div.epxs').text().trim()
  const score = card.find('div.numscore').text().trim()
  const type = (card.find('span.type').attr('class') || '').replace('type', '').trim()
  const colored = card.find('span.colored').length > 0
  const hot = card.find('span.hotx').length > 0
  const rating_pct = (card.find('div.rtb span').attr('style') || '').match(/width:\s*(\d+)%/)
  const rating = rating_pct ? (parseInt(rating_pct[1]) / 10).toFixed(1) : score || '0'
  return { title, url, thumb, chapter, rating, type, colored, hot }
}

async function get_latest(page = 1) {
  const url = `${base_url}/manga/?order=update&page=${page}`
  const $ = await fetch_html(url)
  const items = []
  $('div.listupd > div.bs').each((_, el) => items.push(extract_card($, el)))

  const next = $('div.hpage a.r').attr('href') || null
  const prev = $('div.hpage a.l').attr('href') || null
  return { page, items, next, prev }
}

async function get_popular(page = 1) {
  const url = `${base_url}/manga/?order=popular&page=${page}`
  const $ = await fetch_html(url)
  const items = []
  $('div.listupd > div.bs').each((_, el) => items.push(extract_card($, el)))

  const next = $('div.hpage a.r').attr('href') || null
  const prev = $('div.hpage a.l').attr('href') || null
  return { page, items, next, prev }
}

async function get_today() {
  const $ = await fetch_html(base_url)
  const items = []
  $('div.hotslid div.bs').each((_, el) => items.push(extract_card($, el)))
  return { section: 'popular-today', items }
}

async function search(query, page = 1) {
  const url = page > 1
    ? `${base_url}/page/${page}/?s=${encodeURIComponent(query)}`
    : `${base_url}/?s=${encodeURIComponent(query)}`
  const $ = await fetch_html(url)
  const items = []
  $('div.listupd > div.bs').each((_, el) => items.push(extract_card($, el)))

  const heading = $('div.releases h1').first().text().trim()
  const next = $('div.hpage a.r').attr('href') || null
  const prev = $('div.hpage a.l').attr('href') || null
  return { query, heading, page, items, next, prev }
}

async function get_detail(slug) {
  const url = `${base_url}/manga/${slug}/`
  const $ = await fetch_html(url)

  const title = $('h1.entry-title').text().trim()
  const alt_titles = $('span.alternative').text().split(',').map((s) => s.trim()).filter(Boolean)
  const synopsis = $('div.entry-content.entry-content-single').text().trim()
  const cover = $('div.thumb img.wp-post-image').attr('src') || ''
  const rating = $('div.rating-prc div.num[itemprop="ratingValue"]').text().trim()
  const followers = $('div.bmc').text().match(/(\d+)/)?.[1] || '0'

  const genres = []
  $('div.wd-full span.mgen a').each((_, el) => genres.push($(el).text().trim()))

  const meta = {}
  $('div.tsinfo.bixbox div.imptdt').each((_, el) => {
    const text = $(el).text().trim()
    const match = text.match(/^(.+?)\s*(?:<|(?=[A-Z]))/)
    if (match) {
      const key = match[1].trim().toLowerCase()
      const val = $(el).children('i, a').first().text().trim() || text.replace(match[1], '').trim()
      meta[key] = val
    }
  })

  const chapters = []
  $('div#chapterlist.eplister ul li').each((_, el) => {
    const li = $(el)
    const num = li.attr('data-num') || ''
    const name = li.find('span.chapternum').text().trim()
    const date = li.find('span.chapterdate').text().trim()
    const ch_url = li.find('div.eph-num a').attr('href') || ''
    chapters.push({ num, name, date, url: ch_url })
  })

  return {
    title, alt_titles, synopsis, cover, rating, followers,
    genres, meta, chapters, total_chapters: chapters.length,
  }
}

async function run_execute(input, args) {
  const action = input
  const arg = args

  try {
    let result

    switch (action) {
      case 'latest':
        result = await get_latest(parseInt(arg) || 1)
        break
      case 'popular':
        result = await get_popular(parseInt(arg) || 1)
        break
      case 'today':
        result = await get_today()
        break
      case 'search':
        result = await search(arg || config.search_query)
        break
      case 'detail':
        result = await get_detail(arg || config.detail_slug)
        break
    }

    console.log(JSON.stringify(result, null, 2))
  } catch (err) {
    console.error(`${err.message}`)
    process.exit(1)
  }
}

run_execute('popular', '')