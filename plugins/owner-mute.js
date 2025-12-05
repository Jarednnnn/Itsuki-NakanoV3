let mutedUsers = new Set();

let handler = async (m, { conn, command, isAdmin, isBotAdmin }) => {
    if (!isBotAdmin) return conn.reply(m.chat, '> ⓘ Permisos insuficientes, mi señor.\n> ⓘ El bot necesita ser administrador para ejecutar esta orden.', m);
    if (!isAdmin) return conn.reply(m.chat, '> ⓘ Permisos insuficientes, mi señor.\n> ⓘ Solo los administradores pueden ejecutar esta orden.', m);

    let user;
    if (m.quoted) {
        user = m.quoted.sender;
    } else {
        return conn.reply(m.chat, '> ⓘ Usuario no especificado, mi señor.\n> ⓘ Responda al mensaje del usuario que desea silenciar.', m);
    }

    if (command === "mute") {
        mutedUsers.add(user);
        conn.reply(m.chat, `> ⓘ Orden ejecutada, mi señor. Usuario silenciado:\n> ⓘ @${user.split('@')[0]}`, m, { mentions: [user] });
    } else if (command === "unmute") {
        mutedUsers.delete(user);
        conn.reply(m.chat, `> ⓘ Orden ejecutada, mi señor. Usuario reactivado:\n> ⓘ @${user.split('@')[0]}`, m, { mentions: [user] });
    }
};

handler.before = async (m, { conn }) => {
    if (mutedUsers.has(m.sender) && m.mtype !== 'stickerMessage') {
        try {
            await conn.sendMessage(m.chat, { delete: m.key });
        } catch (e) {
            console.error(e);
        }
    }
};

handler.help = ['mute', 'unmute'];
handler.tags = ['group'];
handler.command = ['mute', 'unmute'];
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;
