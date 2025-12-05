const { generateWAMessageFromContent, proto } = await import("@whiskeysockets/baileys");

let handler = async (m, { conn, isBotAdmin }) => {
  if (!m.isGroup) return
  if (!isBotAdmin) return

  try {
    await m.react('🕒')
    
    const groupCode = await conn.groupInviteCode(m.chat)
    const inviteLink = `https://chat.whatsapp.com/${groupCode}`
    
    // Mensaje con botón interactivo
    const msg = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          interactiveMessage: proto.Message.InteractiveMessage.create({
            body: proto.Message.InteractiveMessage.Body.create({
              text: "┏━━━━━━━━━━━━━━━━━━━━━┓\n┃  ⓘ ENLACE DEL GRUPO ┃\n┗━━━━━━━━━━━━━━━━━━━━━┛\n\n> Copia el enlace del grupo aquí ⬇️"
            }),
            footer: proto.Message.InteractiveMessage.Footer.create({ 
              text: "Pulsa el botón para copiar" 
            }),
            header: proto.Message.InteractiveMessage.Header.create({ 
              hasMediaAttachment: false 
            }),
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
              buttons: [
                {
                  name: "cta_copy",
                  buttonParamsJson: JSON.stringify({
                    display_text: "📋 Copiar Enlace",
                    copy_code: `${inviteLink}`
                  })
                }
              ]
            })
          })
        }
      }
    }, { quoted: m })

    await conn.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id })
    
    await m.react('✅')

  } catch (error) {
    await m.react('❌')
  }
}

handler.help = ['link']
handler.tags = ['group']
handler.command = ['link']
handler.group = true
handler.botAdmin = true

export default handler
