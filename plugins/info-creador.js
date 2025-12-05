import { prepareWAMessageMedia, generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'

let handler = async (m, { conn }) => {
  try {
    await conn.sendMessage(m.chat, { react: { text: '👑', key: m.key } })

    const menuText = `> *@Hola, soy Jared, Owner de Itsuki Nakano V3*\n\n> ᴇʟɪɢᴇ ᴄóᴍᴏ ǫᴜɪᴇʀᴇs ᴄᴏɴᴛᴀᴄᴛᴀʀᴍᴇ :`

    const imageUrl = 'https://cdn.russellxz.click/892b3d23.jpg'

    const nativeButtons = [
      {
        name: 'cta_url',
        buttonParamsJson: JSON.stringify({ 
          display_text: 'Instagram 📸', 
          url: 'https://www.instagram.com/jared.nnnnn'  // ← Instagram actualizado
        })
      },
      {
        name: 'cta_url',
        buttonParamsJson: JSON.stringify({ 
          display_text: 'Owner 👑', 
          url: 'https://wa.me/593994524688'
        })
      }
    ]

    const media = await prepareWAMessageMedia(
      { image: { url: imageUrl } }, 
      { upload: conn.waUploadToServer }
    )

    const header = proto.Message.InteractiveMessage.Header.fromObject({
      hasMediaAttachment: true,
      imageMessage: media.imageMessage
    })

    const interactiveMessage = proto.Message.InteractiveMessage.fromObject({
      body: proto.Message.InteractiveMessage.Body.fromObject({ text: menuText }),
      header,
      nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
        buttons: nativeButtons
      })
    })

    const msg = generateWAMessageFromContent(
      m.chat, 
      { interactiveMessage }, 
      { userJid: conn.user.jid, quoted: m }
    )

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })

  } catch (e) {
    console.error('❌ Error en el comando owner:', e)
    await conn.sendMessage(m.chat, {
      text: `❌ *Error al cargar la información del owner*\n\n🔗 Contacto directo: https://wa.me/593994524688\n\n⚠️ *Error:* ${e.message}`
    }, { quoted: m })
  }
}

handler.help = ['owner', 'creador']
handler.tags = ['info']
handler.command = ['owner', 'creador', 'contacto']

export default handler
