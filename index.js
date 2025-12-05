import fetch from "node-fetch";

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Definiciones de contexto (asumo que rcanal y fake son objetos globales de respuesta)
    const ctxOk = (global.rcanal || {})
    const ctxErr = (global.fake || {})

    if (!text) {
        // Notificación de fallo: X
        await conn.sendMessage(m.chat, { react: { text: 'X', key: m.key } })
        return conn.reply(m.chat, `ATENCIÓN. Se requiere una consulta para activar el protocolo de IA.
*DIRECTRIZ:* Formule su pregunta.`, m, ctxOk);
    }

    try {
        // Indicador de "Procesando"
        await conn.sendMessage(m.chat, { react: { text: '💭', key: m.key } })
        await conn.sendPresenceUpdate('composing', m.chat)

        const url = `https://api.kirito.my/api/chatgpt?q=${encodeURIComponent(text)}&apikey=by_deylin`;
        const res = await fetch(url);
        const data = await res.json();

        if (!data || !data.response) {
            // Notificación de fallo: X
            await conn.sendMessage(m.chat, { react: { text: 'X', key: m.key } })
            return conn.reply(m.chat, "FALLO CRÍTICO: No se recibió respuesta del nodo de procesamiento IA. Intente de nuevo.", m, ctxErr);
        }

        // Respuesta y Notificación de éxito: ✅
        await conn.reply(m.chat, `*EJECUCIÓN DEL PROTOCOLO GPT COMPLETADA*\n\n${data.response}`, m, ctxOk);
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    } catch (e) {
        console.error(e);
        // Notificación de error: X
        await conn.sendMessage(m.chat, { react: { text: 'X', key: m.key } })
        await conn.reply(m.chat, "ERROR DE ENLACE: Hubo un fallo al conectar con la interfaz de la IA.", m, ctxErr);
    }
};

handler.tags = ["ia"];
handler.command = handler.help =['gpt', 'chatgpt']

export default handler;
