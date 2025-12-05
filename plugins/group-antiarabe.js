let handler = async (m, { conn, usedPrefix, command, isAdmin, isROwner }) => {
    if (!m.isGroup) {
        await m.react('❌')
        return conn.reply(m.chat, 
`┏━━━━━━━━━━━━━━━━━━━━━┓
┃  ⓘ RESTRICCIÓN ┃
┗━━━━━━━━━━━━━━━━━━━━━┛

> Este comando solo funciona en grupos.`, m)
    }

    if (!isAdmin && !isROwner) {
        await m.react('🚫')
        return conn.reply(m.chat,
`┏━━━━━━━━━━━━━━━━━━━━━┓
┃  ⓘ ACCESO DENEGADO ┃
┗━━━━━━━━━━━━━━━━━━━━━┛

> Solo administradores pueden usar este comando.`, m)
    }

    let chat = global.db.data.chats[m.chat]
    let args = m.text.trim().split(' ').slice(1)
    let action = args[0]?.toLowerCase()

    if (!action || (action !== 'on' && action !== 'off')) {
        let status = chat.antiArabe ? '⚜️ ACTIVADO' : '✖️ DESACTIVADO'
        await m.react('ℹ️')
        return conn.reply(m.chat,
`┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ⓘ ANTI-ARABE ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

> Estado: ${status}

> Uso: ${usedPrefix}antiarabe [on/off]

> Detecta y expulsa números de países árabes.`, m)
    }

    if (action === 'on') {
        if (chat.antiArabe) {
            await m.react('ℹ️')
            return conn.reply(m.chat,
`┏━━━━━━━━━━━━━━━━━━━━━┓
┃  ⓘ INFORMACIÓN ┃
┗━━━━━━━━━━━━━━━━━━━━━┛

> El Anti-Arabe ya está activado.`, m)
        }
        chat.antiArabe = true
        await m.react('✅')
        conn.reply(m.chat,
`┏━━━━━━━━━━━━━━━━━━━━━┓
┃  ⓘ ACTIVADO ┃
┗━━━━━━━━━━━━━━━━━━━━━┛

> Anti-Arabe activado.
> Números árabes serán expulsados.`, m)

    } else if (action === 'off') {
        if (!chat.antiArabe) {
            await m.react('ℹ️')
            return conn.reply(m.chat,
`┏━━━━━━━━━━━━━━━━━━━━━┓
┃  ⓘ INFORMACIÓN ┃
┗━━━━━━━━━━━━━━━━━━━━━┛

> El Anti-Arabe ya está desactivado.`, m)
        }
        chat.antiArabe = false
        await m.react('✅')
        conn.reply(m.chat,
`┏━━━━━━━━━━━━━━━━━━━━━┓
┃  ⓘ DESACTIVADO ┃
┗━━━━━━━━━━━━━━━━━━━━━┛

> Anti-Arabe desactivado.
> Números árabes permitidos.`, m)
    }
}

handler.help = ['antiarabe on', 'antiarabe off']
handler.tags = ['group']
handler.command = /^(antiarabe|antiarab)$/i
handler.group = true
handler.admin = true

export default handler
