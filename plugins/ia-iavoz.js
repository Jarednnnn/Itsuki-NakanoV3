import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('🧀 *Escribe algo para C.C.*')

  try {
    // 1. IA de texto (Blackbox)
    const aiRes = await fetch(`https://blackbox.ai/api/chat?message=${encodeURIComponent(text + " (responde como C.C. de Code Geass)")}`)
    const respuesta = await aiRes.text()
    
    // Limpiar respuesta
    let respuestaLimpia = respuesta.substring(0, 100).replace(/\n/g, ' ').trim()
    if (!respuestaLimpia) respuestaLimpia = "Los contratos requieren claridad..."
    
    // 2. Google TTS (compatible WhatsApp)
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=es&q=${encodeURIComponent(respuestaLimpia)}`
    
    await conn.sendMessage(m.chat, {
      audio: { url: ttsUrl },
      mimetype: 'audio/mpeg',
      fileName: 'cc_voz.mp3'
    }, { quoted: m })
    
  } catch (e) {
    console.error(e)
    // Fallback: solo repetir texto con TTS
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=es&q=${encodeURIComponent(text)}`
    
    await conn.sendMessage(m.chat, {
      audio: { url: ttsUrl },
      mimetype: 'audio/mpeg',
      fileName: 'voz.mp3'
    }, { quoted: m })
  }
}

handler.help = ['cc <texto>']
handler.tags = ['fun']
handler.command = ['cc', 'c2']

export default handler
