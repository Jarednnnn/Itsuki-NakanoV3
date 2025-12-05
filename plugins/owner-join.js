let linkRegex = /https:\/\/chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i;

let handler = async (m, { conn, text, isOwner }) => {
    if (!text) return m.reply('> ⓘ Debe enviar un enlace de invitación para que Lelouch pueda unirse al grupo, mi señor.');

    let [_, code] = text.match(linkRegex) || [];

    if (!code) return m.reply('> ⓘ Enlace de invitación no válido, mi señor.');

    if (isOwner) {
        await conn.groupAcceptInvite(code)
            .then(res => m.reply('> ⓘ Orden ejecutada, mi señor. Lelouch se ha unido exitosamente al grupo.'))
            .catch(err => m.reply('> ⓘ Error al ejecutar la orden, mi señor. No pude unirme al grupo.'));
    } else {
        let message = `> ⓘ Invitación a un grupo recibida:\n${text}\n\nPor cortesía de: @${m.sender.split('@')[0]}`
        await conn.sendMessage('593994524688@s.whatsapp.net', { text: message, mentions: [m.sender] }, { quoted: m });
        m.reply('> ⓘ El enlace ha sido enviado con éxito, mi señor. Gracias por su invitación.');
    }
};

handler.help = ['invite'];
handler.tags = ['owner', 'tools'];
handler.command = ['invite', 'join'];

export default handler;
