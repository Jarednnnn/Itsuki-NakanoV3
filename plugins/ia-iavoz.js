import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('🧀 *Escribe algo*')
  
  // TU API KEY de DeepSeek
  const DEEPSEEK_API_KEY = 'sk-13f9a46d1da34c6a94551eb056d4af6d'
  
  try {
    // DeepSeek API
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{
          role: 'system', 
          content: 'Eres C.C. de Code Geass. Responde máximo 2 frases. Habla de contratos, Lelouch, pizza y el Geass. Tono misterioso.'
        }, {
          role: 'user',
          content: text
        }],
        max_tokens: 80,
        temperature: 0.7
      })
    })
    
    if (!response.ok) throw new Error(`API: ${response.status}`)
    
    const data = await response.json()
    const respuesta = data.choices?.[0]?.message?.content || `¿${text}? Hablemos de contratos.`
    
    // Google TTS
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=es&q=${encodeURIComponent(respuesta)}`
    
    await conn.sendMessage(m.chat, {
      audio: { url: ttsUrl },
      mimetype: 'audio/mpeg'
    }, { quoted: m })
    
  } catch (e) {
    console.error('Error DeepSeek:', e)
    
    // Fallback simple
    const fallback = `Como C.C. diría: "${text}" tiene potencial para un contrato.`
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=es&q=${encodeURIComponent(fallback)}`
    
    await conn.sendMessage(m.chat, {
      audio: { url: ttsUrl },
      mimetype: 'audio/mpeg'
    }, { quoted: m })
  }
}

handler.help = ['cc <texto>']
handler.tags = ['ia']
handler.command = ['cc', 'c2']
export default handler
