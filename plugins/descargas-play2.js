import yts from 'yt-search'    
import fetch from 'node-fetch'    

async function apiAdonix(url) {    
  const apiURL = `https://api-adonix.ultraplus.click/download/ytmp4?apikey=${global.apikey}&url=${encodeURIComponent(url)}`    
  const res = await fetch(apiURL)    
  const data = await res.json()    

  if (!data.status || !data.data?.url) throw new Error('API Adonix no devolvió datos válidos')    
  return { url: data.data.url, title: data.data.title || 'Video sin título XD', fuente: 'Adonix' }    
}    

async function apiMayAPI(url) {
  const apiURL = `https://mayapi.ooguy.com/ytdl?url=${encodeURIComponent(url)}&type=mp4&apikey=${global.APIKeys['https://mayapi.ooguy.com']}`
  const res = await fetch(apiURL)
  const data = await res.json()

  if (!data.status || !data.result?.url) throw new Error('API MayAPI no devolvió datos válidos')
  return { url: data.result.url, title: data.result.title || 'Video sin título XD', fuente: 'MayAPI' }
}

async function ytdl(url) {    
  try {    
    console.log('🎬 Intentando con API Adonix...')    
    return await apiAdonix(url)    
  } catch (e1) {    
    console.warn('⚠️ Falló Adonix:', e1.message)    
    console.log('🎞️ Intentando con API MayAPI de respaldo...')    
    return await apiMayAPI(url)    
  }    
}    

let handler = async (m, { conn, text, usedPrefix }) => {    
  const ctxErr = (global.rcanalx || {})    
  const ctxWarn = (global.rcanalw || {})    
  const ctxOk = (global.rcanalr || {})    

  if (!text) {    
    await m.react('❓')
    return conn.reply(m.chat, 
      `> \`📹 DESCARGAR VIDEO\` 🍙\n\n` +
      `> \`📝 Uso:\`\n` +
      `> \`• ${usedPrefix}play2 <nombre de la canción>\`\n\n` +
      `> \`💡 Ejemplo:\`\n` +
      `> \`• ${usedPrefix}play2 spy x family opening\`\n\n` +
      `> \`🎯 Formato:\`\n` +
      `> \`🎥 Video MP4 de alta calidad\`\n\n` +
      `> \`📚 "¡Disfruta tus videos con Itsuki Nakano!"\` ✨`,
      m, ctxWarn
    )    
  }    

  try {    
    await m.react('🕑')

    const searchResults = await yts(text)    
    if (!searchResults.videos.length) {
      await m.react('❌')
      throw new Error('No se encontraron resultados')    
    }

    const video = searchResults.videos[0]    
    const { url, title, fuente } = await ytdl(video.url)    

    const caption = 
      `> \`🌸✨ VIDEO ENCONTRADO\` 🍙\n\n` +
      `> \`💖 Título:\` ${title}\n` +
      `> \`🕑 Duración:\` ${video.timestamp}\n` +
      `> \`👤 Autor:\` ${video.author.name}\n` +
      `> \`🔗 URL:\` ${video.url}\n` +
      `> \`🌐 API:\` ${fuente}\n\n` +
      `> \`📚 "¡Disfruta y no olvides sonreír!"\` ✨\n` +
      `> \`🍱 "Gracias por elegirme para tus descargas"\` 🌸`

    const buffer = await fetch(url).then(res => res.buffer())    

    await m.react('✅')
    await conn.sendMessage(    
      m.chat,    
      {    
        video: buffer,    
        mimetype: 'video/mp4',    
        fileName: `${title}.mp4`,    
        caption    
      },    
      { quoted: m }    
    )    

  } catch (e) {    
    console.error('❌ Error en play2:', e)    
    await m.react('❌')
    await conn.reply(m.chat, 
      `> \`❌ ERROR EN DESCARGA\` 🍙\n\n` +
      `> \`📚 Problema:\` ${e.message}\n\n` +
      `> \`🍙 "Lo siento, no pude encontrar tu video"\` ✨`,
      m, ctxErr
    )    
  }    
}    

handler.help = ['play2']    
handler.tags = ['downloader']    
handler.command = ['play2']
handler.group = true    

export default handler