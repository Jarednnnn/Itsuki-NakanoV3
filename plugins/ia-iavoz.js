import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('*╭━━[ C.C. - La Inmortal ]━━⬣*\n*┃*\n*┃🧀 Dime qué quieres que diga...*\n*┃📝 Ejemplo: .cc ¿Un contrato, Lelouch?*\n*┃*\n*╰━━━━━━━━━━━━━━━━━━⬣*')

  const apiKey = '62d734ca543945338b343d3b6a88776f'
  
  const params = new URLSearchParams({
    key: apiKey,
    hl: 'es-es',
    v: 'Conchita',
    c: 'MP3',
    f: '44khz_16bit_stereo',
    src: text
  })

  const url = `http://api.voicerss.org/?${params}`

  try {
    m.reply('*🧀 C.C. está preparando sus palabras...*')
    
    const res = await fetch(url)
    if (!res.ok) throw new Error('Error al generar el audio.')

    const audioBuffer = await res.arrayBuffer()

    await conn.sendMessage(m.chat, {
      audio: Buffer.from(audioBuffer),
      mimetype: 'audio/mpeg',
      ptt: false
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply('*╭━━[ 🧀 Error ]━━⬣*\n*┃*\n*┃❌ El contrato de voz falló*\n*┃💡 Revisa tu conexión*\n*┃*\n*╰━━━━━━━━━━━━━━━━━━⬣*')
  }
}

handler.help = ['cc <texto>']
handler.tags = ['fun']
handler.command = ['cc', 'c2']

export default handler
