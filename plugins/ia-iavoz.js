import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('Escribe algo')
  
  const key = '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'
  
  // IA más natural
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{
        role: 'system', 
        content: 'Eres C.C., personaje de Code Geass. Responde breve y natural, no exageres. Eres tranquila y misteriosa.'
      }, {
        role: 'user',
        content: text
      }],
      max_tokens: 35,
      temperature: 0.7
    })
  })
  
  const data = await res.json()
  const respuesta = data.choices?.[0]?.message?.content || '...'
  
  // Prueba con TTS diferente
  try {
    // Intento 1: TTS ElevenLabs (gratis limitado)
    const ttsUrl = `https://api.elevenlabs.io/v1/text-to-speech/TX3LPaxmHKxFdv7VOQHJ?api_key=sk_6cee06ccd7a0f59a00d6bb8c7c03e5cc5e66f4e5c9d2c2f8`
    
    const ttsRes = await fetch('https://api.elevenlabs.io/v1/text-to-speech/TX3LPaxmHKxFdv7VOQHJ', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': 'sk_6cee06ccd7a0f59a00d6bb8c7c03e5cc5e66f4e5c9d2c2f8'
      },
      body: JSON.stringify({
        text: respuesta.substring(0, 100),
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      })
    })
    
    if (ttsRes.ok) {
      const audioBuffer = await ttsRes.arrayBuffer()
      await conn.sendMessage(m.chat, {
        audio: Buffer.from(audioBuffer),
        mimetype: 'audio/mpeg'
      }, { quoted: m })
      return
    }
    
  } catch (e) {
    console.log('ElevenLabs falló:', e.message)
  }
  
  // Si no funciona TTS, enviar texto
  await conn.reply(m.chat, `C.C.: ${respuesta}`, m)
}

handler.command = ['cc']
export default handler
