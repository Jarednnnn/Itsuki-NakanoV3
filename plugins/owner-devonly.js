// plugins/owner-rootowner.js
let handler = async (m, { conn, usedPrefix, command, isROwner }) => {
    // Solo el creador puede usar este comando
    if (!isROwner) return m.reply('> ⓘ Este comando solo puede ser usado por el *Creador* del bot.')

    let chat = global.db.data.chats[m.chat]

    // Verificar si el comando tiene argumentos
    let args = m.text.trim().split(' ').slice(1)
    let action = args[0]?.toLowerCase()

    if (!action || (action !== 'on' && action !== 'off')) {
        let status = chat.rootowner ? '🟢 ACTIVADO' : '🔴 DESACTIVADO'
        return m.reply(`╭─「 🛡️ *MODO ROOTOWNER* 🛡️ 」
│ 
│ 📊 Estado actual: ${status}
│ 
│ 💡 *Uso del comando:*
│ ├ ${usedPrefix}rootowner on
│ └ ${usedPrefix}rootowner off
│ 
│ 📝 *Descripción:*
│ Cuando está ACTIVADO, el bot solo
│ responderá a mensajes del Creador
│ en este grupo.
╰─◉`.trim())
    }

    if (action === 'on') {
        if (chat.rootowner) {
            return m.reply('> ⓘ El modo *RootOwner* ya está activado en este grupo.')
        }
        chat.rootowner = true
        m.reply(`╭─「 🛡️ *MODO ROOTOWNER ACTIVADO* 🛡️ 」
│ 
│ ✅ *Configuración aplicada:*
│ ├ El bot ahora solo responderá
│ └ a tus mensajes en este grupo.
│ 
│ 🔒 *Modo exclusivo activado*
│ 📍 Grupo: ${m.chat}
╰─◉`.trim())

    } else if (action === 'off') {
        if (!chat.rootowner) {
            return m.reply('> ⓘ El modo *RootOwner* ya está desactivado en este grupo.')
        }
        chat.rootowner = false
        m.reply(`╭─「 🛡️ *MODO ROOTOWNER DESACTIVADO* 🛡️ 」
│ 
│ ✅ *Configuración aplicada:*
│ ├ El bot ahora responderá
│ └ a todos los usuarios.
│ 
│ 🔓 *Modo exclusivo desactivado*
│ 📍 Grupo: ${m.chat}
╰─◉`.trim())
    }
}

handler.help = ['rootowner']
handler.tags = ['owner']
handler.command = /^(rootowner)$/i
handler.rowner = true
handler.group = true

export default handler