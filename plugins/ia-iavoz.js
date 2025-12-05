import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('Escribe algo')
  
  // 1. IA Groq
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
  
  // 2. TTS que SÍ funciona (Edge TTS - gratis)
  const ttsUrl = `https://api.streamelements.com/kappa/v2/speech?voice=Brian&text=${encodeURIComponent(respuesta)}`
  
  await conn.sendMessage(m.chat, {
    audio: { url: ttsUrl },
    mimetype: 'audio/mpeg',
    ptt: false
  }, { quoted: m })
}

handler.help = ['cc']
handler.tags = ['ia']
handler.command = ['cc']
export default handler
