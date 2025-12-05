/*CODIGO BASE DEYLIN - REVISIÓN DE PROTOCOLO */

import fetch from 'node-fetch'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'

let handler = async (m, { text, usedPrefix, command, conn }) => {
    // Definiciones de contexto (asumo que rcanal es un objeto global de respuesta)
    const ctxOk = (global.rcanal || {})
    const ctxErr = (global.rcanal || {}) // Usamos rcanal para ambos, asumiendo que no hay un objeto 'fake' o específico de error aquí.

    let q = m.quoted || m
    let mime = (q.msg || q).mimetype || ''
    let hasImage = /^image\/(jpe?g|png)$/.test(mime)

    if (!text && !hasImage) {
        // Notificación de fallo: X
        await m.react('X')
        return conn.reply(m.chat, `ATENCIÓN: Se requiere un protocolo de entrada.
*DIRECTRIZ:* Envíe o responda a una imagen con una pregunta (Visión) O escriba un comando para generar una imagen (Creación).

*EJEMPLO DE VISIÓN:* ${usedPrefix + command} ¿Cuál es la amenaza potencial de este objeto?
*EJEMPLO DE CREACIÓN:* ${usedPrefix + command} Genera un mapa estratégico para la conquista.`, m, ctxOk)
    }

    try {
        // Indicador de "Procesando" (Inicio)
        await m.react('💭')
        conn.sendPresenceUpdate('composing', m.chat)

        let base64Image = null
        let mimeType = null

        if (hasImage) {
            const stream = await downloadContentFromMessage(q, 'image')
            let buffer = Buffer.from([])
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk])
            }

            base64Image = `data:${mime};base64,${buffer.toString('base64')}`
            mimeType = mime
        }

        const body = {
            prompts: text ? [text] : [],
            imageBase64List: base64Image ? [base64Image] : [],
            mimeTypes: mimeType ? [mimeType] : [],
            temperature: 0.7
        }

        const res = await fetch('https://g-mini-ia.vercel.app/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        })

        const data = await res.json()


        if (data?.image && data?.from === 'image-generator') {
            // Generación de Imagen exitosa: ✅
            await conn.sendFile(m.chat, data.image, 'imagen.jpg', `PROTOCOLO DE CREACIÓN EJECUTADO.
*MODELO:* GEMINI (IA)
*RESULTADO:* Imagen generada y entregada.`, m, ctxOk)
            await m.react('✅')
            return
        }

        // Indicador de carga para la segunda fase (respuesta de texto)
        await m.react('💭')


        const respuesta = data?.candidates?.[0]?.content?.parts?.[0]?.text
        if (!respuesta) throw 'No se recibió respuesta válida de la IA.'

        // Respuesta de Texto exitosa: ✅
        conn.reply(m.chat, `*EJECUCIÓN DEL PROTOCOLO DE VISIÓN/CONSULTA COMPLETADA*
        
${respuesta.trim()}`, m, ctxOk)
        await m.react('✅')

    } catch (e) {
        console.error('[ERROR GEMINI]', e)
        // Notificación de fallo: X
        await m.react('X')
        await conn.reply(m.chat, 'FALLO CRÍTICO: Ocurrió un error al procesar la imagen o la consulta en el sistema GEMINI.', m, ctxErr)
    }
}

handler.command = ['gemini', 'geminis'];
handler.tags = ['ia'];
handler.help = ['gemini'];
handler.group = false

export default handler;
