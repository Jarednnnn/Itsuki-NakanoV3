const currency = 'Coins';

// Inicializar base de datos si no existe
if (!global.db) global.db = { data: { users: {}, chats: {} } };
if (!global.db.data) global.db.data = { users: {}, chats: {} };
if (!global.db.data.users) global.db.data.users = {};
if (!global.db.data.chats) global.db.data.chats = {};

function formatTime(totalSec) {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const txt = [];
  if (h > 0) txt.push(`${h} hora${h !== 1 ? 's' : ''}`);
  if (m > 0 || h > 0) txt.push(`${m} minuto${m !== 1 ? 's' : ''}`);
  txt.push(`${s} segundo${s !== 1 ? 's' : ''}`);
  return txt.join(' ');
}

function formatTimeMs(ms) {
  const totalSec = Math.ceil(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  const partes = [];
  if (min > 0) partes.push(`${min} minuto${min !== 1 ? 's' : ''}`);
  partes.push(`${sec} segundo${sec !== 1 ? 's' : ''}`);
  return partes.join(' ');
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function isNumber(x) {
  return !isNaN(x);
}

// Arrays para eventos aleatorios - MÁS OPCIONES
const cofres = [
  "> `🌸 Has encontrado un cofre antiguo decorado con flores de cerezo.`",
  "> `🎀 Descubriste un cofre mágico de Itsuki Nakano lleno de tesoros.`",
  "> `📚 Te topaste con un cofre de estudio con monedas para libros.`",
  "> `🍱 Encontraste un cofre de bento especial con recompensas.`",
  "> `✨ Un cofre brillante apareció con regalos de Itsuki.`",
  "> `🎓 Cofre académico con premios por excelencia estudiantil.`",
  "> `🏮 Cofre tradicional con monedas del festival escolar.`",
  "> `📖 Cofre literario con recompensas de sabiduría.`"
];

const crimen = [
  { tipo: 'victoria', mensaje: "> `📚 Usaste tus conocimientos para hackear un cajero automático con un exploit del sistema y retiraste efectivo sin alertas`" },
  { tipo: 'victoria', mensaje: "> `📖 Te infiltraste como tutora académica en una mansión y aprovechaste para tomar joyas mientras dabas clases`" },
  { tipo: 'victoria', mensaje: "> `💻 Creaste un software de minería de criptomonedas y obtuviste ganancias silenciosas`" },
  { tipo: 'victoria', mensaje: "> `🎭 Te hiciste pasar por inspector educativo y robaste fondos de una escuela privada`" },
  { tipo: 'victoria', mensaje: "> `🔐 Descifraste la contraseña de una cuenta bancaria y transferiste fondos a tus cuentas`" },
  { tipo: 'victoria', mensaje: "> `📊 Manipulaste los registros de la biblioteca para vender libros raros en el mercado negro`" },
  { tipo: 'victoria', mensaje: "> `💳 Clonaste tarjetas de crédito de compañeros adinerados`" },
  { tipo: 'victoria', mensaje: "> `🏦 Desviaste fondos de una beca estudiantil a tu cuenta`" },
  { tipo: 'victoria', mensaje: "> `📱 Hackeaste una app de pagos y transferiste dinero`" },
  { tipo: 'victoria', mensaje: "> `🎯 Robaste exámenes finales y los vendiste a otros estudiantes`" },
  { tipo: 'derrota', mensaje: "> `📚 Intentaste falsificar un certificado pero el papel y sello eran de mala calidad, te descubrieron`" },
  { tipo: 'derrota', mensaje: "> `📖 Trataste de hackear un sistema escolar pero olvidaste ocultar tu IP y fuiste rastreada`" },
  { tipo: 'derrota', mensaje: "> `💸 Quisiste estafar con una beca falsa pero la víctima era un policía encubierto`" },
  { tipo: 'derrota', mensaje: "> `🔍 Intentaste robar exámenes pero el profesor te estaba vigilando`" },
  { tipo: 'derrota', mensaje: "> `🏫 Planearas un robo en la cafetería pero te atraparon las cámaras de seguridad`" },
  { tipo: 'derrota', mensaje: "> `📉 Tu esquema de inversión fraudulenta fue descubierto por las autoridades`" },
  { tipo: 'derrota', mensaje: "> `🚔 La policía te atrapó intentando hackear el sistema bancario`" },
  { tipo: 'derrota', mensaje: "> `🔒 Fallaste al intentar abrir una caja fuerte en la oficina del director`" },
  { tipo: 'derrota', mensaje: "> `📹 Te grabaron robando material de laboratorio costoso`" },
  { tipo: 'derrota', mensaje: "> `💀 Casi te atrapan vendiendo respuestas de exámenes falsas`" }
];

const trabajoItsuki = [
  "> `📚 Estudié diligentemente para mis exámenes y gané`",
  "> `🏪 Ayudé en la librería familiar y recibí`",
  "> `📝 Escribí un ensayo académico excelente y me pagaron`",
  "> `📂 Organicé mis apuntes de estudio y encontré`",
  "> `👨‍🏫 Di clases particulares a estudiantes más jóvenes y gané`",
  "> `🏆 Participé en un concurso académico y gané`",
  "> `📖 Vendí algunos de mis libros de texto viejos y obtuve`",
  "> `🎵 Ayudé a Miku con sus estudios y me dio`",
  "> `📚 Trabajé como asistente en biblioteca y gané`",
  "> `✍️ Escribí reseñas de libros y recibí`",
  "> `🍱 Preparé bentos para mis hermanas y me pagaron`",
  "> `🎨 Diseñé material de estudio visual y lo vendí`",
  "> `🔬 Ayudé en el laboratorio de ciencias y gané`",
  "> `📊 Creé bases de datos de estudio y las comercialicé`",
  "> `🎭 Participé en una obra teatral escolar y me pagaron`",
  "> `🏅 Gané una competencia de matemáticas y recibí`",
  "> `📻 Fui invitada a un programa de radio académico y gané`",
  "> `💡 Desarrollé una app de estudio y obtuve`",
  "> `🎯 Di un seminario sobre técnicas de estudio y recibí`",
  "> `📈 Asesoré a empresas en estrategias educativas y gané`",
  "> `🎓 Di tutorías para exámenes de admisión y recibí`",
  "> `🏫 Organicé un club de estudio y me pagaron`",
  "> `💼 Trabajé como investigadora asistente y gané`",
  "> `📋 Corregí exámenes para profesores y recibí`",
  "> `🎪 Participé en una feria científica y obtuve`",
  "> `📚 Traduje textos académicos y me pagaron`",
  "> `🏛️ Di una conferencia en la universidad y gané`",
  "> `🔍 Investigué para un proyecto histórico y recibí`",
  "> `📖 Escribí un libro de texto y obtuve regalías`",
  "> `🎓 Me gradué con honores y recibí una beca`"
];

// ==================== HANDLER PRINCIPAL ====================
let handler = async (m, { conn, args, usedPrefix, command, isAdmin, isBotAdmin, participants }) => {
  const ctxErr = (global.rcanalx || {})
  const ctxWarn = (global.rcanalw || {})
  const ctxOk = (global.rcanalr || {})

  try {
    // Verificar si es grupo
    if (!m.isGroup) {
      await m.react('❌')
      return conn.reply(m.chat, '> `🚫 Este comando solo funciona en grupos.`', m, ctxErr);
    }

    // COMANDO ECONOMY
    if (command === 'economy' || command === 'economia') {
      if (!isAdmin) {
        await m.react('⚠️')
        return conn.reply(m.chat, '> `⚠️ Necesitas ser administrador.`', m, ctxErr);
      }

      // Inicializar chat si no existe
      if (!global.db.data.chats[m.chat]) {
        global.db.data.chats[m.chat] = { economy: true };
      }

      const action = args[0]?.toLowerCase();
      const currentStatus = global.db.data.chats[m.chat].economy;

      if (!action) {
        const estado = currentStatus ? '🟢 ACTIVADO' : '🔴 DESACTIVADO';
        await m.react('📊')
        return conn.reply(m.chat, 
          `> \`📊 Estado del Sistema Económico\` 🍙\n\n` +
          `> \`🔧 Comando:\` ${usedPrefix}economy <on/off>\n` +
          `> \`📊 Estado actual:\` ${estado}\n\n` +
          `> \`💡 Activa o desactiva los comandos de economía en este grupo.\``,
          m, ctxWarn
        );
      }

      if (action === 'on' || action === 'activar') {
        if (currentStatus) {
          await m.react('ℹ️')
          return conn.reply(m.chat, '> `ℹ️ El sistema económico ya está activado.`', m, ctxWarn);
        }
        global.db.data.chats[m.chat].economy = true;
        await m.react('✅')
        return conn.reply(m.chat, 
          '> `✅ Sistema Económico Activado` 🍙\n\n' +
          '> `📚 "¡Ahora pueden disfrutar del sistema económico en este grupo!"` ✨',
          m, ctxOk
        );
      }

      if (action === 'off' || action === 'desactivar') {
        if (!currentStatus) {
          await m.react('ℹ️')
          return conn.reply(m.chat, '> `ℹ️ El sistema económico ya está desactivado.`', m, ctxWarn);
        }
        global.db.data.chats[m.chat].economy = false;
        await m.react('❌')
        return conn.reply(m.chat, 
          '> `❌ Sistema Económico Desactivado` 🍙\n\n' +
          '> `📚 "He desactivado el sistema económico en este grupo."` ✨',
          m, ctxWarn
        );
      }

      await m.react('❌')
      return conn.reply(m.chat, '> `❌ Opción no válida. Usa: on u off`', m, ctxErr);
    }

    // VERIFICAR SI LA ECONOMÍA ESTÁ ACTIVA PARA OTROS COMANDOS
    if (!global.db.data.chats[m.chat]?.economy) {
      await m.react('🚫')
      return conn.reply(m.chat, 
        `> \`🚫 Sistema Económico Desactivado\` 🍙\n\n` +
        `> \`📚 Un administrador puede activarlo con:\`\n` +
        `> \`» ${usedPrefix}economy on\`\n\n` +
        `> \`🍙 "Los comandos económicos están deshabilitados en este grupo"\` ✨`,
        m, ctxErr
      );
    }

    // COMANDO BALANCE
    if (command === 'balance' || command === 'bal' || command === 'dinero') {
      let target = m.sender;

      // Verificar si mencionaron a alguien
      if (m.mentionedJid && m.mentionedJid.length > 0) {
        target = m.mentionedJid[0];
      } else if (m.quoted) {
        target = m.quoted.sender;
      }

      // Inicializar usuario si no existe
      if (!global.db.data.users[target]) {
        global.db.data.users[target] = {
          coin: 1000, // Dinero inicial
          bank: 0,
          exp: 0,
          lastDaily: 0,
          lastcofre: 0,
          streak: 0
        };
      }

      const user = global.db.data.users[target];
      const coin = user.coin || 0;
      const bank = user.bank || 0;
      const total = coin + bank;

      let name = 'Usuario';
      try {
        name = await conn.getName(target);
      } catch {
        name = target.split('@')[0];
      }

      await m.react('💰')
      const texto = 
        `> \`📊 BALANCE DE ${name.toUpperCase()}\` 🍙\n\n` +
        `> \`💼 Cartera:\` *¥${coin.toLocaleString()}* ${currency}\n` +
        `> \`🏦 Banco:\` *¥${bank.toLocaleString()}* ${currency}\n` +
        `> \`💰 Total:\` *¥${total.toLocaleString()}* ${currency}\n\n` +
        `> \`📚 "¡Sigue esforzándote!"\` ✨`;

      await conn.reply(m.chat, texto, m, ctxOk);
    }

    // COMANDO DAILY
    if (command === 'daily' || command === 'diario') {
      const user = global.db.data.users[m.sender] || {
        coin: 1000,
        bank: 0,
        exp: 0,
        lastDaily: 0,
        streak: 0
      };

      const now = Date.now();
      const gap = 86400000; // 24 horas

      if (user.lastDaily && now < user.lastDaily + gap) {
        const waitTime = formatTime(Math.floor((user.lastDaily + gap - now) / 1000));
        await m.react('⏳')
        return conn.reply(m.chat, 
          `> \`⏰ Espera un poco más\` 🍙\n\n` +
          `> \`📚 Vuelve en:\` *${waitTime}*\n\n` +
          `> \`🍙 "La paciencia es una virtud"\` ✨`,
          m, ctxWarn
        );
      }

      // Calcular recompensa
      const baseReward = 5000;
      const streakBonus = (user.streak || 0) * 500;
      const reward = baseReward + streakBonus;
      const expGain = 50;

      // Actualizar usuario
      user.coin = (user.coin || 1000) + reward;
      user.exp = (user.exp || 0) + expGain;
      user.streak = (user.streak || 0) + 1;
      user.lastDaily = now;

      // Guardar en la base de datos
      global.db.data.users[m.sender] = user;

      await m.react('🎉')
      await conn.reply(m.chat,
        `> \`🎉 RECOMPENSA DIARIA\` 🍙\n\n` +
        `> \`💰 Monedas:\` *¥${reward.toLocaleString()}* ${currency}\n` +
        `> \`⭐ Experiencia:\` *+${expGain} EXP*\n` +
        `> \`📅 Racha:\` *Día ${user.streak}*\n\n` +
        `> \`📚 "¡Excelente trabajo hoy!"\` ✨`,
        m, ctxOk
      );
    }

    // COMANDO COFRE
    if (command === 'cofre' || command === 'coffer') {
      const user = global.db.data.users[m.sender] || {
        coin: 1000,
        bank: 0,
        exp: 0,
        lastcofre: 0
      };

      const now = Date.now();
      const gap = 86400000; // 24 horas

      if (user.lastcofre && now < user.lastcofre + gap) {
        const waitTime = formatTime(Math.floor((user.lastcofre + gap - now) / 1000));
        await m.react('⏳')
        return conn.reply(m.chat,
          `> \`⏰ Cofre en enfriamiento\` 🍙\n\n` +
          `> \`📚 Vuelve en:\` *${waitTime}*\n\n` +
          `> \`🍙 "Los tesoros necesitan tiempo para regenerarse"\` ✨`,
          m, ctxWarn
        );
      }

      const reward = Math.floor(Math.random() * 3000) + 2000;
      const expGain = Math.floor(Math.random() * 30) + 20;

      user.coin = (user.coin || 1000) + reward;
      user.exp = (user.exp || 0) + expGain;
      user.lastcofre = now;

      global.db.data.users[m.sender] = user;

      await m.react('🎁')
      await conn.reply(m.chat,
        `> \`🎁 ¡COFRE ENCONTRADO!\` 🍙\n\n` +
        `${pickRandom(cofres)}\n\n` +
        `> \`💰 Recompensa:\` *¥${reward.toLocaleString()}* ${currency}\n` +
        `> \`⭐ Experiencia:\` *+${expGain} EXP*\n\n` +
        `> \`📚 "¡Buen trabajo!"\` ✨`,
        m, ctxOk
      );
    }

    // COMANDO BALTOP
    if (command === 'baltop' || command === 'top') {
      const users = Object.entries(global.db.data.users)
        .map(([jid, data]) => ({
          jid,
          coin: data.coin || 0,
          bank: data.bank || 0,
          total: (data.coin || 0) + (data.bank || 0)
        }))
        .filter(user => user.total > 0)
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);

      if (users.length === 0) {
        await m.react('📊')
        return conn.reply(m.chat,
          `> \`📊 TOP RICOS\` 🍙\n\n` +
          `> \`📝 Aún no hay usuarios con dinero.\`\n\n` +
          `> \`💡 Usa ${usedPrefix}daily para empezar\`\n\n` +
          `> \`📚 "¡Sé el primero en aparecer en el top!"\` ✨`,
          m, ctxWarn
        );
      }

      await m.react('🏆')
      let text = `> \`🏆 TOP 10 - USUARIOS MÁS RICOS\` 🍙\n\n`;

      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        let name = 'Usuario';
        try {
          name = await conn.getName(user.jid);
        } catch {
          name = user.jid.split('@')[0];
        }

        text += `> \`${i + 1}. 🎯 ${name}\`\n`;
        text += `> \`   💰 Total:\` *¥${user.total.toLocaleString()}* ${currency}\n\n`;
      }

      text += `> \`📚 "¡Sigue esforzándote para subir en el ranking!"\` ✨`;

      await conn.reply(m.chat, text, m, ctxOk);
    }

    // COMANDO CRIMEN
    if (command === 'crimen' || command === 'crime' || command === 'accion') {
      let user = global.db.data.users[m.sender];
      if (!user) {
        user = global.db.data.users[m.sender] = {
          coin: 1000,
          lastcrime: 0
        };
      }

      user.lastcrime = user.lastcrime || 0;
      user.coin = user.coin || 0;

      const cooldown = 3 * 60 * 1000;
      const ahora = Date.now();

      if (ahora - user.lastcrime < cooldown) {
        const restante = (user.lastcrime + cooldown) - ahora;
        const wait = formatTimeMs(restante);
        await m.react('⏳')
        return conn.reply(m.chat, 
          `> \`⏰ TIEMPO DE ESPERA\` 🍙\n\n` +
          `> \`⏳ Debes esperar:\` *${wait}*\n\n` +
          `> \`📚 "La paciencia es clave en el crimen"\` ✨`,
          m, ctxWarn
        );
      }

      user.lastcrime = ahora;

      const evento = pickRandom(crimen);
      let cantidad;

      if (evento.tipo === 'victoria') {
        cantidad = Math.floor(Math.random() * 2001) + 5000;
        user.coin += cantidad;

        await m.react('✅')
        await conn.reply(m.chat, 
          `> \`✅ ACCIÓN EXITOSA\` 🍙\n\n` +
          `${evento.mensaje}\n\n` +
          `> \`💰 Ganancia:\` *+¥${cantidad.toLocaleString()}* ${currency}\n` +
          `> \`🎒 Cartera:\` *¥${user.coin.toLocaleString()}* ${currency}\n\n` +
          `> \`📚 "¡Operación completada con éxito!"\` ✨`,
          m, ctxOk
        );
      } else {
        cantidad = Math.floor(Math.random() * 1801) + 3000;
        user.coin = Math.max(0, user.coin - cantidad);

        await m.react('❌')
        await conn.reply(m.chat,
          `> \`❌ ACCIÓN FALLIDA\` 🍙\n\n` +
          `${evento.mensaje}\n\n` +
          `> \`💸 Pérdida:\` *-¥${cantidad.toLocaleString()}* ${currency}\n` +
          `> \`🎒 Cartera:\` *¥${user.coin.toLocaleString()}* ${currency}\n\n` +
          `> \`📚 "Mejor suerte la próxima vez"\` ✨`,
          m, ctxErr
        );
      }
    }

    // COMANDO WORK
    if (command === 'w' || command === 'trabajar') {
      let user = global.db.data.users[m.sender];
      const cooldown = 2 * 60 * 1000;

      if (!user) {
        user = global.db.data.users[m.sender] = {
          coin: 1000,
          lastwork: 0
        };
      }

      if (!user.lastwork) user.lastwork = 0;

      if (Date.now() - user.lastwork < cooldown) {
        const tiempoRestante = formatTimeMs(user.lastwork + cooldown - Date.now());
        await m.react('⏳')
        return conn.reply(m.chat, 
          `> \`⏰ DEBES ESPERAR\` 🍙\n\n` +
          `> \`📚 Vuelve en:\` *${tiempoRestante}*\n\n` +
          `> \`🍙 "El trabajo duro requiere descanso"\` ✨`,
          m, ctxWarn
        );
      }

      user.lastwork = Date.now();

      let baseGanancia = Math.floor(Math.random() * 1501) + 2000;
      let bonus = Math.random() < 0.2 ? Math.floor(baseGanancia * 0.3) : 0;
      let gananciaTotal = baseGanancia + bonus;

      user.coin += gananciaTotal;

      const trabajo = pickRandom(trabajoItsuki);

      await m.react('💼')
      await conn.reply(m.chat,
        `> \`💼 TRABAJO COMPLETADO\` 🍙\n\n` +
        `${trabajo}\n\n` +
        `> \`💰 Ganancia:\` *¥${gananciaTotal.toLocaleString()}* ${currency}\n` +
        `> \`🎒 Cartera:\` *¥${user.coin.toLocaleString()}* ${currency}\n\n` +
        `> \`📚 "¡Buen trabajo Itsuki!"\` ✨`,
        m, ctxOk
      );
    }

    // COMANDO DEPOSITAR
    if (command === 'deposit' || command === 'depositar' || command === 'd' || command === 'dep') {
      let user = global.db.data.users[m.sender];
      if (!user) {
        user = global.db.data.users[m.sender] = {
          coin: 1000,
          bank: 0
        };
      }

      if (!args[0]) {
        await m.react('💳')
        return conn.reply(m.chat, 
          `> \`💳 DEPÓSITO BANCARIO\` 🍙\n\n` +
          `> \`❌ Debes especificar una cantidad\`\n\n` +
          `> \`📝 Uso:\`\n` +
          `> \`• ${usedPrefix}${command} <cantidad>\`\n` +
          `> \`• ${usedPrefix}${command} all\`\n\n` +
          `> \`💡 Ejemplos:\`\n` +
          `> \`• ${usedPrefix}${command} 5000\`\n` +
          `> \`• ${usedPrefix}${command} all\`\n\n` +
          `> \`📚 "Especifica cuánto deseas depositar"\` ✨`,
          m, ctxWarn
        );
      }

      if ((args[0]) < 1) {
        await m.react('⚠️')
        return conn.reply(m.chat, 
          `> \`⚠️ CANTIDAD INVÁLIDA\` 🍙\n\n` +
          `> \`❌ La cantidad debe ser mayor a 0\`\n\n` +
          `> \`📚 "No puedes depositar cantidades negativas"\` ✨`,
          m, ctxErr
        );
      }

      if (args[0] == 'all') {
        let count = parseInt(user.coin);

        if (count <= 0 || !user.coin) {
          await m.react('💸')
          return conn.reply(m.chat, 
            `> \`💸 SIN FONDOS\` 🍙\n\n` +
            `> \`❌ No tienes ${currency} en tu cartera\`\n\n` +
            `> \`👛 Cartera:\` *¥0*\n\n` +
            `> \`💡 Usa:\` ${usedPrefix}work\n\n` +
            `> \`📚 "Primero necesitas ganar dinero"\` ✨`,
            m, ctxErr
          );
        }

        user.coin -= count * 1;
        user.bank += count * 1;

        await m.react('✅')
        await conn.reply(m.chat, 
          `> \`✅ DEPÓSITO COMPLETO\` 🍙\n\n` +
          `> \`📚 Has depositado todo tu dinero\`\n\n` +
          `> \`💰 Monto:\` *¥${count.toLocaleString()}* ${currency}\n` +
          `> \`🏦 Banco:\` *¥${user.bank.toLocaleString()}* ${currency}\n` +
          `> \`👛 Cartera:\` *¥${user.coin.toLocaleString()}* ${currency}\n\n` +
          `> \`📚 "¡Dinero seguro en el banco!"\` ✨`,
          m, ctxOk
        );
        return !0;
      }

      if (!Number(args[0])) {
        await m.react('❌')
        return conn.reply(m.chat, 
          `> \`❌ FORMATO INCORRECTO\` 🍙\n\n` +
          `> \`⚠️ Debes ingresar un número válido\`\n\n` +
          `> \`📝 Ejemplos:\`\n` +
          `> \`• ${usedPrefix}${command} 25000\`\n` +
          `> \`• ${usedPrefix}${command} all\`\n\n` +
          `> \`📚 "Usa números para especificar la cantidad"\` ✨`,
          m, ctxErr
        );
      }

      let count = parseInt(args[0]);

      if (!user.coin) {
        await m.react('💸')
        return conn.reply(m.chat, 
          `> \`💸 SIN FONDOS\` 🍙\n\n` +
          `> \`❌ No tienes ${currency} en tu cartera\`\n\n` +
          `> \`👛 Cartera:\` *¥0*\n\n` +
          `> \`💡 Usa:\` ${usedPrefix}work\n\n` +
          `> \`📚 "Primero trabaja para ganar dinero"\` ✨`,
          m, ctxErr
        );
      }

      if (user.coin < count) {
        await m.react('⚠️')
        return conn.reply(m.chat, 
          `> \`⚠️ FONDOS INSUFICIENTES\` 🍙\n\n` +
          `> \`❌ No tienes suficiente dinero\`\n\n` +
          `> \`👛 Cartera:\` *¥${user.coin.toLocaleString()}* ${currency}\n` +
          `> \`💰 Intentaste:\` *¥${count.toLocaleString()}* ${currency}\n\n` +
          `> \`💡 Usa:\` ${usedPrefix}${command} all para depositar todo\n\n` +
          `> \`📚 "Solo puedes depositar lo que tienes"\` ✨`,
          m, ctxWarn
        );
      }

      user.coin -= count * 1;
      user.bank += count * 1;

      await m.react('✅')
      await conn.reply(m.chat, 
        `> \`✅ DEPÓSITO EXITOSO\` 🍙\n\n` +
        `> \`📚 Depósito realizado correctamente\`\n\n` +
        `> \`💰 Monto:\` *¥${count.toLocaleString()}* ${currency}\n` +
        `> \`👛 Cartera:\` *¥${user.coin.toLocaleString()}* ${currency}\n` +
        `> \`🏦 Banco:\` *¥${user.bank.toLocaleString()}* ${currency}\n` +
        `> \`💎 Total:\` *¥${(user.coin + user.bank).toLocaleString()}* ${currency}\n\n` +
        `> \`📚 "¡Dinero transferido al banco con éxito!"\` ✨`,
        m, ctxOk
      );
    }

    // COMANDO PAY
    if (command === 'pay' || command === 'coinsgive' || command === 'givecoins' || command === 'transferir') {
      let mentionedJid = await m.mentionedJid;
      const who = m.quoted ? await m.quoted.sender : (mentionedJid && mentionedJid[0]) || (args[1] ? (args[1].replace(/[@ .+-]/g, '') + '@s.whatsapp.net') : '');

      if (!args[0]) {
        await m.react('💸')
        return conn.reply(m.chat, 
          `> \`💸 TRANSFERENCIA BANCARIA\` 🍙\n\n` +
          `> \`❌ Debes especificar la cantidad y el destinatario\`\n\n` +
          `> \`📝 Uso correcto:\`\n` +
          `> \`${usedPrefix}${command} <cantidad> @usuario\`\n\n` +
          `> \`💡 Ejemplo:\`\n` +
          `> \`${usedPrefix}${command} 5000 @usuario\`\n\n` +
          `> \`📚 "Especifica cuánto deseas transferir y a quién"\` ✨`,
          m, ctxWarn
        );
      }

      if (!isNumber(args[0]) && args[0].startsWith('@')) {
        await m.react('🔄')
        return conn.reply(m.chat, 
          `> \`🔄 ORDEN INCORRECTO\` 🍙\n\n` +
          `> \`❌ Primero indica la cantidad, luego la persona\`\n\n` +
          `> \`📝 Formato correcto:\`\n` +
          `> \`${usedPrefix}${command} <cantidad> @usuario\`\n\n` +
          `> \`💡 Ejemplo:\`\n` +
          `> \`${usedPrefix}${command} 1000 @usuario\`\n\n` +
          `> \`📚 "El orden correcto es: cantidad primero, destinatario después"\` ✨`,
          m, ctxErr
        );
      }

      if (!who) {
        await m.react('❌')
        return conn.reply(m.chat, 
          `> \`❌ DESTINATARIO FALTANTE\` 🍙\n\n` +
          `> \`⚠️ Debes mencionar a quién le transferirás ${currency}\`\n\n` +
          `> \`📝 Formas de mencionar:\`\n` +
          `> \`• Responder a su mensaje\`\n` +
          `> \`• Mencionar con @usuario\`\n` +
          `> \`• Usar su número\`\n\n` +
          `> \`📚 "Necesito saber a quién enviar el dinero"\` ✨`,
          m, ctxErr
        );
      }

      if (!(who in global.db.data.users)) {
        await m.react('🔍')
        return conn.reply(m.chat, 
          `> \`🔍 USUARIO NO REGISTRADO\` 🍙\n\n` +
          `> \`⚠️ Este usuario no está en mi base de datos\`\n\n` +
          `> \`📚 "El destinatario debe haber usado el bot al menos una vez"\` ✨`,
          m, ctxErr
        );
      }

      if (who === m.sender) {
        await m.react('😅')
        return conn.reply(m.chat, 
          `> \`😅 TRANSFERENCIA INVÁLIDA\` 🍙\n\n` +
          `> \`❌ No puedes transferirte dinero a ti mismo\`\n\n` +
          `> \`📚 "Eso no tiene sentido... ¡ya es tu dinero!"\` ✨`,
          m, ctxWarn
        );
      }

      let user = global.db.data.users[m.sender];
      let recipient = global.db.data.users[who];
      let count = Math.min(Number.MAX_SAFE_INTEGER, Math.max(10, (isNumber(args[0]) ? parseInt(args[0]) : 10)));

      if (typeof user.bank !== 'number') user.bank = 0;

      if (user.bank < count) {
        await m.react('💸')
        return conn.reply(m.chat, 
          `> \`💸 FONDOS INSUFICIENTES\` 🍙\n\n` +
          `> \`❌ No tienes suficiente dinero en el banco\`\n\n` +
          `> \`💰 Datos:\`\n` +
          `> \`🏦 Dinero en banco:\` *¥${user.bank.toLocaleString()}* ${currency}\n` +
          `> \`💸 Intentaste transferir:\` *¥${count.toLocaleString()}* ${currency}\n` +
          `> \`❌ Faltante:\` *¥${(count - user.bank).toLocaleString()}* ${currency}\n\n` +
          `> \`📚 "Solo puedes transferir el dinero que tienes en el banco"\`\n\n` +
          `> \`💡 Usa:\` *${usedPrefix}deposit* para depositar más dinero\n\n` +
          `> \`🍙 "¡Deposita más fondos para poder transferir!"\` ✨`,
          m, ctxErr
        );
      }

      if (count < 10) {
        await m.react('⚠️')
        return conn.reply(m.chat, 
          `> \`⚠️ MONTO MÍNIMO\` 🍙\n\n` +
          `> \`❌ La cantidad mínima a transferir es ¥10 ${currency}\`\n\n` +
          `> \`📚 "Las transferencias muy pequeñas no son procesadas"\` ✨`,
          m, ctxErr
        );
      }

      // Realizar la transferencia
      user.bank -= count;
      if (typeof recipient.bank !== 'number') recipient.bank = 0;
      recipient.bank += count;

      if (isNaN(user.bank)) user.bank = 0;

      let name = await (async () => global.db.data.users[who] ? global.db.data.users[who].name : (async () => { 
        try { 
          const n = await conn.getName(who); 
          return typeof n === 'string' && n.trim() ? n : who.split('@')[0]; 
        } catch { 
          return who.split('@')[0]; 
        } 
      })())();

      const senderName = await conn.getName(m.sender) || m.sender.split('@')[0];

      // Mensaje de confirmación al remitente
      await m.react('✅')
      await conn.reply(m.chat, 
        `> \`✅ TRANSFERENCIA EXITOSA\` 🍙\n\n` +
        `> \`📚 Transferencia completada correctamente\`\n\n` +
        `> \`📊 Detalles de la transacción:\`\n` +
        `> \`👤 De:\` *${senderName}*\n` +
        `> \`👤 Para:\` *${name}*\n` +
        `> \`💵 Monto:\` *¥${count.toLocaleString()}* ${currency}\n\n` +
        `> \`💰 Tu nuevo balance:\`\n` +
        `> \`🏦 Banco:\` *¥${user.bank.toLocaleString()}* ${currency}\n\n` +
        `> \`📚 "Transferencia procesada con éxito"\`\n` +
        `> \`🍙 "¡Gracias por usar el sistema bancario de Itsuki!"\` ✨`, 
        m, ctxOk
      );

      // Notificar al destinatario
      await conn.sendMessage(who, {
        text: `> \`💰 DINERO RECIBIDO\` 🍙\n\n` +
              `> \`🎉 ¡Has recibido una transferencia!\`\n\n` +
              `> \`📊 Detalles:\`\n` +
              `> \`👤 De:\` *${senderName}*\n` +
              `> \`💵 Monto recibido:\` *¥${count.toLocaleString()}* ${currency}\n` +
              `> \`🏦 Nuevo balance:\` *¥${recipient.bank.toLocaleString()}* ${currency}\n\n` +
              `> \`📚 "¡Alguien te ha enviado dinero!"\`\n` +
              `> \`🍙 "El dinero ya está disponible en tu banco"\` ✨`
      });
    }

  } catch (error) {
    console.error('Error en economía:', error);
    await m.react('❌')
    conn.reply(m.chat, '> `❌ Ocurrió un error. Intenta nuevamente.`', m, ctxErr);
  }
};

// Configuración del handler
handler.help = [
  'economy',
  'balance', 
  'daily',
  'cofre',
  'baltop',
  'crimen',
  'work',
  'deposit',
  'pay'
];

handler.tags = ['economy'];
handler.command = [
  'economy', 'economia',
  'balance', 'bal', 'dinero', 
  'daily', 'diario',
  'cofre', 'coffer',
  'baltop', 'top',
  'crimen', 'crime', 'accion',
  'w', 'trabajar',
  'deposit', 'depositar', 'd', 'dep',
  'pay', 'coinsgive', 'givecoins', 'transferir'
];
handler.group = true;

export default handler;