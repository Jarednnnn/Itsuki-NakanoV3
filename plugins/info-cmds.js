let handler = async (m, { conn, usedPrefix }) => {
  const ctxOk = (global.rcanalr || {})

  try {
    let totalCommands = 0
    let uniqueCommands = new Set()

    if (global.plugins) {
      Object.values(global.plugins).forEach(plugin => {
        if (plugin.command && Array.isArray(plugin.command)) {
          plugin.command.forEach(cmd => {
            uniqueCommands.add(cmd)
          })
        }
      })
      totalCommands = uniqueCommands.size
    }

    if (totalCommands === 0) {
      if (global.handler && global.handler.commands) {
        totalCommands = Object.keys(global.handler.commands).length
      } else {
        totalCommands = "Múltiples"
      }
    }

    const message = `
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ⓘ REGISTRO DE COMANDOS ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

Comandos disponibles: ${totalCommands}

Usa ${usedPrefix}menu para acceder al registro completo.

"Ara te amo :3."
`.trim()

    await conn.reply(m.chat, message, m, ctxOk)

  } catch (error) {
    console.error('Error en comando total:', error)
    await conn.reply(m.chat, 
`┏━━━━━━━━━━━━━━━━━━━━━┓
┃  ⓘ REGISTRO ┃
┗━━━━━━━━━━━━━━━━━━━━━┛

Órdenes disponibles: Múltiples

Usa ${usedPrefix}menu para ver todas las órdenes.

"Cristian me come toda la verga."`, 
      m, ctxOk
    )
  }
}

handler.help = ['total', 'comandos']
handler.tags = ['info']
handler.command = ['total', 'comandos', 'totalcomandos']

export default handler
