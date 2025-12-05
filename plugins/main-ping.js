let handler = async (m, { conn }) => {
  try {
    await conn.sendMessage(m.chat, { react: { text: '🕑', key: m.key } })

    const start = Date.now()

    await conn.sendMessage(m.chat, { react: { text: '⚡️', key: m.key } })

    const end = Date.now()
    const ping = end - start

    let speed, status
    if (ping < 100) {
      speed = '🚀 Extremadamente Rápido'
      status = '🟢 Excelente'
    } else if (ping < 300) {
      speed = '⚡ Muy Rápido'
      status = '🟡 Óptimo'
    } else if (ping < 600) {
      speed = '🏓 Rápido'
      status = '🟡 Bueno'
    } else if (ping < 1000) {
      speed = '📶 Normal'
      status = '🟠 Estable'
    } else {
      speed = '🐢 Lento'
      status = '🔴 Regular'
    }

    const uptime = process.uptime()
    const hours = Math.floor(uptime / 3600)
    const minutes = Math.floor((uptime % 3600) / 60)
    const seconds = Math.floor(uptime % 60)
    const uptimeString = `${hours}h ${minutes}m ${seconds}s`

    const pingMessage = `> *𝐋𝐞𝐥𝐨𝐮𝐜𝐡 𝐯𝐢 𝐁𝐫𝐢𝐭𝐚𝐧𝐧𝐢𝐚 - P I N G*  

> *\`Ping:\` ${ping} ms*
> *\`Velocidad:\` ${speed}*
> *\`Estado:\` ${status}*
> *\`Uptime:\` ${uptimeString}*

> *Desarrollado por Jared*`

    await conn.reply(m.chat, pingMessage, m)
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

  } catch (error) {
    console.error('Error en ping:', error)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    await conn.reply(m.chat, 
      `> *ERROR*
\`No se pudo calcular el ping\``, m)
  }
}

handler.help = ['ping']
handler.tags = ['main']
handler.command = ['p', 'ping']

export default handler
