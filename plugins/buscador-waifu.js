import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix, command }) => {
  try {
    await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } })
    
    conn.reply(m.chat,
`┏━━━━━━━━━━━━━━━━━━━━━┓
┃  ⓘ BUSCANDO ┃
┗━━━━━━━━━━━━━━━━━━━━━┛

> Buscando waifu aleatoria...`, m)

    let res = await fetch('https://api.waifu.pics/sfw/waifu')
    if (!res.ok) {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      return conn.reply(m.chat,
`┏━━━━━━━━━━━━━━━━━━━━━┓
┃  ⓘ ERROR ┃
┗━━━━━━━━━━━━━━━━━━━━━┛

> Error al conectar con la API.
> Intenta nuevamente.`, m)
    }

    let json = await res.json()
    if (!json.url) {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      return conn.reply(m.chat,
`┏━━━━━━━━━━━━━━━━━━━━━┓
┃  ⓘ ERROR ┃
┗━━━━━━━━━━━━━━━━━━━━━┛

> No se recibió imagen válida.
> Intenta nuevamente.`, m)
    }

    await conn.sendFile(m.chat, json.url, 'waifu.jpg',
`┏━━━━━━━━━━━━━━━━━━━━━┓
┃  ⓘ WAIFU ENCONTRADA ┃
┗━━━━━━━━━━━━━━━━━━━━━┛

> Waifu aleatoria generada.
> Fuente: api.waifu.pics`, m)

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
  } catch (e) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    console.error(e)
  }
}

handler.help = ['waifu']
handler.tags = ['gacha']
handler.command = ['waifu']
handler.group = true
handler.register = true

export default handler
