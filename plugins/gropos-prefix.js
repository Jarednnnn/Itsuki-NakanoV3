import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command, isAdmin, isOwner, groupMetadata }) => {
  if (!m.isGroup) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    return conn.reply(m.chat, 
`┏━━━━━━━━━━━━━━━━━━━━━┓
┃  ⓘ RESTRICCIÓN ┃
┗━━━━━━━━━━━━━━━━━━━━━┛

> Este comando solo funciona en grupos.`, m)
  }

  const chat = global.db.data.chats[m.chat]
  const participants = await conn.groupMetadata(m.chat).catch(() => ({ participants: [] }))
  const user = participants.participants.find(p => p.id === m.sender)
  const isUserAdmin = user && (user.admin === 'admin' || user.admin === 'superadmin')

  if (!isUserAdmin && !isOwner) {
    await conn.sendMessage(m.chat, { react: { text: '🚫', key: m.key } })
    return conn.reply(m.chat,
`┏━━━━━━━━━━━━━━━━━━━━━┓
┃  ⓘ ACCESO DENEGADO ┃
┗━━━━━━━━━━━━━━━━━━━━━┛

> Solo administradores pueden cambiar el prefijo.`, m)
  }

  const args = text.split(' ')
  const subcmd = args[0]?.toLowerCase()

  if (command === 'setprefix') {
    if (!subcmd) {
      await conn.sendMessage(m.chat, { react: { text: 'ℹ️', key: m.key } })
      
      const currentPrefix = chat.prefix || 'Usando prefijos globales'
      const customPrefixes = chat.prefixes || []

      let mensaje = 
`┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ⓘ PREFIJO ACTUAL ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

> Estado: ${currentPrefix}`

      if (customPrefixes.length > 0) {
        mensaje += `\n> Prefijos adicionales: ${customPrefixes.join(', ')}`
      }

      mensaje += `\n\n> Uso: ${usedPrefix}setprefix [nuevo_prefijo]`
      mensaje += `\n> Ejemplo: ${usedPrefix}setprefix !`

      return conn.reply(m.chat, mensaje, m)
    }

    const newPrefix = args[0]

    if (newPrefix.length > 3) {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      return conn.reply(m.chat,
`┏━━━━━━━━━━━━━━━━━━━━━┓
┃  ⓘ INVÁLIDO ┃
┗━━━━━━━━━━━━━━━━━━━━━┛

> El prefijo no puede tener más de 3 caracteres.`, m)
    }

    if (newPrefix.includes(' ')) {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      return conn.reply(m.chat,
`┏━━━━━━━━━━━━━━━━━━━━━┓
┃  ⓘ INVÁLIDO ┃
┗━━━━━━━━━━━━━━━━━━━━━┛

> El prefijo no puede contener espacios.`, m)
    }

    await conn.sendMessage(m.chat, { react: { text: '🕑', key: m.key } })
    
    chat.prefix = newPrefix
    if (!chat.prefixes) chat.prefixes = []
    if (!chat.prefixes.includes(newPrefix)) {
      chat.prefixes.push(newPrefix)
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    return conn.reply(m.chat,
`┏━━━━━━━━━━━━━━━━━━━━━┓
┃  ⓘ CONFIGURADO ┃
┗━━━━━━━━━━━━━━━━━━━━━┛

> Nuevo prefijo: ${newPrefix}
> Configurado por: @${m.sender.split('@')[0]}

> Ejemplo de uso: ${newPrefix}menu
> Para quitar: ${newPrefix}delprefix`, m)

  } else if (command === 'delprefix') {
    await conn.sendMessage(m.chat, { react: { text: '🕑', key: m.key } })
    
    if (chat.prefix) {
      const oldPrefix = chat.prefix
      chat.prefix = null

      if (chat.prefixes) {
        const index = chat.prefixes.indexOf(oldPrefix)
        if (index > -1) {
          chat.prefixes.splice(index, 1)
        }
      }

      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

      return conn.reply(m.chat,
`┏━━━━━━━━━━━━━━━━━━━━━┓
┃  ⓘ ELIMINADO ┃
┗━━━━━━━━━━━━━━━━━━━━━┛

> Prefijo eliminado: ${oldPrefix}
> Eliminado por: @${m.sender.split('@')[0]}

> Ahora se usarán prefijos globales.
> Para configurar nuevo: .setprefix [prefijo]`, m)
    } else {
      await conn.sendMessage(m.chat, { react: { text: 'ℹ️', key: m.key } })
      return conn.reply(m.chat,
`┏━━━━━━━━━━━━━━━━━━━━━┓
┃  ⓘ INFORMACIÓN ┃
┗━━━━━━━━━━━━━━━━━━━━━┛

> Este grupo ya usa prefijos globales.
> Para configurar personalizado: .setprefix [prefijo]`, m)
    }
  }
}

handler.help = ['setprefix', 'delprefix']
handler.tags = ['group']
handler.command = ['setprefix', 'delprefix']
handler.group = true
handler.admin = true

export default handler
