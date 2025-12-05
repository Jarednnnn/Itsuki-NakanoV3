let handler = async (m, { conn, args, usedPrefix, command, isAdmin, isBotAdmin, participants }) => {
  const ctxOk = (global.rcanalr || {})

  const isClose = {
    'open': 'not_announcement',
    'close': 'announcement',
    'abierto': 'not_announcement',
    'cerrado': 'announcement',
    'abrir': 'not_announcement',
    'cerrar': 'announcement',
    'desbloquear': 'unlocked',
    'bloquear': 'locked'
  }[(args[0] || '').toLowerCase()]

  // Mostrar botones si no hay argumento
  if (isClose === undefined) {
    await conn.sendMessage(m.chat, {
      text: `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ⓘ CONFIGURACIÓN DE GRUPO ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

> Seleccione una opción:`,
      footer: 'Gestión del grupo',
      buttons: [
        { buttonId: `${usedPrefix + command} abrir`, buttonText: { displayText: '🔓 Abrir' }, type: 1 },
        { buttonId: `${usedPrefix + command} cerrar`, buttonText: { displayText: '🔒 Cerrar' }, type: 1 },
        { buttonId: `${usedPrefix + command} bloquear`, buttonText: { displayText: '🚫 Bloquear' }, type: 1 },
        { buttonId: `${usedPrefix + command} desbloquear`, buttonText: { displayText: '✅ Desbloquear' }, type: 1 }
      ],
      headerType: 4
    }, { quoted: m })
    return
  }

  // Ejecutar acción
  await conn.groupSettingUpdate(m.chat, isClose)

  let message = ''
  if (args[0].toLowerCase() === 'cerrar' || args[0].toLowerCase() === 'close' || args[0].toLowerCase() === 'cerrado') {
    message = '┏━━━━━━━━━━━━━━━━━━━━━┓\n┃  ⓘ GRUPO CERRADO ┃\n┗━━━━━━━━━━━━━━━━━━━━━┛\n\n> Grupo cerrado correctamente.'
  } else if (args[0].toLowerCase() === 'abrir' || args[0].toLowerCase() === 'open' || args[0].toLowerCase() === 'abierto') {
    message = '┏━━━━━━━━━━━━━━━━━━━━━┓\n┃  ⓘ GRUPO ABIERTO ┃\n┗━━━━━━━━━━━━━━━━━━━━━┛\n\n> Grupo abierto correctamente.'
  } else if (args[0].toLowerCase() === 'bloquear' || args[0].toLowerCase() === 'locked') {
    message = '┏━━━━━━━━━━━━━━━━━━━━━┓\n┃  ⓘ GRUPO BLOQUEADO ┃\n┗━━━━━━━━━━━━━━━━━━━━━┛\n\n> Grupo bloqueado correctamente.'
  } else if (args[0].toLowerCase() === 'desbloquear' || args[0].toLowerCase() === 'unlocked') {
    message = '┏━━━━━━━━━━━━━━━━━━━━━┓\n┃  ⓘ GRUPO DESBLOQUEADO ┃\n┗━━━━━━━━━━━━━━━━━━━━━┛\n\n> Grupo desbloqueado correctamente.'
  } else {
    message = '┏━━━━━━━━━━━━━━━━━━━━━┓\n┃  ⓘ CONFIGURADO ┃\n┗━━━━━━━━━━━━━━━━━━━━━┛\n\n> Configuración aplicada.'
  }

  conn.reply(m.chat, message, m, ctxOk)
}

handler.help = ['group [abrir/cerrar/bloquear/desbloquear]']
handler.tags = ['grupo']
handler.command = ['group', 'grupo', 'cerrar', 'abrir']
handler.admin = true
handler.botAdmin = true

export default handler
