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

// Arrays para eventos - PERSONALIDAD LELOUCH
const cofres = [
  "> ⓘ `Has descubierto un cofre imperial abandonado. Una oportunidad que solo los astutos aprovechan.`",
  "> ⓘ `Un cofre del viejo imperio yace ante ti. El destino favorece a quien lo reclama primero.`",
  "> ⓘ `Encontraste recursos olvidados de una antigua campaña militar. Excelente timing.`",
  "> ⓘ `Un depósito secreto ha sido revelado. Como esperaba, estabas en el lugar correcto.`",
  "> ⓘ `Has localizado un tesoro táctico escondido. Tu perspicacia ha dado frutos.`",
  "> ⓘ `Recursos estratégicos descubiertos. Justo lo necesario para continuar con el plan.`",
  "> ⓘ `Un cofre de guerra olvidado emerge de las sombras. Todo según lo calculado.`",
  "> ⓘ `Has interceptado suministros imperiales abandonados. Eficiencia admirable.`"
];

const crimen = [
  { tipo: 'victoria', mensaje: "> ⓘ `Infiltraste el sistema bancario con precisión quirúrgica. Fondos transferidos sin dejar rastro.`" },
  { tipo: 'victoria', mensaje: "> ⓘ `Manipulaste las acciones del mercado a tu favor. Como siempre, todo salió según el plan.`" },
  { tipo: 'victoria', mensaje: "> ⓘ `Ejecutaste un esquema Ponzi perfecto con inversionistas ingenuos. Brillante ejecución.`" },
  { tipo: 'victoria', mensaje: "> ⓘ `Hackeaste la red corporativa y vendiste información clasificada. Estrategia impecable.`" },
  { tipo: 'victoria', mensaje: "> ⓘ `Orquestaste un fraude de seguros sin precedentes. Magistralmente planeado.`" },
  { tipo: 'victoria', mensaje: "> ⓘ `Desviaste fondos gubernamentales usando ingeniería social avanzada. Como predije.`" },
  { tipo: 'victoria', mensaje: "> ⓘ `Clonaste tarjetas de crédito de ejecutivos en una conferencia. Demasiado fácil.`" },
  { tipo: 'victoria', mensaje: "> ⓘ `Falsificaste documentos de alta seguridad y vendiste acceso VIP. Perfección absoluta.`" },
  { tipo: 'victoria', mensaje: "> ⓘ `Chantajeaste a un político corrupto con información comprometedora. Jaque mate.`" },
  { tipo: 'victoria', mensaje: "> ⓘ `Infiltraste una subasta ilegal y robaste obras de arte invaluables. Obra maestra.`" },
  { tipo: 'derrota', mensaje: "> ⓘ `Tu esquema fue descubierto por un analista más astuto de lo esperado. Calculé mal.`" },
  { tipo: 'derrota', mensaje: "> ⓘ `Las cámaras de seguridad capturaron tu rostro. Un error imperdonable de mi parte.`" },
  { tipo: 'derrota', mensaje: "> ⓘ `La víctima resultó ser un agente encubierto. No anticipé esa variable.`" },
  { tipo: 'derrota', mensaje: "> ⓘ `Tu red de lavado de dinero fue rastreada por Interpol. Subestimé su capacidad.`" },
  { tipo: 'derrota', mensaje: "> ⓘ `El sistema de seguridad era más avanzado de lo previsto. Debo recalcular.`" },
  { tipo: 'derrota', mensaje: "> ⓘ `Un testigo inesperado arruinó tu operación perfecta. Variables imprevistas.`" },
  { tipo: 'derrota', mensaje: "> ⓘ `Tu cómplice te traicionó y alertó a las autoridades. Confié en la persona equivocada.`" },
  { tipo: 'derrota', mensaje: "> ⓘ `El firewall adaptativo neutralizó tu ataque cibernético. Tecnología impresionante.`" },
  { tipo: 'derrota', mensaje: "> ⓘ `La policía tendió una trampa y caíste directo en ella. Me superaron esta vez.`" },
  { tipo: 'derrota', mensaje: "> ⓘ `Tu identidad falsa fue comprometida por reconocimiento facial. Error táctico crítico.`" }
];

const trabajoLelouch = [
  "> ⓘ `Planifiqué una estrategia militar avanzada y recibí compensación por mis servicios tácticos`",
  "> ⓘ `Asesoré a líderes políticos en maniobras de poder. Mi expertise vale oro`",
  "> ⓘ `Dicté una conferencia sobre teoría del juego aplicada a conflictos. Conocimiento es poder`",
  "> ⓘ `Vendí análisis de inteligencia a corporaciones multinacionales. Información privilegiada`",
  "> ⓘ `Consulté en estrategias de negociación de alto nivel. Mi experiencia habla por sí misma`",
  "> ⓘ `Diseñé un plan de contingencia para una operación clasificada. Trabajo impecable`",
  "> ⓘ `Impartí entrenamiento táctico a fuerzas especiales. Mi reputación me precede`",
  "> ⓘ `Audité sistemas de seguridad nacional y encontré 47 vulnerabilidades críticas`",
  "> ⓘ `Negocié un tratado comercial entre dos naciones rivales. Diplomacia es mi especialidad`",
  "> ⓘ `Desarrollé un algoritmo de predicción de mercados financieros. Matemática pura`",
  "> ⓘ `Organicé una cumbre secreta entre líderes mundiales. Conexiones son cruciales`",
  "> ⓘ `Redacté legislación para reforma gubernamental. Mi visión se materializa`",
  "> ⓘ `Entrené agentes en operaciones encubiertas. Solo los mejores sobreviven`",
  "> ⓘ `Diseñé protocolos de ciberseguridad para infraestructura crítica. Defensa absoluta`",
  "> ⓘ `Medié en un conflicto internacional evitando una guerra. La paz también es estrategia`",
  "> ⓘ `Publiqué un tratado sobre teoría de la revolución. Mi legado intelectual crece`",
  "> ⓘ `Coordiné operaciones logísticas para misión humanitaria. Eficiencia sin igual`",
  "> ⓘ `Analicé patrones geopolíticos para agencias de inteligencia. Visión de águila`",
  "> ⓘ `Establecí redes diplomáticas entre cinco continentes. Mi influencia se expande`",
  "> ⓘ `Supervisé simulaciones de crisis para gobiernos. Preparación es victoria`",
  "> ⓘ `Decodifiqué comunicaciones encriptadas de organizaciones clandestinas. Nada me es oculto`",
  "> ⓘ `Reestructuré la cadena de mando de una fuerza militar. Jerarquía optimizada`",
  "> ⓘ `Formulé contramedidas ante amenazas terroristas emergentes. Siempre un paso adelante`",
  "> ⓘ `Lideré un think tank sobre el futuro de la guerra moderna. El futuro me pertenece`",
  "> ⓘ `Ejecuté una operación psicológica que cambió la opinión pública. Control maestro`",
  "> ⓘ `Infiltré y desmantelé una red de espionaje industrial. Misión cumplida`",
  "> ⓘ `Programé inteligencia artificial para análisis predictivo militar. Tecnología suprema`",
  "> ⓘ `Consolidé alianzas estratégicas entre corporaciones globales. El tablero es mío`",
  "> ⓘ `Gané el torneo internacional de ajedrez contra grandes maestros. Victoria intelectual absoluta`",
  "> ⓘ `Completé una operación encubierta sin bajas ni testigos. Perfección táctica total`"
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
      return conn.reply(m.chat, '> ⓘ `Este sistema solo opera en grupos. Protocolo estándar.`', m, ctxErr);
    }

    // COMANDO ECONOMY
    if (command === 'economy' || command === 'economia') {
      if (!isAdmin) {
        await m.react('⚠️')
        return conn.reply(m.chat, '> ⓘ `Necesitas autoridad administrativa. Solo los líderes pueden modificar el sistema.`', m, ctxErr);
      }

      if (!global.db.data.chats[m.chat]) {
        global.db.data.chats[m.chat] = { economy: true };
      }

      const action = args[0]?.toLowerCase();
      const currentStatus = global.db.data.chats[m.chat].economy;

      if (!action) {
        const estado = currentStatus ? 'OPERATIVO' : 'INACTIVO';
        await m.react('📊')
        return conn.reply(m.chat, 
          `> ⓘ \`Sistema Económico Imperial\`\n\n` +
          `> ⓘ \`Comando:\` ${usedPrefix}economy <on/off>\n` +
          `> ⓘ \`Estado:\` ${estado}\n\n` +
          `> ⓘ \`Los administradores controlan el flujo económico del grupo.\``,
          m, ctxWarn
        );
      }

      if (action === 'on' || action === 'activar') {
        if (currentStatus) {
          await m.react('ℹ️')
          return conn.reply(m.chat, '> ⓘ `El sistema ya está operativo. No hay necesidad de redundancia.`', m, ctxWarn);
        }
        global.db.data.chats[m.chat].economy = true;
        await m.react('✅')
        return conn.reply(m.chat, 
          '> ⓘ `Sistema Económico Activado`\n\n' +
          '> ⓘ `Todas las operaciones financieras están ahora disponibles. Que comience el juego.`',
          m, ctxOk
        );
      }

      if (action === 'off' || action === 'desactivar') {
        if (!currentStatus) {
          await m.react('ℹ️')
          return conn.reply(m.chat, '> ⓘ `El sistema ya está inactivo. Estado confirmado.`', m, ctxWarn);
        }
        global.db.data.chats[m.chat].economy = false;
        await m.react('❌')
        return conn.reply(m.chat, 
          '> ⓘ `Sistema Económico Desactivado`\n\n' +
          '> ⓘ `Todas las transacciones han sido suspendidas. Decisión ejecutada.`',
          m, ctxWarn
        );
      }

      await m.react('❌')
      return conn.reply(m.chat, '> ⓘ `Parámetro inválido. Usa: on u off`', m, ctxErr);
    }

    // VERIFICAR SI LA ECONOMÍA ESTÁ ACTIVA
    if (!global.db.data.chats[m.chat]?.economy) {
      await m.react('🚫')
      return conn.reply(m.chat, 
        `> ⓘ \`Sistema Económico Inactivo\`\n\n` +
        `> ⓘ \`Activación requerida:\`\n` +
        `> ⓘ \`${usedPrefix}economy on\`\n\n` +
        `> ⓘ \`Solo administradores pueden modificar este parámetro.\``,
        m, ctxErr
      );
    }

    // COMANDO BALANCE
    if (command === 'balance' || command === 'bal' || command === 'dinero') {
      let target = m.sender;

      if (m.mentionedJid && m.mentionedJid.length > 0) {
        target = m.mentionedJid[0];
      } else if (m.quoted) {
        target = m.quoted.sender;
      }

      if (!global.db.data.users[target]) {
        global.db.data.users[target] = {
          coin: 1000,
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

      let name = 'Peón';
      try {
        name = await conn.getName(target);
      } catch {
        name = target.split('@')[0];
      }

      await m.react('💰')
      const texto = 
        `> ⓘ \`Estado Financiero de ${name}\`\n\n` +
        `> ⓘ \`Efectivo:\` ¥${coin.toLocaleString()} ${currency}\n` +
        `> ⓘ \`Depósitos:\` ¥${bank.toLocaleString()} ${currency}\n` +
        `> ⓘ \`Capital Total:\` ¥${total.toLocaleString()} ${currency}\n\n` +
        `> ⓘ \`El poder se mide en recursos. Continúa acumulando.\``;

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
      const gap = 86400000;

      if (user.lastDaily && now < user.lastDaily + gap) {
        const waitTime = formatTime(Math.floor((user.lastDaily + gap - now) / 1000));
        await m.react('⏳')
        return conn.reply(m.chat, 
          `> ⓘ \`Recolección Diaria en Cooldown\`\n\n` +
          `> ⓘ \`Tiempo restante:\` ${waitTime}\n\n` +
          `> ⓘ \`La paciencia es una virtud estratégica. Aguarda tu momento.\``,
          m, ctxWarn
        );
      }

      const baseReward = 5000;
      const streakBonus = (user.streak || 0) * 500;
      const reward = baseReward + streakBonus;
      const expGain = 50;

      user.coin = (user.coin || 1000) + reward;
      user.exp = (user.exp || 0) + expGain;
      user.streak = (user.streak || 0) + 1;
      user.lastDaily = now;

      global.db.data.users[m.sender] = user;

      await m.react('🎉')
      await conn.reply(m.chat,
        `> ⓘ \`Recursos Diarios Adquiridos\`\n\n` +
        `> ⓘ \`Fondos:\` ¥${reward.toLocaleString()} ${currency}\n` +
        `> ⓘ \`Experiencia:\` +${expGain} EXP\n` +
        `> ⓘ \`Racha:\` Día ${user.streak}\n\n` +
        `> ⓘ \`Consistencia es poder. Mantén tu racha activa.\``,
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
      const gap = 86400000;

      if (user.lastcofre && now < user.lastcofre + gap) {
        const waitTime = formatTime(Math.floor((user.lastcofre + gap - now) / 1000));
        await m.react('⏳')
        return conn.reply(m.chat,
          `> ⓘ \`Cofre en Recuperación\`\n\n` +
          `> ⓘ \`Disponible en:\` ${waitTime}\n\n` +
          `> ⓘ \`Los tesoros no aparecen de la nada. Requieren tiempo.\``,
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
        `> ⓘ \`Cofre Imperial Descubierto\`\n\n` +
        `${pickRandom(cofres)}\n\n` +
        `> ⓘ \`Adquisición:\` ¥${reward.toLocaleString()} ${currency}\n` +
        `> ⓘ \`Experiencia:\` +${expGain} EXP\n\n` +
        `> ⓘ \`La fortuna favorece a los audaces. Bien jugado.\``,
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
          `> ⓘ \`Ranking Imperial\`\n\n` +
          `> ⓘ \`No hay participantes registrados.\`\n\n` +
          `> ⓘ \`Usa ${usedPrefix}daily para iniciar tu ascenso al poder.\``,
          m, ctxWarn
        );
      }

      await m.react('🏆')
      let text = `> ⓘ \`Jerarquía Económica Imperial - Top 10\`\n\n`;

      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        let name = 'Anónimo';
        try {
          name = await conn.getName(user.jid);
        } catch {
          name = user.jid.split('@')[0];
        }

        const rank = i === 0 ? '👑' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
        text += `> ⓘ \`${rank} ${name}\`\n`;
        text += `> ⓘ \`Capital:\` ¥${user.total.toLocaleString()} ${currency}\n\n`;
      }

      text += `> ⓘ \`Solo los más astutos dominan la cima. ¿Cuál es tu posición?\``;

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
          `> ⓘ \`Operación en Cooldown\`\n\n` +
          `> ⓘ \`Espera requerida:\` ${wait}\n\n` +
          `> ⓘ \`Las mejores estrategias requieren tiempo de preparación.\``,
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
          `> ⓘ \`Operación Exitosa\`\n\n` +
          `${evento.mensaje}\n\n` +
          `> ⓘ \`Ganancia:\` +¥${cantidad.toLocaleString()} ${currency}\n` +
          `> ⓘ \`Saldo Actual:\` ¥${user.coin.toLocaleString()} ${currency}\n\n` +
          `> ⓘ \`Como predije. Todo según el plan.\``,
          m, ctxOk
        );
      } else {
        cantidad = Math.floor(Math.random() * 1801) + 3000;
        user.coin = Math.max(0, user.coin - cantidad);

        await m.react('❌')
        await conn.reply(m.chat,
          `> ⓘ \`Operación Comprometida\`\n\n` +
          `${evento.mensaje}\n\n` +
          `> ⓘ \`Pérdida:\` -¥${cantidad.toLocaleString()} ${currency}\n` +
          `> ⓘ \`Saldo Actual:\` ¥${user.coin.toLocaleString()} ${currency}\n\n` +
          `> ⓘ \`Incluso los mejores estrategas enfrentan contratiempos. Recalculando.\``,
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
          `> ⓘ \`Trabajo en Cooldown\`\n\n` +
          `> ⓘ \`Disponible en:\` ${tiempoRestante}\n\n` +
          `> ⓘ \`Incluso los estrategas requieren descanso entre misiones.\``,
          m, ctxWarn
        );
      }

      user.lastwork = Date.now();

      let baseGanancia = Math.floor(Math.random() * 1501) + 2000;
      let bonus = Math.random() < 0.2 ? Math.floor(baseGanancia * 0.3) : 0;
      let gananciaTotal = baseGanancia + bonus;

      user.coin += gananciaTotal;

      const trabajo = pickRandom(trabajoLelouch);

      await m.react('💼')
      await conn.reply(m.chat,
        `> ⓘ \`Misión Completada\`\n\n` +
        `${trabajo}\n\n` +
        `> ⓘ \`Compensación:\` ¥${gananciaTotal.toLocaleString()} ${currency}\n` +
        `> ⓘ \`Balance:\` ¥${user.coin.toLocaleString()} ${currency}\n\n` +
        `> ⓘ \`Trabajo eficiente. Como siempre.\``,
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
          `> ⓘ \`Sistema de Depósitos Imperiales\`\n\n` +
          `> ⓘ \`Sintaxis incorrecta. Especifica la cantidad.\`\n\n` +
          `> ⓘ \`Uso:\`\n` +
          `> ⓘ \`${usedPrefix}${command} <cantidad>\`\n` +
          `> ⓘ \`${usedPrefix}${command} all\`\n\n` +
          `> ⓘ \`Ejemplos válidos:\`\n` +
          `> ⓘ \`${usedPrefix}${command} 5000\`\n` +
          `> ⓘ \`${usedPrefix}${command} all\``,
          m, ctxWarn
        );
      }

      if ((args[0]) < 1) {
        await m.react('⚠️')
        return conn.reply(m.chat, 
          `> ⓘ \`Parámetro Inválido\`\n\n` +
          `> ⓘ \`La cantidad debe ser positiva. Lógica básica.\``,
          m, ctxErr
        );
      }

      if (args[0] == 'all') {
        let count = parseInt(user.coin);

        if (count <= 0 || !user.coin) {
          await m.react('💸')
          return conn.reply(m.chat, 
            `> ⓘ \`Fondos Insuficientes\`\n\n` +
            `> ⓘ \`No posees ${currency} en efectivo.\`\n\n` +
            `> ⓘ \`Balance:\` ¥0\n\n` +
            `> ⓘ \`Usa:\` ${usedPrefix}work\n\n` +
            `> ⓘ \`No puedes depositar lo que no tienes. Obvio.\``,
            m, ctxErr
          );
        }

        user.coin -= count * 1;
        user.bank += count * 1;

        await m.react('✅')
        await conn.reply(m.chat, 
          `> ⓘ \`Depósito Total Ejecutado\`\n\n` +
          `> ⓘ \`Transferencia completa al sistema bancario.\`\n\n` +
          `> ⓘ \`Monto:\` ¥${count.toLocaleString()} ${currency}\n` +
          `> ⓘ \`Banco:\` ¥${user.bank.toLocaleString()} ${currency}\n` +
          `> ⓘ \`Efectivo:\` ¥${user.coin.toLocaleString()} ${currency}\n\n` +
          `> ⓘ \`Fondos asegurados. Movimiento estratégico.\``,
          m, ctxOk
        );
        return !0;
      }

      if (!Number(args[0])) {
        await m.react('❌')
        return conn.reply(m.chat, 
          `> ⓘ \`Formato Incorrecto\`\n\n` +
          `> ⓘ \`Debes ingresar valores numéricos.\`\n\n` +
          `> ⓘ \`Ejemplos:\`\n` +
          `> ⓘ \`${usedPrefix}${command} 25000\`\n` +
          `> ⓘ \`${usedPrefix}${command} all\`\n\n` +
          `> ⓘ \`Usa números enteros, no texto.\``,
          m, ctxErr
        );
      }

      let count = parseInt(args[0]);

      if (!user.coin) {
        await m.react('💸')
        return conn.reply(m.chat, 
          `> ⓘ \`Sin Fondos Disponibles\`\n\n` +
          `> ⓘ \`No posees ${currency} en efectivo.\`\n\n` +
          `> ⓘ \`Balance:\` ¥0\n\n` +
          `> ⓘ \`Usa:\` ${usedPrefix}work\n\n` +
          `> ⓘ \`Genera recursos antes de intentar depositarlos.\``,
          m, ctxErr
        );
      }

      if (user.coin < count) {
        await m.react('⚠️')
        return conn.reply(m.chat, 
          `> ⓘ \`Fondos Insuficientes\`\n\n` +
          `> ⓘ \`Capital disponible menor al solicitado.\`\n\n` +
          `> ⓘ \`Efectivo:\` ¥${user.coin.toLocaleString()} ${currency}\n` +
          `> ⓘ \`Solicitado:\` ¥${count.toLocaleString()} ${currency}\n\n` +
          `> ⓘ \`Usa:\` ${usedPrefix}${command} all para depositar todo\n\n` +
          `> ⓘ \`Solo puedes depositar lo que posees. Matemática simple.\``,
          m, ctxWarn
        );
      }

      user.coin -= count * 1;
      user.bank += count * 1;

      await m.react('✅')
      await conn.reply(m.chat, 
        `> ⓘ \`Depósito Ejecutado\`\n\n` +
        `> ⓘ \`Transacción completada exitosamente.\`\n\n` +
        `> ⓘ \`Depositado:\` ¥${count.toLocaleString()} ${currency}\n` +
        `> ⓘ \`Efectivo:\` ¥${user.coin.toLocaleString()} ${currency}\n` +
        `> ⓘ \`Banco:\` ¥${user.bank.toLocaleString()} ${currency}\n` +
        `> ⓘ \`Total:\` ¥${(user.coin + user.bank).toLocaleString()} ${currency}\n\n` +
        `> ⓘ \`Fondos transferidos al depósito seguro. Bien ejecutado.\``,
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
          `> ⓘ \`Sistema de Transferencias Imperiales\`\n\n` +
          `> ⓘ \`Sintaxis incorrecta. Especifica cantidad y destinatario.\`\n\n` +
          `> ⓘ \`Formato:\`\n` +
          `> ⓘ \`${usedPrefix}${command} <cantidad> @usuario\`\n\n` +
          `> ⓘ \`Ejemplo:\`\n` +
          `> ⓘ \`${usedPrefix}${command} 5000 @usuario\`\n\n` +
          `> ⓘ \`Especifica todos los parámetros requeridos.\``,
          m, ctxWarn
        );
      }

      if (!isNumber(args[0]) && args[0].startsWith('@')) {
        await m.react('🔄')
        return conn.reply(m.chat, 
          `> ⓘ \`Orden de Parámetros Incorrecto\`\n\n` +
          `> ⓘ \`La cantidad debe ir primero, luego el destinatario.\`\n\n` +
          `> ⓘ \`Formato correcto:\`\n` +
          `> ⓘ \`${usedPrefix}${command} <cantidad> @usuario\`\n\n` +
          `> ⓘ \`Ejemplo:\`\n` +
          `> ⓘ \`${usedPrefix}${command} 1000 @usuario\`\n\n` +
          `> ⓘ \`Orden lógico: monto primero, receptor después.\``,
          m, ctxErr
        );
      }

      if (!who) {
        await m.react('❌')
        return conn.reply(m.chat, 
          `> ⓘ \`Destinatario No Especificado\`\n\n` +
          `> ⓘ \`Debes indicar el receptor de los ${currency}.\`\n\n` +
          `> ⓘ \`Métodos válidos:\`\n` +
          `> ⓘ \`Responder a su mensaje\`\n` +
          `> ⓘ \`Mencionar con @usuario\`\n` +
          `> ⓘ \`Incluir su número\`\n\n` +
          `> ⓘ \`Especifica el objetivo de la transferencia.\``,
          m, ctxErr
        );
      }

      if (!(who in global.db.data.users)) {
        await m.react('🔍')
        return conn.reply(m.chat, 
          `> ⓘ \`Usuario No Registrado\`\n\n` +
          `> ⓘ \`Este individuo no existe en la base de datos.\`\n\n` +
          `> ⓘ \`El receptor debe haber interactuado con el sistema previamente.\``,
          m, ctxErr
        );
      }

      if (who === m.sender) {
        await m.react('😅')
        return conn.reply(m.chat, 
          `> ⓘ \`Transferencia Autorreferencial Inválida\`\n\n` +
          `> ⓘ \`No puedes transferirte fondos a ti mismo.\`\n\n` +
          `> ⓘ \`Lógica básica. Los recursos ya son tuyos.\``,
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
          `> ⓘ \`Fondos Bancarios Insuficientes\`\n\n` +
          `> ⓘ \`Capital depositado menor al monto solicitado.\`\n\n` +
          `> ⓘ \`Datos Financieros:\`\n` +
          `> ⓘ \`Banco:\` ¥${user.bank.toLocaleString()} ${currency}\n` +
          `> ⓘ \`Solicitado:\` ¥${count.toLocaleString()} ${currency}\n` +
          `> ⓘ \`Déficit:\` ¥${(count - user.bank).toLocaleString()} ${currency}\n\n` +
          `> ⓘ \`Solo puedes transferir fondos depositados en el banco.\`\n\n` +
          `> ⓘ \`Usa:\` ${usedPrefix}deposit para depositar más capital\n\n` +
          `> ⓘ \`Deposita fondos adicionales antes de intentar esta operación.\``,
          m, ctxErr
        );
      }

      if (count < 10) {
        await m.react('⚠️')
        return conn.reply(m.chat, 
          `> ⓘ \`Monto Mínimo No Alcanzado\`\n\n` +
          `> ⓘ \`Transferencia mínima: ¥10 ${currency}\`\n\n` +
          `> ⓘ \`Transacciones microscópicas no son procesadas.\``,
          m, ctxErr
        );
      }

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

      await m.react('✅')
      await conn.reply(m.chat, 
        `> ⓘ \`Transferencia Ejecutada\`\n\n` +
        `> ⓘ \`Operación completada exitosamente.\`\n\n` +
        `> ⓘ \`Datos de Transacción:\`\n` +
        `> ⓘ \`Remitente:\` ${senderName}\n` +
        `> ⓘ \`Destinatario:\` ${name}\n` +
        `> ⓘ \`Monto:\` ¥${count.toLocaleString()} ${currency}\n\n` +
        `> ⓘ \`Tu Balance Actual:\`\n` +
        `> ⓘ \`Banco:\` ¥${user.bank.toLocaleString()} ${currency}\n\n` +
        `> ⓘ \`Transacción procesada. Fondos transferidos exitosamente.\``, 
        m, ctxOk
      );

      await conn.sendMessage(who, {
        text: `> ⓘ \`Transferencia Recibida\`\n\n` +
              `> ⓘ \`Has recibido una transferencia bancaria.\`\n\n` +
              `> ⓘ \`Detalles:\`\n` +
              `> ⓘ \`Remitente:\` ${senderName}\n` +
              `> ⓘ \`Monto:\` ¥${count.toLocaleString()} ${currency}\n` +
              `> ⓘ \`Nuevo Balance:\` ¥${recipient.bank.toLocaleString()} ${currency}\n\n` +
              `> ⓘ \`Los fondos han sido acreditados en tu cuenta bancaria.\`\n` +
              `> ⓘ \`Operación completada. Recursos disponibles.\``
      });
    }

  } catch (error) {
    console.error('Error en economía:', error);
    await m.react('❌')
    conn.reply(m.chat, '> ⓘ `Error crítico en el sistema. Reintenta la operación.`', m, ctxErr);
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
  'work', 'trabajar', 'w',
  'deposit', 'depositar', 'd', 'dep',
  'pay', 'coinsgive', 'givecoins', 'transferir'
];
handler.group = true;

export default handler;
