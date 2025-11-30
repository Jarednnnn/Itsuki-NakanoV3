// crime.js - Comando de Crimen
let handler = async (m, { conn, usedPrefix, command }) => {
  const currency = global.currency || 'Yenes'

  if (!global.db.data.chats[m.chat].economy && m.isGroup) {
    return conn.reply(m.chat, '❌ \\`ECONOMIA DESACTIVADA\\`\n\n🚫 \\`Los comandos de economía están desactivados en este grupo\\`\n\n📝 \\`Administrador activa con:\\`\n' + usedPrefix + 'economy on\n\n📚 \\`"No puedo procesar acciones si la economía está desactivada..."\\`', m)
  }

  let user = global.db.data.users[m.sender]
  if (!user) {
    user = global.db.data.users[m.sender] = {
      coin: 1000,
      lastcrime: 0
    }
  }
  
  user.lastcrime = user.lastcrime || 0
  user.coin = user.coin || 0

  const cooldown = 3 * 60 * 1000
  const ahora = Date.now()

  if (ahora - user.lastcrime < cooldown) {
    const restante = (user.lastcrime + cooldown) - ahora
    const wait = formatTimeMs(restante)
    return conn.reply(m.chat, `⏰ \\`TIEMPO DE ESPERA\\`\n\n⏳ \\`Debes esperar:\\` *${wait}*`, m)
  }

  user.lastcrime = ahora

  const evento = pickRandom(crimen)
  let cantidad

  if (evento.tipo === 'victoria') {
    cantidad = Math.floor(Math.random() * 2001) + 5000
    user.coin += cantidad

    await m.react('✅')
    await conn.reply(m.chat, 
      '✅ \\`ACCION EXITOSA\\`\n\n' +
      evento.mensaje + '\n\n' +
      '💰 \\`Ganancia:\\` *+¥' + cantidad.toLocaleString() + '*\n' +
      '🎒 \\`Cartera:\\` *¥' + user.coin.toLocaleString() + '*',
      m
    )
  } else {
    cantidad = Math.floor(Math.random() * 1801) + 3000
    user.coin = Math.max(0, user.coin - cantidad)

    await m.react('❌')
    await conn.reply(m.chat,
      '❌ \\`ACCION FALLIDA\\`\n\n' +
      evento.mensaje + '\n\n' +
      '💸 \\`Perdida:\\` *-¥' + cantidad.toLocaleString() + '*\n' +
      '🎒 \\`Cartera:\\` *¥' + user.coin.toLocaleString() + '*',
      m
    )
  }
}

handler.tags = ['economy']
handler.help = ['crimen']
handler.command = ['crimen', 'crime', 'accion']
handler.group = true

export default handler

function formatTimeMs(ms) {
  const totalSec = Math.ceil(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  const partes = []
  if (min > 0) partes.push(`${min} minuto${min !== 1 ? 's' : ''}`)
  partes.push(`${sec} segundo${sec !== 1 ? 's' : ''}`)
  return partes.join(' ')
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}

const crimen = [
  { tipo: 'victoria', mensaje: "📚 \\`Usaste tus conocimientos para hackear un cajero automático con un exploit del sistema y retiraste efectivo sin alertas\\`" },
  { tipo: 'victoria', mensaje: "📖 \\`Te infiltraste como tutora académica en una mansión y aprovechaste para tomar joyas mientras dabas clases\\`" },
  { tipo: 'derrota', mensaje: "📚 \\`Intentaste falsificar un certificado pero el papel y sello eran de mala calidad, te descubrieron\\`" },
  { tipo: 'derrota', mensaje: "📖 \\`Trataste de hackear un sistema escolar pero olvidaste ocultar tu IP y fuiste rastreada\\`" }
]