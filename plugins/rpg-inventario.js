import moment from 'moment-timezone';

let handler = async (m, { conn, usedPrefix }) => {
    // ⓘ Sistema de contexto imperial
    const ctxErr = (global.rcanalx || {})
    const ctxWarn = (global.rcanalw || {})
    const ctxOk = (global.rcanalr || {})
    
    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.sender;

    if (!(who in global.db.data.users)) {
        // ⓘ Usuario no registrado en el sistema
        if (ctxErr.inventario) {
            return conn.reply(m.chat, ctxErr.inventario, m);
        }
        return conn.reply(m.chat, 'ⓘ `El individuo no está registrado en la base de datos imperial.`', m);
    }

    let user = global.db.data.users[who];
    let name = conn.getName(who);
    let premium = user.premium ? 'ⓘ `MIEMBRO DE LA NOBLEZA IMPERIAL`' : 'ⓘ `PLEBEYO DEL IMPERIO`';
    
    // ⓘ Definir currency aquí mismo para evitar errores
    const currency = 'Coins';
    let moneda = '¥';

    let text = 
        `ⓘ \`INVENTARIO IMPERIAL DE ${name.toUpperCase()}\` 👑\n\n` +
        `ⓘ \`ESTADO DE CUENTA\` 📊\n` +
        `ⓘ \`Cartera Imperial:\` ${moneda}${user.coin || 0} ${currency}\n` +  
        `ⓘ \`Banco:\` ${moneda}${user.bank || 0} ${currency}\n` + 
        `ⓘ \`Reserva de Esmeraldas:\` ${user.emerald || 0} unidades\n` + 
        `ⓘ \`Suministros de Hierro:\` ${user.iron || 0} unidades\n` +  
        `ⓘ \`Tesoro de Oro:\` ${user.gold || 0} lingotes\n` + 
        `ⓘ \`Carbón Estratégico:\` ${user.coal || 0} toneladas\n` +  
        `ⓘ \`Reserva de Piedra:\` ${user.stone || 0} bloques\n` +  
        `ⓘ \`Experiencia de Batalla:\` ${user.exp || 0} puntos\n` + 
        `ⓘ \`Salud del Soldado:\` ${user.health || 100}/100 puntos\n` + 
        `ⓘ \`Diamantes de la Corona:\` ${user.diamond || 0} gemas\n` +   
        `ⓘ \`Dulces Reales:\` ${user.candies || 0} unidades\n` + 
        `ⓘ \`Regalos Diplomáticos:\` ${user.gifts || 0} unidades\n` + 
        `ⓘ \`Tokens de Lealtad:\` ${user.joincount || 0} unidades\n` +  
        `ⓘ \`Estado Nobiliario:\` ${premium}\n` + 
        `ⓘ \`Última Campaña:\` ${user.lastAdventure ? moment(user.lastAdventure).fromNow() : 'Ninguna registrada'}\n` + 
        `ⓘ \`Fecha del Reporte:\` ${new Date().toLocaleString('es-ES')}\n\n` +
        `ⓘ \Los recursos definen el poder. Tu inventario revela tu posición en el tablero.\ ♟️`;

    // ⓘ Contexto opcional si existe
    if (ctxOk.inventario) {
        text = ctxOk.inventario + '\n\n' + text;
    }

    conn.reply(m.chat, text, m);
}

handler.help = ['inventario', 'inv'];
handler.tags = ['economy'];
handler.command = ['inventario', 'inv']; 
handler.group = true;
handler.register = true;

export default handler;
