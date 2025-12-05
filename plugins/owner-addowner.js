const handler = async (m, { conn, text, participants }) => {
  try {
    if (!text?.trim() && !m.mentionedJid?.length && !m.quoted) {
      return conn.reply(m.chat, `> ⓘ \`Uso:\` *addowner @usuario*\n> ⓘ \`Uso:\` *addowner número*\n> ⓘ \`O responde a un mensaje, mi señor*\n> ⓘ \`Orden a ejecutar: Agregar owner\``, m)
    }

    const targetsAll = parseUserTargets(text || '', {
        resolveMentions: true,
        groupJid: m.chat
    });

    if (m.mentionedJid && Array.isArray(m.mentionedJid)) {
        m.mentionedJid.forEach(jid => {
            if (!targetsAll.includes(jid)) {
                targetsAll.push(jid);
            }
        });
    }

    if (m.quoted) {
        const quotedJid = m.quoted.sender;
        if (quotedJid && !targetsAll.includes(quotedJid)) {
            targetsAll.push(quotedJid);
        }
    }

    if (!targetsAll.length) return conn.reply(m.chat, '> ⓘ \`No se encontró usuario válido, mi señor\`', m)
    const target = targetsAll[0]

    const info = await getUserInfo(target, participants, conn)
    const num = normalizeCore(info.jid)
    if (!num) return conn.reply(m.chat, '> ⓘ \`Número inválido, mi señor\`', m)

    const already = (Array.isArray(global.owner) ? global.owner : []).some(v => {
      if (Array.isArray(v)) return normalizeCore(v[0]) === num
      return normalizeCore(v) === num
    })
    if (already) return conn.reply(m.chat, `> ⓘ \`Este usuario ya es owner, mi señor:\` *@${num}*`, m, { mentions: [info.jid] })

    let providedName = ''
    if (text?.trim()) {
      const cleaned = text.replace(/@\d+/g, '').replace(/\+?\d{5,}/g, '').trim()
      providedName = cleaned
    }
    const name = (providedName && providedName.length > 1) ? providedName : (await resolveName(conn, info.jid))

    global.owner = Array.isArray(global.owner) ? global.owner : []
    global.owner.push([num, name, true])

    let persisted = false
    try {
      const __filename = fileURLToPath(import.meta.url)
      const __dirname = path.dirname(__filename)
      const configPath = path.join(__dirname, '..', 'config.js')
      persisted = await appendOwnerToConfig(configPath, num, name, true)
      if (persisted) {
        try { await import(pathToFileURL(configPath).href + `?update=${Date.now()}`) } catch {}
      }
    } catch {}

    const fkontak = await makeFkontak().catch(() => null)
    
    if (persisted) {
      return conn.reply(m.chat, `> ⓘ \`Orden ejecutada con éxito, mi señor:\` *@${num}*\n> ⓘ \`Nombre asignado:\` *${name}*`, fkontak || m, { mentions: [info.jid] })
    } else {
      return conn.reply(m.chat, `> ⓘ \`Orden ejecutada en memoria, mi señor:\` *@${num}*\n> ⓘ \`Nombre asignado:\` *${name}*\n> ⓘ \`No se pudo guardar en config.js\``, fkontak || m, { mentions: [info.jid] })
    }
    
  } catch (e) {
    console.error('[owner-add] error:', e)
    return conn.reply(m.chat, `> ⓘ \`Error al ejecutar la orden, mi señor:\` *${e.message}*`, m)
  }
}
