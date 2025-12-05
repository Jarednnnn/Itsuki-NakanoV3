import { convertAndDownload } from '../lib/cnvDownloader.js'

const MAX_FILE_BYTES = 70 * 1024 * 1024
const AUDIO_COMMANDS = ['ytmp3', 'yta', 'ytaudio', 'yt2']
const VIDEO_COMMANDS = ['ytmp4', 'ytv', 'ytvideo']

let handler = async (m, { conn, args, text, usedPrefix, command }) => {
  const rawInput = (text || '').trim()
  const lowerCommand = (command || '').toLowerCase()
  const isAudioCommand = AUDIO_COMMANDS.includes(lowerCommand)
  const isVideoCommand = VIDEO_COMMANDS.includes(lowerCommand)
  const mode = isVideoCommand ? 'video' : 'audio'
  const isAudio = mode === 'audio'

  // Verificar si hay input
  if (!rawInput) {
    await tryReact(m, '❌')
    return conn.reply(m.chat,
`┏━━━━━━━━━━━━━━━━━━━━━┓
┃  ⓘ INSTRUCCIONES ┃
┗━━━━━━━━━━━━━━━━━━━━━┛

> Envíe un enlace de YouTube.

> Formato: ${usedPrefix + command} <enlace>
> Ejemplo: ${usedPrefix + command} https://youtube.com/watch?v=...

> Calidad opcional: ${usedPrefix + command} <enlace> | 320
> (320, 256, 128 para audio / 720, 480, 360 para video)`, m)
  }

  let linkPart = rawInput
  let qualityPart = ''

  if (rawInput.includes('|')) {
    const parts = rawInput.split('|')
    linkPart = (parts[0] || '').trim()
    qualityPart = (parts[1] || '').trim()
  } else if (args.length > 1) {
    linkPart = args[0]
    qualityPart = args.slice(1).join(' ')
  }

  // Verificar si parece un enlace (no solo texto)
  if (!linkPart.match(/^(https?:\/\/|www\.|youtu\.be\/|youtube\.com\/)/i)) {
    await tryReact(m, '❌')
    return conn.reply(m.chat,
`┏━━━━━━━━━━━━━━━━━━━━━┓
┃  ⓘ ENLACE INVÁLIDO ┃
┗━━━━━━━━━━━━━━━━━━━━━┛

> El enlace proporcionado no es válido.
> Debe ser un enlace de YouTube.

> Ejemplos válidos:
> • https://youtube.com/watch?v=...
> • https://youtu.be/...
> • https://www.youtube.com/...`, m)
  }

  const format = isAudio ? 'mp3' : 'mp4'
  let audioBitrate = '320'
  let videoQuality = '720'

  if (qualityPart) {
    if (isAudio) audioBitrate = qualityPart.toLowerCase()
    else videoQuality = qualityPart.toLowerCase()
  }

  await tryReact(m, '⏳')

  try {
    const result = await convertAndDownload(linkPart, {
      format,
      audioBitrate,
      videoQuality
    })

    if (result.size && result.size > MAX_FILE_BYTES) {
      await tryReact(m, '✖️')
      return conn.reply(m.chat,
`┏━━━━━━━━━━━━━━━━━━━━━┓
┃  ⓘ ARCHIVO DEMASIADO GRANDE ┃
┗━━━━━━━━━━━━━━━━━━━━━┛

> El archivo excede el límite de 70MB.
> Intenta con un video más corto o menor calidad.`, m)
    }

    const fileName = result.fileName || result.filename || `yt.${isAudio ? 'mp3' : 'mp4'}`
    
    let delivered = false
    
    if (isAudio) {
      try {
        await conn.sendMessage(
          m.chat,
          { 
            audio: result.buffer, 
            mimetype: 'audio/mpeg',
            fileName: fileName,
            ptt: false 
          },
          { quoted: m }
        )
        delivered = true
      } catch (audioErr) {
        console.error('Error enviando audio:', audioErr)
      }
    } else {
      try {
        await conn.sendMessage(
          m.chat,
          { 
            video: result.buffer, 
            mimetype: 'video/mp4',
            fileName: fileName
          },
          { quoted: m }
        )
        delivered = true
      } catch (videoErr) {
        console.error('Error enviando video:', videoErr)
        try {
          await conn.sendMessage(
            m.chat,
            {
              document: result.buffer,
              mimetype: 'video/mp4',
              fileName: fileName
            },
            { quoted: m }
          )
          delivered = true
        } catch (docErr) {
          console.error('Error enviando documento:', docErr)
        }
      }
    }

    if (!delivered) {
      await tryReact(m, '✖️')
      return conn.reply(m.chat,
`┏━━━━━━━━━━━━━━━━━━━━━┓
┃  ⓘ ERROR DE ENVÍO ┃
┗━━━━━━━━━━━━━━━━━━━━━┛

> No se pudo enviar el archivo.
> Verifica la conexión o intenta con otro video.`, m)
    }

    await tryReact(m, '✅')
  } catch (error) {
    console.error('Error en conversión:', error)
    await tryReact(m, '✖️')
    conn.reply(m.chat,
`┏━━━━━━━━━━━━━━━━━━━━━┓
┃  ⓘ ERROR DE CONVERSIÓN ┃
┗━━━━━━━━━━━━━━━━━━━━━┛

> No se pudo procesar el enlace.
> Causa: ${error.message || 'Enlace no válido o servicio no disponible.'}

> Verifica que el enlace sea de YouTube y esté activo.`, m)
  }
}

async function tryReact(m, emoji) {
  if (typeof m?.react !== 'function') return
  try {
    await m.react(emoji)
  } catch {}
}

handler.help = ['ytmp3 <enlace>', 'ytmp4 <enlace>']
handler.tags = ['downloader']
handler.command = /^(ytmp3|ytmp4)$/i

export default handler
