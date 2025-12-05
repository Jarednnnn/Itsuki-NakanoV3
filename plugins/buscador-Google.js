/*
██████╗░██╗░░░██╗███████╗███████╗
██╔══██╗╚██╗░██╔╝╚════██║██╔════╝
██████╔╝░╚████╔╝░░░███╔═╝█████╗░░
██╔══██╗░░╚██╔╝░░██╔══╝░░██╔══╝░░
██║░░██║░░░██║░░░███████╗███████╗
╚═╝░░╚═╝░░░╚═╝░░░╚══════╝╚══════╝
*/
import fs from 'fs'
import path from 'path'
import axios from 'axios'
import * as cheerio from 'cheerio'

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
const TMP_DIR = './tmp'
const DEFAULT_MAX = 10
const HARD_MAX = 30
const PAGE_MAX = 3 // páginas ijn (0..2)

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

function stamp () {
    const d = new Date(); const p = n => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}-${p(d.getMinutes())}-${p(d.getSeconds())}`
}
function ensureDir (d) { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }) }

async function fetchGoogleImagesPage (query, pageIndex = 0) {
    const params = new URLSearchParams({
        q: query,
        tbm: 'isch',
        hl: 'es',
        gl: 'us',
        ijn: String(pageIndex)
    })
    const url = `https://www.google.com/search?${params.toString()}`
    const { data: html } = await axios.get(url, {
        headers: {
            'User-Agent': UA,
            'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Referer': 'https://www.google.com/'
        },
        timeout: 20000
    })
    return html
}

function extractWebUrls (html) {
    const $ = cheerio.load(html)
    const results = []

    // 1. Bloques JSON embebidos con campos 'ou' (original url) en scripts
    const scriptTexts = $('script')
        .map((_, el) => $(el).html() || '')
        .get()
        .join(' ')

    try {
        const jsonBlocks = scriptTexts.match(/\{[^\{]*?"ou"\s*:\s*"https?:\/\/[^"']*?"[^}]*?\}/g) || []
        for (const block of jsonBlocks) {
            try {
                const ouMatch = block.match(/"ou"\s*:\s*"(https?:\/\/[^"']*?)"/)
                const ptMatch = block.match(/"pt"\s*:\s*"([^"']*?)"/)
                const stMatch = block.match(/"s"\s*:\s*"([^"']*?)"/)
                if (ouMatch) {
                    const url = ouMatch[1]
                    // Filtrar imágenes directas (queremos páginas web)
                    if (!url.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?|$)/i)) {
                        try {
                            const domain = new URL(url).hostname
                            const title = ptMatch ? ptMatch[1] : domain
                            const snippet = stMatch ? stMatch[1] : ''
                            results.push({ title, link: url, snippet, source: 'image_metadata' })
                        } catch {}
                    }
                }
            } catch {}
        }
        // 2. URLs crudas dentro de scripts
        const urlMatches = scriptTexts.match(/https?:\/\/[^"'\\\s]+?\.[a-z]{2,}[^"'\\\s]*/gi) || []
        for (const url of urlMatches) {
            try {
                if (!url.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp|js|css|json)(\?|$)/i) &&
                    !/google\.(com|\w+)/i.test(url) &&
                    !url.includes('gstatic.com') &&
                    !url.includes('googleapis.com') &&
                    /^https?:\/\/([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}\//i.test(url)) {
                    const urlPos = scriptTexts.indexOf(url)
                    const nearby = scriptTexts.substring(Math.max(0, urlPos - 100), urlPos)
                    const titleMatch = nearby.match(/"([^"']{5,100})"\s*,?\s*"?[^"']*?"?:\s*"?https?/) ||
                        nearby.match(/title["\s:]+([^"']+)["]/i)
                    const title = titleMatch ? titleMatch[1] : new URL(url).hostname
                    results.push({ title, link: url, snippet: '', source: 'script_url' })
                }
            } catch {}
        }
    } catch (e) {
        console.error('[gweb] Error analizando scripts:', e.message)
    }

    // 3. enlaces html
    $('a[href]').each((_, el) => {
        const $a = $(el)
        const href = $a.attr('href')
        if (!href) return
        let url = href
        if (href.startsWith('/url?')) {
            try {
                const params = new URLSearchParams(href.split('?')[1])
                const q = params.get('q')
                if (q) url = q
            } catch {}
        }
        if (/^https?:\/\//.test(url) && !url.includes('google.com') && !url.includes('gstatic.com')) {
            try {
                const urlObj = new URL(url)
                const domain = urlObj.hostname
                const title = ($a.text().trim() || $a.attr('title') || domain).slice(0, 160)
                let snippet = ''
                const parentText = $a.parent().text().trim()
                if (parentText && parentText.length > title.length + 20) snippet = parentText.slice(0, 220)
                results.push({ title, link: url, snippet, source: 'html_link' })
            } catch {}
        }
    })

    // 4. Deduplicar por origen + path
    const seen = new Set()
    return results.filter(r => {
        try {
            const u = new URL(r.link)
            const key = u.origin + u.pathname
            if (seen.has(key)) return false
            seen.add(key)
            return true
        } catch { return false }
    })
}

async function hybridSearch (query, maxResults = DEFAULT_MAX) {
    ensureDir(TMP_DIR)
    const results = []
    let page = 0
    const target = Math.min(maxResults, HARD_MAX)
    while (results.length < target && page < PAGE_MAX) {
        try {
            const html = await fetchGoogleImagesPage(query, page)
            if (page === 0) {
                // Guardar primera página para debug
                try { fs.writeFileSync(path.join(TMP_DIR, `gweb_page_${stamp()}.html`), html) } catch {}
            }
            const pageResults = extractWebUrls(html)
            for (const r of pageResults) {
                if (results.length < target) results.push(r)
                else break
            }
            if (pageResults.length === 0) break
            page++
            if (results.length < target && page < PAGE_MAX) {
                await sleep(1000 + Math.floor(Math.random() * 1200))
            }
        } catch (e) {
            console.error('[gweb] Error página', page + 1, e.message)
            break
        }
    }
    const excludeDomains = [
        'google.com', 'gstatic.com', 'googleapis.com', 'googleusercontent.com',
        'googleadservices.com', 'youtube.com', 'youtu.be', 'ggpht.com'
    ]
    const filtered = results.filter(r => {
        try {
            const u = new URL(r.link)
            if (u.pathname === '/' || u.pathname === '') return false
            return !excludeDomains.some(d => u.hostname.includes(d))
        } catch { return false }
    })
    const ranked = filtered
        .sort((a, b) => ((b.title ? 2 : 0) + (b.snippet ? 1 : 0)) - ((a.title ? 2 : 0) + (a.snippet ? 1 : 0)))
        .slice(0, target)
        .map(({ title, link, snippet }, i) => ({ idx: i + 1, title, link, snippet }))

    try {
        fs.writeFileSync(path.join(TMP_DIR, `gweb_${query.replace(/\s+/g, '_')}_${stamp()}.json`), JSON.stringify(ranked, null, 2))
    } catch {}
    return ranked
}

// Mensaje de contacto (estilo otros plugins)
const fkontak = {
    key: { participants: '0@s.whatsapp.net', remoteJid: 'status@broadcast', fromMe: false, id: 'GoogleHybrid' },
    message: { contactMessage: { displayName: 'Google Web', vcard: 'BEGIN:VCARD\nVERSION:3.0\nN:;Google Web;;;\nFN:Google Web\nORG:Buscador Hibrido\nEND:VCARD' } }
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
    const ctx = (typeof global.rcanalr === 'object') ? global.rcanalr : ((typeof global.rcanal === 'object') ? global.rcanal : {})
    
    // --- 1. Verificación de Argumentos ---
    if (!text) return m.reply(
        `╭─「 ⓘ PROTOCOLO DE INVOCACIÓN 」
│
│ Se requiere una directriz de búsqueda
│ para ejecutar el protocolo Híbrido.
│
│ **Formatos de Ejecución:**
│ ├ ${usedPrefix + command} [Consulta]
│ ├ ${usedPrefix + command} [Consulta] [Número]
│ └ ${usedPrefix + command} [Consulta] all
│
│ Ejemplos:
│ ├ ${usedPrefix + command} nodejs streams 12
│ └ ${usedPrefix + command} arquitectura limpia all
╰─◉`, m, ctx)
    
    // --- 2. Procesamiento de la Solicitud ---
    const parts = text.trim().split(/\s+/)
    let last = parts[parts.length - 1]?.toLowerCase()
    let requested
    if (/^\d+$/.test(last)) { requested = parseInt(last, 10); parts.pop() } else if (['all', 'todo', 'todos'].includes(last)) { requested = HARD_MAX; parts.pop() } else { requested = DEFAULT_MAX }
    if (requested <= 0) requested = DEFAULT_MAX
    if (requested > HARD_MAX) requested = HARD_MAX
    const query = parts.join(' ').trim()
    if (!query) return m.reply('╭─「 ❗ ADVERTENCIA 」\n│\n│ La cadena de búsqueda resulta vacía.\n╰─◉', m, ctx)
    
    let status
    try {
        // Indicador de Progreso
        status = await conn.reply(m.chat, 
            `╭─「 🔍 INICIANDO RECONOCIMIENTO HÍBRIDO 」
│
│ **Objetivo:** ${query}
│ **Límite de Unidades:** ${requested}
│
│ Por favor, mantenga la espera...
╰─◉`, m, ctx)
        
        // --- 3. Ejecución de la Búsqueda ---
        const results = await hybridSearch(query, requested)
        
        // --- 4. Verificación de Resultados ---
        if (!results.length) return conn.reply(m.chat, 
            `╭─「 ❌ FRACASO EN EL DESPLIEGUE 」
│
│ No se hallaron resultados útiles o
│ dominios relevantes para el objetivo.
╰─◉`, m, { quoted: fkontak, ...ctx })
        
        // --- 5. Formatear y Presentar Informe ---
        const lines = results.map(r => `*${r.idx}.* ${r.title || 'Título No Asignado'}\n${r.link}${r.snippet ? `\n_Resumen: ${r.snippet.slice(0, 180)}_` : ''}`)
        
        const header = `╭─「 ✅ INFORME DE RESULTADOS (WEB) 」
│
│ **Unidades Reportadas:** (${results.length})
│ **Término Raíz:** ${query}
│
│ ${lines.join('\n│\n')}`
        
        const body = header + '\n╰─◉'

        // Manejo de Mensajes Extensos
        if (body.length > 4000) {
            await conn.reply(m.chat, `╭─「 ⚠️ ADVERTENCIA DE TRANSMISIÓN 」\n│\n│ El informe supera el límite de protocolo.\n│ Se enviará en segmentos discretos.\n╰─◉`, m, ctx)
            const chunks = []
            let tmp = body
            while (tmp.length) {
                chunks.push(tmp.slice(0, 3500))
                tmp = tmp.slice(3500)
            }
            for (let i = 0; i < chunks.length; i++) {
                await conn.reply(m.chat, chunks[i] + `\n_[Segmento ${i + 1}/${chunks.length}]_`, m, { quoted: fkontak, ...ctx })
                await sleep(400)
            }
        } else {
            await conn.reply(m.chat, body, m, { quoted: fkontak, ...ctx })
        }
    } catch (e) {
        // --- 6. Manejo de Errores Críticos ---
        console.error('[gweb] Error comando:', e)
        return conn.reply(m.chat, 
            `╭─「 🚨 FALLA DE COMUNICACIÓN (X) 」
│
│ Una interrupción crítica se manifestó.
│ Detalle del error: ${e.message || e}
╰─◉`, m, ctx)
    } finally {
        // Eliminación del indicador de espera
        if (status?.key) { try { await conn.sendMessage(m.chat, { delete: status.key }) } catch {} }
    }
}

handler.help = ['gweb']
handler.tags = ['buscador']
handler.command = /^(gweb|google|ghybrid|websearch)$/i

export default handler
