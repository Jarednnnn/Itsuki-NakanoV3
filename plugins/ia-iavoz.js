import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('Escribe algo')
  
  const key = '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'
  
  // 1. IA Groq
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
        content: 'Eres C.C. Responde natural.'
      }, {
        role: 'user',
        content: text
      }],
      max_tokens: 25
    })
  })
  
  const aiData = await aiRes.json()
  const respuesta = aiData.choices[0].message.content
  
  // 2. TTS que FUNCIONA SEGURO (Azure Cognitive Services demo)
  const ttsUrl = `https://cxl-services.appspot.com/proxy?url=https://eastus.tts.speech.microsoft.com/cognitiveservices/v1&text=${encodeURIComponent(respuesta)}`
  
  // 3. ENVIAR - SI FALLA, ENVIAR TEXTO
  try {
    await conn.sendMessage(m.chat, {
      audio: { url: ttsUrl },
      mimetype: 'audio/mpeg',
      ptt: false
    }, { quoted: m })
  } catch (e) {
    // SI TODO FALLA, SOLO TEXTO
    await conn.reply(m.chat, `C.C.: ${respuesta}`, m)
  }
}

handler.help = ['cc']
handler.tags = ['ia']
handler.command = ['cc']
export default handler
