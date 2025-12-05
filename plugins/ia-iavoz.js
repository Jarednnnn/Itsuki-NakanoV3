import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('*╭━━[ C.C. - La Inmortal ]━━⬣*\n*┃*\n*┃🧀 Dime qué quieres que diga...*\n*┃📝 Ejemplo: .iavoz ¿Un contrato, Lelouch?*\n*┃*\n*╰━━━━━━━━━━━━━━━━━━⬣*')

  const apiKey = '62d734ca543945338b343d3b6a88776f'
  
  // FORMATO COMPATIBLE CON WHATSAPP
  const params = new URLSearchParams({
    key: apiKey,
    hl: 'es-es',
    v: 'Conchita',
    c: 'MP3',          // MP3 funciona mejor
    f: '16khz_16bit_mono', // WhatsApp prefiere mono
    src: text
  })

  const url = `http://api.voicerss.org/?${params}`

  try {
    m.reply('*🧀 C.C. está preparando sus palabras...*')
    
    const res = await fetch(url)
    if (!res.ok) throw new Error('Error API: ' + res.status)

    const audioBuffer = await res.arrayBuffer()
    
    // ENVIAR COMO AUDIO NORMAL (no PTT)
    await conn.sendMessage(m.chat, {
      audio: Buffer.from(audioBuffer),
      mimetype: 'audio/mpeg',
      fileName: 'cc_voice.mp3'
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply('*╭━━[ 🧀 Error ]━━⬣*\n*┃*\n*┃❌ Error: ' + (e.message || 'Desconocido') + '*\n*┃💡 Intenta con menos texto*\n*┃*\n*╰━━━━━━━━━━━━━━━━━━⬣*')
  }
}

handler.help = ['iavoz <texto>']
handler.tags = ['ia']
handler.command = ['c.c']

export default handler
