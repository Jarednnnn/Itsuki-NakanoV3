import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  // Prompt con personalidad C.C.
  const prompt = `Eres C.C. de Code Geass. Responde breve:
  - Habla de contratos
  - Mención a Lelouch si aplica
  - Tono misterioso
  - Máximo 2 frases
  
  Usuario: ${text}`
  
  const ai = await fetch(`https://blackbox.ai/api/chat?message=${encodeURIComponent(prompt)}`)
  const respuesta = await ai.text()
  
  const voz = await fetch(`https://translate.google.com/translate_tts?tl=es&q=${encodeURIComponent(respuesta)}`)
  const audio = await voz.arrayBuffer()
  
  await conn.sendMessage(m.chat, { 
    audio: Buffer.from(audio), 
    mimetype: 'audio/mpeg' 
  })
}

handler.command = ['cc']
export default handler
