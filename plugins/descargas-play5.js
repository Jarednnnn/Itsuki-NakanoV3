import fetch from 'node-fetch';

const thumbnailUrl = 'https://cdn.russellxz.click/b317cef7.jpg'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    await conn.sendMessage(m.chat, { react: { text: '🎬', key: m.key } })
    return conn.reply(m.chat, 
`> 🎅 *¡NAVIDAD EN YOUTUBE!* 🎁

> 📺 *DESCARGADOR DE VIDEO NAVIDEÑO*

> ❌ *Uso incorrecto*

> \`\`\`Debes ingresar el nombre del video\`\`\`

> *Ejemplos navideños:*
> • ${usedPrefix + command} villancicos navideños
> • ${usedPrefix + command} canciones de navidad en video
> • ${usedPrefix + command} música navideña video

> 🎄 *¡Itsuki Nakano V3 descargará tu video!* 🎅`, m)
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '🕑', key: m.key } })

    // API de búsqueda
    const searchRes = await fetch(`https://sky-api-ashy.vercel.app/search/youtube?q=${encodeURIComponent(text)}`);
    const searchJson = await searchRes.json();

    if (!searchJson.status || !searchJson.result?.length) {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      return m.reply(`> 🎄 *¡NO ENCONTRADO!* 🎅

> ❌ *No se encontraron resultados para:* \`${text}\`

> 🎅 *Sugerencias:*
> • Verifica la ortografía
> • Intenta con términos más específicos
> • Prueba con otro nombre de video

> 🎄 *¡Itsuki Nakano V3 te ayuda!* 🎁`);
    }

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

    const video = searchJson.result[0];
    const { title, channel, duration, imageUrl, link } = video;

    const info = 
`> 🎄 *INFORMACIÓN DEL VIDEO* 🎅

> 🏷 *Título:*
\`\`\`${title}\`\`\`
> 👑 *Canal:*
\`\`\`${channel}\`\`\`
> ⏱️ *Duración:*
\`\`\`${duration}\`\`\`
> 🔗 *Enlace:*
\`\`\`${link}\`\`\`

> 🎅 *¡Itsuki Nakano V3 encontró tu video!* 🎄`;

    // Enviar información con la miniatura del video como imagen principal Y footer con thumbnailUrl
    await conn.sendMessage(m.chat, { 
      image: { url: imageUrl }, 
      caption: info,
      contextInfo: {
        externalAdReply: {
          title: `🎬 ${title.substring(0, 30)}...`,
          body: `⏱️ ${duration} • 👑 ${channel}`,
          mediaType: 1,
          previewType: 0,
          thumbnail: await (await fetch(thumbnailUrl)).buffer(),
          sourceUrl: link,
          mediaUrl: link
        }
      }
    }, { quoted: m });

    // API de video alternativa para evitar error JSON
    const videoRes = await fetch(`https://api.download-lagu-mp3.com/@api/button/mp4/${encodeURIComponent(link)}`);
    const videoHtml = await videoRes.text();
    
    // Extraer URL del video del HTML (método alternativo)
    const urlMatch = videoHtml.match(/href="(https:[^"]*\.mp4[^"]*)"/);
    if (!urlMatch || !urlMatch[1]) {
      throw new Error('No se pudo obtener el enlace de descarga del video');
    }

    const videoUrl = urlMatch[1];

    await conn.sendMessage(m.chat, { react: { text: '📥', key: m.key } })

    await conn.sendMessage(
      m.chat,
      {
        video: { url: videoUrl },
        fileName: `${title.substring(0, 50)}.mp4`,
        mimetype: 'video/mp4',
        caption: `> 🎄 *VIDEO NAVIDEÑO DESCARGADO* 🎅

> 🏷 *Título:*
\`\`\`${title}\`\`\`
> 🌌 *Calidad:*
\`\`\`360p\`\`\`

> 🎁 *¡Disfruta de tu contenido navideño!*
> 🎅 *Itsuki Nakano V3 te desea felices fiestas* 🎄`,
        contextInfo: {
          externalAdReply: {
            title: `✅ Video Descargado`,
            body: `🎬 ${title.substring(0, 25)}...`,
            mediaType: 1,
            previewType: 0,
            thumbnail: await (await fetch(thumbnailUrl)).buffer(),
            sourceUrl: link,
            mediaUrl: link
          }
        }
      },
      { quoted: m }
    );

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

  } catch (e) {
    console.error('🎄 Error en play5:', e);
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    
    let errorMessage = `> 🎄 *¡ERROR NAVIDEÑO!* 🎅

> ❌ *Error al procesar tu solicitud*

> 📝 *Detalles:*
\`\`\`${e.message}\`\`\``;

    // Mensaje específico para error JSON
    if (e.message.includes('Unexpected token') || e.message.includes('JSON')) {
      errorMessage += `

> 🔧 *Error de API:*
> • La API de descarga no respondió correctamente
> • Se intentó método alternativo pero falló`;
    }

    errorMessage += `

> 🎅 *Sugerencias:*
> • Verifica tu conexión a internet
> • Intenta con otro nombre de video
> • El video podría estar restringido
> • Espera unos minutos y vuelve a intentar

> 🎄 *¡Itsuki Nakano V3 está aquí para ayudarte!* 🎁`;

    m.reply(errorMessage);
  }
};

handler.command = ['play5'];
handler.tags = ['downloader'];
handler.help = ['play5'];
handler.group = true;

export default handler;