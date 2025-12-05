let cooldowns = {}
let fkontak = { key: { participant: '0@s.whatsapp.net' }, message: { contactMessage: { displayName: '' }} }

// ⓘ Moneda imperial
const currency = 'Coins';
let moneda = '¥'

let handler = async (m, { conn }) => {
let user = global.db.data.users[m.sender];
if (!user) return;

// ⓘ Sistema de cooldown imperial
let time = user.lastmiming + 600000;
if (new Date() - user.lastmiming < 600000) {
    const waitTime = msToTime(time - new Date());
    return conn.reply(m.chat, 
        `ⓘ \`OPERACIÓN DE MINERÍA EN COOLDOWN\` ⏰\n\n` +
        `ⓘ \`Debes esperar:\` ${waitTime}\n\n` +
        `ⓘ \`La extracción eficiente requiere intervalos calculados. La paciencia es táctica.\` 🕰️`,
        m
    );
}

// ⓘ Recursos calculados estratégicamente
let coin = pickRandom([20, 5, 7, 8, 88, 40, 50, 70, 90, 999, 300]);
let emerald = pickRandom([1, 5, 7, 8]);
let iron = pickRandom([5, 6, 7, 9, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80]);
let gold = pickRandom([20, 5, 7, 8, 88, 40, 50]);
let coal = pickRandom([20, 5, 7, 8, 88, 40, 50, 80, 70, 60, 100, 120, 600, 700, 64]);
let stone = pickRandom([200, 500, 700, 800, 900, 4000, 300]);

let img = 'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745557957843.jpeg';

let hasil = Math.floor(Math.random() * 1000);

// ⓘ Reporte de extracción imperial
let info = 
    `ⓘ \`OPERACIÓN DE MINERÍA IMPERIAL COMPLETADA\` ⛏️👑\n\n` +
    `ⓘ \`Te has adentrado en las profundidades de las minas imperiales. Los recursos están bajo mi control.\` 🌋\n\n` +
    `ⓘ \`BOTÍN ESTRATÉGICO ADQUIRIDO:\` 💎\n\n` +
    `ⓘ \`Experiencia táctica:\` ${hasil} puntos 🎯\n` +
    `ⓘ \`Fondos imperiales:\` ${moneda}${coin} ${currency} 💰\n` +
    `ⓘ \`Esmeraldas del trono:\` ${emerald} gemas 💚\n` +
    `ⓘ \`Hierro para armamento:\` ${iron} unidades ⚙️\n` +
    `ⓘ \`Oro de la corona:\` ${gold} lingotes 👑\n` +
    `ⓘ \`Carbón estratégico:\` ${coal} toneladas 🔥\n` +
    `ⓘ \`Piedra para fortificaciones:\` ${stone} bloques 🏰\n\n` +
    `ⓘ \`Todos los recursos calculados y adquiridos según el plan. El imperio se fortalece.\` ♟️`;

await conn.sendFile(m.chat, img, 'yuki.jpg', info, fkontak);
await m.react('⛏️');

// ⓘ Actualización de estadísticas estratégicas
user.health = Math.max(0, user.health - 50);
user.pickaxedurability = Math.max(0, (user.pickaxedurability || 100) - 30);
user.coin = (user.coin || 0) + coin;
user.iron = (user.iron || 0) + iron;
user.gold = (user.gold || 0) + gold;
user.emerald = (user.emerald || 0) + emerald;
user.coal = (user.coal || 0) + coal;
user.stone = (user.stone || 0) + stone;
user.lastmiming = new Date() * 1;

// ⓘ Mensaje de advertencia por daño
if (user.health <= 30) {
    setTimeout(() => {
        conn.reply(m.chat, 
            `ⓘ \`ADVERTENCIA: SALUD CRÍTICA\` ⚠️\n\n` +
            `ⓘ \`Nivel de salud:\` ${user.health}/100\n` +
            `ⓘ \`Durabilidad de pico:\` ${user.pickaxedurability || 100}%\n\n` +
            `ⓘ \`Un soldado herido es inútil para la estrategia. Considera recuperarte antes de la próxima incursión.\` 🏥`,
            m
        );
    }, 1000);
}
}

handler.help = ['minar'];
handler.tags = ['economy'];
handler.command = ['minar', 'miming', 'mine'];
handler.register = true;
handler.group = true;

export default handler;

// ⓘ Funciones auxiliares del sistema
function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
}

function msToTime(duration) {
    var milliseconds = parseInt((duration % 1000) / 100),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? '0' + hours : hours;
    minutes = (minutes < 10) ? '0' + minutes : minutes;
    seconds = (seconds < 10) ? '0' + seconds : seconds;

    return minutes + ' minutos y ' + seconds + ' segundos';
}
