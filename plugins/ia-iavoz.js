import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('Escribe algo')
  
  const apiKey = '62d734ca543945338b343d3b6a88776f'
  const url = `http://api.voicerss.org/?key=${apiKey}&hl=es-es&v=Mia&src=${encodeURIComponent(text)}`
  
  try {
    const res = await fetch(url)
    const audioBuffer = await res.arrayBuffer()
    
    await conn.sendMessage(m.chat, {
      audio: Buffer.from(audioBuffer),
      mimetype: 'audio/mpeg'
    }, { quoted: m })
    
  } catch (e) {
    m.reply('Error: ' + e.message)
  }
}

handler.help = ['iavoz <texto>']
handler.tags = ['ia']
handler.command = ['iavoz']
export default handler
