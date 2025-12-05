import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('🧀 *Escribe algo*')
  
  // TU NUEVA KEY
  const DEEPSEEK_API_KEY = 'sk-6ec6c48f041c4f7da3d012883ab871a9'
  
  try {
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
          content: 'Eres C.C. de Code Geass, la chica inmortal. Responde en máximo 15 palabras. Tono misterioso, habla de contratos, Lelouch, pizza y el Geass.'
        }, {
          role: 'user',
          content: text.substring(0, 100)
        }],
        max_tokens: 50,
        temperature: 0.8
      })
    })
    
    const data = await response.json()
    console.log('DeepSeek response:', data)
    
    const respuesta = data.choices?.[0]?.message?.content || `¿${text}? Interesante propuesta...`
    
    const ttsUrl = `https://translate.google.com/translate_tts?tl=es&q=${encodeURIComponent(respuesta)}`
    
    await conn.sendMessage(m.chat, {
      audio: { url: ttsUrl },
      mimetype: 'audio/mpeg'
    }, { quoted: m })
    
  } catch (e) {
    console.error('Error:', e)
    m.reply(`Error: ${e.message}`)
  }
}

handler.command = ['cc']
export default handler
