import fetch from 'node-fetch'

const handler = async (m, { text, usedPrefix, command, conn }) => {
    const args = text.split(',').map(arg => arg.trim())

    if (args.length < 7) {
        return conn.reply(m.chat, 
            `> ⓘ \`Uso:\` *${usedPrefix}${command} nombre, género, valor, origen, img1, img2, img3*\n> ⓘ \`Ejemplo:\` *${usedPrefix}${command} Itsuki Nakano, Femenino, 100, Quintillizas, https://img1.jpg, https://img2.jpg, https://img3.jpg*`,
            m
        )
    }

    const [name, gender, value, source, img1, img2, img3] = args

    if (!img1.startsWith('http') || !img2.startsWith('http') || !img3.startsWith('http')) {
        return conn.reply(m.chat, '> ⓘ \`Los enlaces de las imágenes no son válidos\`', m)
    }

    const characterData = {
        id: Date.now().toString(),
        name,
        gender,
        value,
        source,
        img: [img1, img2, img3],
        vid: [],
        user: null,
        status: "Libre",
        votes: 0
    }

    // Usar el primer owner del bot
    const tagNumber = global.owner?.[0]?.[0] + '@s.whatsapp.net'

    if (!tagNumber) {
        return conn.reply(m.chat, '> ⓘ \`No se encontró el owner del bot\`', m)
    }

    const jsonMessage = 
        `> ⓘ \`Nuevo personaje añadido\`\n> ⓘ \`Solicitado por:\` *@${m.sender.split('@')[0]}*\n\n\`\`\`${JSON.stringify(characterData, null, 2)}\`\`\``

    try {
        await conn.sendMessage(tagNumber, { 
            text: jsonMessage,
            mentions: [m.sender]
        })

        await conn.reply(m.chat, 
            `> ⓘ \`Personaje enviado:\` *${name}*\n> ⓘ \`Estado:\` *Pendiente de aprobación*`,
            m
        )
    } catch (e) {
        await conn.reply(m.chat, `> ⓘ \`Error:\` *${e.message}*`, m)
    }
}

handler.command = ['addcharacter']
handler.tags = ['gacha']
handler.help = ['addcharacter']

export default handler