let handler = async (m, { conn, text, isBotAdmin, isAdmin }) => {
  const ctxErr = (global.rcanalx || {})
  const ctxWarn = (global.rcanalw || {})
  const ctxOk = (global.rcanalr || {})

  if (!m.isGroup) return conn.reply(m.chat, ' ⓘ Este comando solo funciona en grupos.', m, ctxErr)
  if (!isAdmin) return conn.reply(m.chat, ' ⓘ Necesitas ser administrador.', m, ctxErr)
  if (!isBotAdmin) return conn.reply(m.chat, ' ⓘ Necesito ser administrador.', m, ctxErr)

  if (!text) {
    return conn.reply(m.chat, `
 ⓘ Uso del comando:

• !add <número>
• !add @usuario
• !add (respondiendo a un mensaje)

 ⓘ Ejemplos:
• !add 51987654321
• !add @usuario
• !add 51999999999,51888888888

ⓘ Funciones de Lelouch:
ⓘ Agregar contactos directamente
ⓘ Enviar enlace a no contactos
ⓘ Múltiples números separados por coma
    `.trim(), m, ctxWarn)
  }

  try {
    let groupCode = await conn.groupInviteCode(m.chat)
    let inviteLink = `https://chat.whatsapp.com/${groupCode}`
    let groupName = (await conn.groupMetadata(m.chat)).subject || 'el grupo'

    let numbers = []

    if (m.mentionedJid && m.mentionedJid.length > 0) {
      numbers = m.mentionedJid
    } else if (m.quoted) {
      numbers = [m.quoted.sender]
    } else if (text) {
      numbers = text.split(',').map(num => {
        let number = num.trim().replace(/[^0-9]/g, '')
        if (number.startsWith('0')) number = number.substring(1)
        if (!number.startsWith('51') && number.length === 9) number = '51' + number
        if (number.length === 8) number = '51' + number
        return number.includes('@s.whatsapp.net') ? number : number + '@s.whatsapp.net'
      }).filter(num => {
        let cleanNum = num.replace('@s.whatsapp.net', '')
        return cleanNum.length >= 10 && cleanNum.length <= 15
      })
    }

    if (numbers.length === 0) {
      return conn.reply(m.chat, '❌ ⓘ No se encontraron números válidos.', m, ctxErr)
    }

    await conn.reply(m.chat, `ⓘ Procesando ${numbers.length} persona(s) por Lelouch...`, m, ctxOk)

    let addedCount = 0
    let invitedCount = 0
    let failedCount = 0
    let results = []

    const invitationImage = 'https://files.catbox.moe/w491g3.jpg'

    for (let number of numbers) {
      try {
        const contact = await conn.onWhatsApp(number)

        if (contact && contact.length > 0 && contact[0].exists) {
          let isContact = false
          try {
            const contactInfo = await conn.getContact(number)
            isContact = contactInfo && contactInfo.id
          } catch (e) {
            isContact = false
          }

          if (isContact) {
            try {
              await conn.groupParticipantsUpdate(m.chat, [number], 'add')
              addedCount++
              results.push(`ⓘ ${number.split('@')[0]} (Contacto - Agregado por Lelouch)`)
            } catch {
              failedCount++
              results.push(`ⓘ ${number.split('@')[0]} (Contacto - No se pudo agregar)`)
            }
          } else {
            try {
              const inviteMessage = `ⓘ INVITACIÓN AL GRUPO DE LELOUCH\n\n` +
                `ⓘ Grupo: ${groupName}\n` +
                `ⓘ Invitado por: ${conn.getName(m.sender) || 'Un administrador'}\n` +
                `ⓘ Enlace: ${inviteLink}`

              await conn.sendMessage(number, { 
                image: { url: invitationImage },
                caption: inviteMessage
              })
              
              invitedCount++
              results.push(`ⓘ ${number.split('@')[0]} (Invitación enviada por Lelouch)`)
            } catch {
              try {
                const backupMessage = `ⓘ INVITACIÓN AL GRUPO DE LELOUCH\n\n` +
                  `ⓘ Grupo: ${groupName}\n` +
                  `ⓘ Invitado por: ${conn.getName(m.sender) || 'Administrador'}\n` +
                  `ⓘ Enlace: ${inviteLink}`
                await conn.sendMessage(number, { text: backupMessage })
                invitedCount++
                results.push(`ⓘ ${number.split('@')[0]} (Invitación de respaldo enviada)`)
              } catch {
                failedCount++
                results.push(`ⓘ ${number.split('@')[0]} (No se pudo enviar invitación)`)
              }
            }
          }

        } else {
          failedCount++
          results.push(`ⓘ ${number.split('@')[0]} (No tiene WhatsApp)`)
        }

        await new Promise(resolve => setTimeout(resolve, 2000))
      } catch {
        failedCount++
        results.push(`ⓘ ${number.split('@')[0]} (Error por Lelouch)`)
      }
    }

    let resultMessage = `ⓘ Resultado de Invitaciones de Lelouch\n\n`

    if (addedCount > 0) resultMessage += `ⓘ Agregados directamente: ${addedCount}\n`
    if (invitedCount > 0) resultMessage += `ⓘ Invitaciones enviadas: ${invitedCount}\n`
    if (failedCount > 0) resultMessage += `ⓘ Fallidos: ${failedCount}\n`
    resultMessage += `\n`

    if (results.length > 0) resultMessage += `ⓘ Detalles:\n${results.join('\n')}\n\n`
    resultMessage += `ⓘ Enlace del grupo:\n${inviteLink}\n\n`
    resultMessage += (addedCount > 0 || invitedCount > 0) ? `ⓘ ¡Proceso completado exitosamente!` : `ⓘ Usa el enlace para invitar manualmente`

    await conn.reply(m.chat, resultMessage, m, ctxOk)

  } catch {
    let inviteLink = 'Error obteniendo enlace'
    try {
      const code = await conn.groupInviteCode(m.chat)
      inviteLink = `https://chat.whatsapp.com/${code}`
    } catch {}
    await conn.reply(m.chat, 
      `ⓘ Error al procesar por Lelouch\n\n` +
      `ⓘ Usa este enlace para invitar manualmente:\n${inviteLink}`,
      m, ctxErr
    )
  }
}

handler.help = ['add']
handler.tags = ['owner']
handler.command = ['add', 'invitar', 'invite', 'agregar']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
