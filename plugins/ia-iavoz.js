import fetch from 'node-fetch'

// Comando 1: Voz (necesita global.apikey del owner)
let handlerVoz = async (m, { conn, text }) => {
  if (!text) return conn.reply(m.chat,
`┏━━━━━━━━━━━━━━━━━━━━━┓
┃  ⓘ SISTEMA DE VOZ ┃
┗━━━━━━━━━━━━━━━━━━━━━┛

> Ingrese el mensaje para conversión vocal.

> "."`, m)

  const url = `https://api-adonix.ultraplus.click/ai/iavoz?apikey=${global.apikey}&q=${encodeURIComponent(text)}&voice=Esperanza`

  try {
    await conn.reply(m.chat,
`┏━━━━━━━━━━━━━━━━━━━━━┓
┃  ⓘ PROCESANDO ┃
┗━━━━━━━━━━━━━━━━━━━━━┛

> Transformando texto en transmisión vocal...

> "."`, m)

    const res = await fetch(url)
    if (!res.ok) throw new Error('Error')

    const audioBuffer = await res.arrayBuffer()

    await conn.sendMessage(m.chat, {
      audio: Buffer.from(audioBuffer),
      mimetype: 'audio/mpeg',
      ptt: false
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    conn.reply(m.chat,
`┏━━━━━━━━━━━━━━━━━━━━━┓
┃  ⓘ ERROR ┃
┗━━━━━━━━━━━━━━━━━━━━━┛

> Sistema de voz no disponible.

> "."`, m)
  }
}

// Comando 2: IA de texto (Groq con TU token)
let handlerIA = async (m, { conn, text }) => {
  if (!text) return conn.reply(m.chat,
`┏━━━━━━━━━━━━━━━━━━━━━┓
┃  ⓘ INTELIGENCIA ESTRATÉGICA ┃
┗━━━━━━━━━━━━━━━━━━━━━┛

> De que quieres hablar?.

> "Lusa .lelouch, .L ."`, m)

  const GROQ_API_KEY = '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'

  try {
    await conn.reply(m.chat,
`┏━━━━━━━━━━━━━━━━━━━━━┓
┃  ⓘ PROCESANDO ┃
┗━━━━━━━━━━━━━━━━━━━━━┛

> 

> "."`, m)

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{
          role: 'system', 
          content: 'Eres Lelouch vi Britannia, líder estratégico y calculador. Analiza con precisión, habla de estrategia, táctica y conquista. Responde como un general.'
        }, {
          role: 'user',
          content: text
        }],
        max_tokens: 150,
        temperature: 0.8
      })
    })

    const data = await response.json()
    
    if (data.error) throw new Error(data.error.message)
    
    const respuesta = data.choices[0].message.content

    await conn.reply(m.chat,
`┏━━━━━━━━━━━━━━━━━━━━━┓
┃  ⓘ ANÁLISIS COMPLETADO ┃
┗━━━━━━━━━━━━━━━━━━━━━┛

> ${respuesta}

> "La victoria pertenece a quien mejor analiza el campo de batalla."`, m)

  } catch (e) {
    console.error(e)
    conn.reply(m.chat,
`┏━━━━━━━━━━━━━━━━━━━━━┓
┃  ⓘ ERROR DE ANÁLISIS ┃
┗━━━━━━━━━━━━━━━━━━━━━┛

> Sistema de inteligencia no disponible.

> "Hasta el mejor plan puede fallar por imprevistos."`, m)
  }
}

// Exportar ambos handlers
handlerVoz.help = ['iavoz <texto>']
handlerVoz.tags = ['ia']
handlerVoz.command = ['iavoz', 'voz']

handlerIA.help = ['ia <texto>', 'lelouch <texto>']
handlerIA.tags = ['ia']
handlerIA.command = ['l', 'lelouch', 'zero']

export { handlerVoz as default, handlerIA }
