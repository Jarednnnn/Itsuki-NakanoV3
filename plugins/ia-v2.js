import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix, command, text }) => {
    // Definiciones de contexto sin emojis (simulando objetos de respuesta global)
    const ctxErr = (global.rcanalx || {})
    const ctxOk = (global.rcanalr || {})

    if (!text) {
        // Notificación de fallo: X
        await conn.sendMessage(m.chat, { react: { text: 'X', key: m.key } })
        return conn.reply(m.chat, `ATENCIÓN: Se requiere un protocolo de consulta.
*FORMATO REQUERIDO:* [Modelo-IA] [Consulta]
*Ejemplo:* ${usedPrefix + command} gpt-5-nano ¿Cuál es el código Geass?`, m, ctxErr)
    }

    let args = text.split(' ')
    let model = args.shift().toLowerCase()
    const question = args.join(' ')

    const modelosDisponibles = ['gpt-5-nano', 'claude', 'gemini', 'deepseek', 'grok', 'meta-ai', 'qwen']

    if (!modelosDisponibles.includes(model)) {
        // Notificación de fallo: X
        await conn.sendMessage(m.chat, { react: { text: 'X', key: m.key } })
        return conn.reply(m.chat, `MODELO INVÁLIDO. La identidad solicitada no existe en el sistema.
*Identidades disponibles:* ${modelosDisponibles.join(', ')}`, m, ctxErr)
    }

    if (!question) {
        // Notificación de fallo: X
        await conn.sendMessage(m.chat, { react: { text: 'X', key: m.key } })
        return conn.reply(m.chat, `REQUERIMIENTO INCOMPLETO. La consulta no ha sido formulada.`, m, ctxErr)
    }

    try {
        // Indicador de "Procesando"
        await conn.sendMessage(m.chat, { react: { text: '💭', key: m.key } })
        await conn.sendPresenceUpdate('composing', m.chat)

        const response = await fetch(`https://api-adonix.ultraplus.click/ai/chat?apikey=${global.apikey}&q=${encodeURIComponent(question)}&model=${model}`)
        const data = await response.json()

        if (!data.status || !data.reply) throw new Error('El nodo de procesamiento no devolvió una respuesta válida.')

        // Respuesta del sistema
        await conn.reply(m.chat, `*EJECUCIÓN DEL MODELO ${model.toUpperCase()} COMPLETADA*\n\n${data.reply}`, m, ctxOk)
        
        // Indicador de éxito: ✅
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    } catch (err) {
        // Notificación de error: X
        await conn.sendMessage(m.chat, { react: { text: 'X', key: m.key } })
        conn.reply(m.chat, `ERROR CRÍTICO: Fallo en el enlace con el sistema externo.
*Detalles del Fallo:* ${err.message}`, m, ctxErr)
    }
}

handler.help = ["ia", "ai"]
handler.tags = ["ai"]
handler.command = ["ia", "ai", "itsuki"]

export default handler
