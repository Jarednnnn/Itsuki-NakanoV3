import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('Escribe algo')
  
  // 1. Primero IA Groq (gratis, tuya)
  const key = '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'
  
  const aiRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{
        role: 'system', 
        content: 'Eres C.C. Responde breve.'
      }, {
        role: 'user',
        content: text
      }],
      max_tokens: 30
    })
  })
  
  const aiData = await aiRes.json()
  const respuesta = aiData.choices[0].message.content
  
  // 2. Intentar con API (probablemente falle sin key)
  const url = `https://api-adonix.ultraplus.click/ai/iavoz?apikey=${global.apikey || 'demo'}&q=${encodeURIComponent(respuesta)}&voice=Esperanza`
  
  try {
    await conn.sendMessage(m.chat, {
      audio: { url },
      mimetype: 'audio/mpeg',
      ptt: false
    }, { quoted: m })
  } catch {
    // Si falla, solo texto
    await conn.reply(m.chat, `C.C.: ${respuesta}`, m)
  }
}

handler.command = ['cc']
export default handler
