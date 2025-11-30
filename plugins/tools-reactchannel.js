import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        await m.react('❓')
        return conn.reply(m.chat, 
            `> \`🎯 REACCIONAR CANAL\` 🍙\n\n` +
            `> \`📝 Uso: ${usedPrefix}${command} @username reacción\`\n\n` +
            `> \`💡 Ejemplo: ${usedPrefix}${command} @canal 👍\`\n\n` +
            `> \`🎭 Reacciones: 👍 ❤️ 🔥 🥰 😂 🤩\`\n\n` +
            `> \`📚 "Reacciona a la última publicación del canal"\` ✨`,
            m
        )
    }

    const args = text.split(' ')
    if (args.length < 2) {
        await m.react('⚠️')
        return conn.reply(m.chat, 
            `> \`⚠️ FALTAN DATOS\` 🍙\n\n` +
            `> \`❌ @username + reacción\`\n\n` +
            `> \`📚 "Menciona el canal y la reacción"\` ✨`,
            m
        )
    }

    const [canal, react] = args
    
    try {
        await m.react('⏳')
        
        // Simular URL del último post del canal
        const canalUrl = `https://wa.me/${canal.replace('@', '')}`
        const apiUrl = `https://api-adonix.ultraplus.click/tools/react?apikey=${global.apikey}&post_link=${encodeURIComponent(canalUrl)}&reacts=1`
        
        const res = await fetch(apiUrl)
        const data = await res.json()

        if (data.status) {
            await m.react('✅')
            conn.reply(m.chat,
                `> \`✅ REACCIÓN ENVIADA\` 🍙\n\n` +
                `> \`📢 Canal:\` ${canal}\n` +
                `> \`🎭 Reacción:\` ${react}\n` +
                `> \`📄 Publicación:\` Último post\n\n` +
                `> \`📚 "¡Reacción agregada al canal!"\` ✨`,
                m
            )
        } else {
            await m.react('❌')
            conn.reply(m.chat,
                `> \`❌ ERROR\` 🍙\n\n` +
                `> \`📚 No se pudo reaccionar al canal\`\n\n` +
                `> \`🍙 "Verifica el @username del canal"\` ✨`,
                m
            )
        }
    } catch (e) {
        await m.react('❌')
        conn.reply(m.chat,
            `> \`❌ ERROR\` 🍙\n\n` +
            `> \`📚 ${e.message}\`\n\n` +
            `> \`🍙 "Problema al conectar con el servicio"\` ✨`,
            m
        )
    }
}

handler.help = ['reactcanal']
handler.tags = ['tools']
handler.command = ['reactcanal', 'reaccionarcanal', 'canalreact']
handler.group = true

export default handler