let handler = async (m, { conn, args, usedPrefix, command }) => {
  const currency = global.currency || 'Yenes'

  if (!db.data.chats[m.chat].economy && m.isGroup) {
    return conn.reply(m.chat, `> ⓘ ECONOMIA DESACTIVADA\n\n❌ Los comandos de economía están desactivados\n\n📝 Administrador activa con:\n${usedPrefix}economy on`, m)
  }

  let user = global.db.data.users[m.sender]

  if (!args[0]) {
    return conn.reply(m.chat, `> ⓘ DEPOSITO BANCARIO\n\n❌ Debes especificar una cantidad\n\n📝 Uso:\n• ${usedPrefix}${command} <cantidad>\n• ${usedPrefix}${command} all\n\n💡 Ejemplos:\n• ${usedPrefix}${command} 5000\n• ${usedPrefix}${command} all`, m)
  }

  if ((args[0]) < 1) {
    return conn.reply(m.chat, `> ⓘ CANTIDAD INVALIDA\n\n⚠️ La cantidad debe ser mayor a 0`, m)
  }

  if (args[0] == 'all') {
    let count = parseInt(user.coin)

    if (count <= 0 || !user.coin) {
      return conn.reply(m.chat, `> ⓘ SIN FONDOS\n\n❌ No tienes ${currency} en tu cartera\n\n👛 Cartera: ¥0\n\n💡 Usa: ${usedPrefix}work`, m)
    }

    user.coin -= count * 1
    user.bank += count * 1

    await conn.reply(m.chat, 
      `> ⓘ DEPOSITO COMPLETO\n\n` +
      `✅ Has depositado todo tu dinero\n\n` +
      `💰 Monto: ¥${count.toLocaleString()}\n` +
      `🏦 Banco: ¥${user.bank.toLocaleString()}\n` +
      `👛 Cartera: ¥${user.coin.toLocaleString()}`,
      m
    )
    return !0
  }

  if (!Number(args[0])) {
    return conn.reply(m.chat, `> ⓘ FORMATO INCORRECTO\n\n⚠️ Debes ingresar un número válido\n\n📝 Ejemplos:\n• ${usedPrefix}${command} 25000\n• ${usedPrefix}${command} all`, m)
  }

  let count = parseInt(args[0])

  if (!user.coin) {
    return conn.reply(m.chat, `> ⓘ SIN FONDOS\n\n❌ No tienes ${currency} en tu cartera\n\n👛 Cartera: ¥0\n\n💡 Usa: ${usedPrefix}work`, m)
  }

  if (user.coin < count) {
    return conn.reply(m.chat, 
      `> ⓘ FONDOS INSUFICIENTES\n\n` +
      `❌ No tienes suficiente dinero\n\n` +
      `👛 Cartera: ¥${user.coin.toLocaleString()}\n` +
      `💰 Intentaste: ¥${count.toLocaleString()}\n\n` +
      `💡 Usa: ${usedPrefix}${command} all para depositar todo`,
      m
    )
  }

  user.coin -= count * 1
  user.bank += count * 1

  await conn.reply(m.chat, 
    `> ⓘ DEPOSITO EXITOSO\n\n` +
    `✅ Depósito realizado\n\n` +
    `💰 Monto: ¥${count.toLocaleString()}\n` +
    `👛 Cartera: ¥${user.coin.toLocaleString()}\n` +
    `🏦 Banco: ¥${user.bank.toLocaleString()}\n` +
    `💎 Total: ¥${(user.coin + user.bank).toLocaleString()}`,
    m
  )
}

handler.help = ['depositar']
handler.tags = ['economy']
handler.command = ['deposit', 'depositar', 'd', 'dep']
handler.group = true

export default handler