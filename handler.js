import { smsg } from "./lib/simple.js"
import { format } from "util"
import { fileURLToPath } from "url"
import path, { join } from "path"
import fs, { unwatchFile, watchFile } from "fs"
import chalk from "chalk"
import fetch from "node-fetch"
import ws from "ws"

const { proto } = (await import("@whiskeysockets/baileys")).default
const isNumber = x => typeof x === "number" && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(function () {
clearTimeout(this)
resolve()
}, ms))

// 🚨 IMPORTANTE: Esta lista solo es usada por la función de detección de prefijos generales, 
// pero en la lógica principal del handler, solo se usa el prefijo del chat o el punto (.).
const globalPrefixes = [
    '.', ',', '!', '#', '$', '%', '&', '*',
    '-', '_', '+', '=', '|', '\\', '/', '~',
    '>', '<', '^', '?', ':', ';'
]

const detectPrefix = (text, customPrefix = null) => {
    if (!text || typeof text !== 'string') return null

    // Aseguramos que customPrefix sea una lista de prefijos a buscar
    const prefixesToSearch = Array.isArray(customPrefix) ? customPrefix : (customPrefix ? [customPrefix] : [])

    for (const prefix of prefixesToSearch) {
        if (text.startsWith(prefix)) {
            return { 
                match: prefix, 
                prefix: prefix, 
                type: 'detected'
            }
        }
    }
    return null
}

const paisesCodigos = {
    'arabia': ['+966', '966'],
    'emiratos': ['+971', '971'],
    'qatar': ['+974', '974'],
    'kuwait': ['+965', '965'],
    'bahrein': ['+973', '973'],
    'oman': ['+968', '968'],
    'egipto': ['+20', '20'],
    'jordania': ['+962', '962'],
    'siria': ['+963', '963'],
    'irak': ['+964', '964'],
    'yemen': ['+967', '967'],
    'palestina': ['+970', '970'],
    'libano': ['+961', '961'],
    'india': ['+91', '91'],
    'pakistan': ['+92', '92'],
    'bangladesh': ['+880', '880'],
    'afganistan': ['+93', '93'],
    'nepal': ['+977', '977'],
    'sri-lanka': ['+94', '94'],
    'nigeria': ['+234', '234'],
    'ghana': ['+233', '233'],
    'kenia': ['+254', '254'],
    'etiopia': ['+251', '251'],
    'sudafrica': ['+27', '27'],
    'senegal': ['+221', '221'],
    'china': ['+86', '86'],
    'indonesia': ['+62', '62'],
    'filipinas': ['+63', '63'],
    'vietnam': ['+84', '84'],
    'tailandia': ['+66', '66'],
    'rusia': ['+7', '7'],
    'ucrania': ['+380', '380'],
    'rumania': ['+40', '40'],
    'polonia': ['+48', '48'],
    'mexico': ['+52', '52'],
    'brasil': ['+55', '55'],
    'argentina': ['+54', '54'],
    'colombia': ['+57', '57'],
    'peru': ['+51', '51'],
    'chile': ['+56', '56'],
    'venezuela': ['+58', '58']
}

function detectCountryByNumber(number) {
    const numStr = number.toString()
    for (const [country, codes] of Object.entries(paisesCodigos)) {
        for (const code of codes) {
            if (numStr.startsWith(code.replace('+', ''))) {
                return country
            }
        }
    }
    return 'local'
}

function getCountryName(code) {
    const countryNames = {
        'arabia': 'Arabia Saudita',
        'emiratos': 'Emiratos Árabes',
        'qatar': 'Qatar',
        'kuwait': 'Kuwait',
        'bahrein': 'Bahréin',
        'oman': 'Omán',
        'egipto': 'Egipto',
        'jordania': 'Jordania',
        'siria': 'Siria',
        'irak': 'Irak',
        'yemen': 'Yemen',
        'palestina': 'Palestina',
        'libano': 'Líbano',
        'india': 'India',
        'pakistan': 'Pakistán',
        'bangladesh': 'Bangladesh',
        'afganistan': 'Afganistán',
        'nepal': 'Nepal',
        'sri-lanka': 'Sri Lanka',
        'nigeria': 'Nigeria',
        'ghana': 'Ghana',
        'kenia': 'Kenia',
        'etiopia': 'Etiopía',
        'sudafrica': 'Sudáfrica',
        'senegal': 'Senegal',
        'china': 'China',
        'indonesia': 'Indonesia',
        'filipinas': 'Filipinas',
        'vietnam': 'Vietnam',
        'tailandia': 'Tailandia',
        'rusia': 'Rusia',
        'ucrania': 'Ucrania',
        'rumania': 'Rumania',
        'polonia': 'Polonia',
        'mexico': 'México',
        'brasil': 'Brasil',
        'argentina': 'Argentina',
        'colombia': 'Colombia',
        'peru': 'Perú',
        'chile': 'Chile',
        'venezuela': 'Venezuela',
        'local': 'Local'
    }
    return countryNames[code] || code
}

async function isUserAdmin(conn, groupJid, userJid) {
    try {
        const metadata = await conn.groupMetadata(groupJid)
        const participant = metadata.participants.find(p => p.id === userJid)
        return participant && (participant.admin === 'admin' || participant.admin === 'superadmin')
    } catch (error) {
        return false
    }
}

export async function handler(chatUpdate) {
this.msgqueque = this.msgqueque || []
this.uptime = this.uptime || Date.now()
if (!chatUpdate) return
this.pushMessage(chatUpdate.messages).catch(console.error)
let m = chatUpdate.messages[chatUpdate.messages.length - 1]
if (!m) return
if (global.db.data == null) await global.loadDatabase()
try {
m = smsg(this, m) || m
if (!m) return
m.exp = 0
try {
let user = global.db.data.users[m.sender]
if (typeof user !== "object") global.db.data.users[m.sender] = {}
if (user) {
if (!("name" in user)) user.name = m.name
if (!("exp" in user) || !isNumber(user.exp)) user.exp = 0
if (!("coin" in user) || !isNumber(user.coin)) user.coin = 0
if (!("bank" in user) || !isNumber(user.bank)) user.bank = 0
if (!("level" in user) || !isNumber(user.level)) user.level = 0
if (!("health" in user) || !isNumber(user.health)) user.health = 100
if (!("genre" in user)) user.genre = ""
if (!("birth" in user)) user.birth = ""
if (!("marry" in user)) user.marry = ""
if (!("description" in user)) user.description = ""
if (!("packstickers" in user)) user.packstickers = null
if (!("premium" in user)) user.premium = false
if (!("premiumTime" in user)) user.premiumTime = 0
if (!("banned" in user)) user.banned = false
if (!("bannedReason" in user)) user.bannedReason = ""
if (!("commands" in user) || !isNumber(user.commands)) user.commands = 0
if (!("afk" in user) || !isNumber(user.afk)) user.afk = -1
if (!("afkReason" in user)) user.afkReason = ""
if (!("warn" in user) || !isNumber(user.warn)) user.warn = 0
} else global.db.data.users[m.sender] = {
name: m.name,
exp: 0,
coin: 0,
bank: 0,
level: 0,
health: 100,
genre: "",
birth: "",
marry: "",
description: "",
packstickers: null,
premium: false,
premiumTime: 0,
banned: false,
bannedReason: "",
commands: 0,
afk: -1,
afkReason: "",
warn: 0
}
let chat = global.db.data.chats[m.chat]
if (typeof chat !== "object") global.db.data.chats[m.chat] = {}
if (chat) {
if (!("isBanned" in chat)) chat.isBanned = false
if (!("isMute" in chat)) chat.isMute = false
if (!("welcome" in chat)) chat.welcome = false
if (!("sWelcome" in chat)) chat.sWelcome = ""
if (!("sBye" in chat)) chat.sBye = ""
if (!("detect" in chat)) chat.detect = true
if (!("primaryBot" in chat)) chat.primaryBot = null
if (!("modoadmin" in chat)) chat.modoadmin = false
if (!("antiLink" in chat)) chat.antiLink = true
if (!("nsfw" in chat)) chat.nsfw = false
if (!("economy" in chat)) chat.economy = true
if (!("gacha" in chat)) chat.gacha = true

if (!("antiArabe" in chat)) chat.antiArabe = true
if (!("antiExtranjero" in chat)) chat.antiExtranjero = false
if (!("paisesBloqueados" in chat)) chat.paisesBloqueados = []
if (!("rootowner" in chat)) chat.rootowner = false
if (!("adminmode" in chat)) chat.adminmode = false
if (!("prefix" in chat)) chat.prefix = null
if (!("prefixes" in chat)) chat.prefixes = []

} else global.db.data.chats[m.chat] = {
isBanned: false,
isMute: false,
welcome: false,
sWelcome: "",
sBye: "",
detect: true,
primaryBot: null,
modoadmin: false,
antiLink: true,
nsfw: false,
economy: true,
gacha: true,

antiArabe: true,
antiExtranjero: false,
paisesBloqueados: [],
rootowner: false,
adminmode: false,
prefix: null,
prefixes: []

}
let settings = global.db.data.settings[this.user.jid]
if (typeof settings !== "object") global.db.data.settings[this.user.jid] = {}
if (settings) {
if (!("self" in settings)) settings.self = false
if (!("jadibotmd" in settings)) settings.jadibotmd = true
} else global.db.data.settings[this.user.jid] = {
self: false,
jadibotmd: true
}} catch (e) {
console.error(e)
}
if (typeof m.text !== "string") m.text = ""
const user = global.db.data.users[m.sender]
try {
const actual = user.name || ""
const nuevo = m.pushName || await this.getName(m.sender)
if (typeof nuevo === "string" && nuevo.trim() && nuevo !== actual) {
user.name = nuevo
}} catch {}
const chat = global.db.data.chats[m.chat]
const settings = global.db.data.settings[this.user.jid]  
const isROwner = [...global.owner.map(([number]) => number)].map(v => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net").includes(m.sender)
const isOwner = isROwner || m.fromMe

if (chat?.rootowner && !isROwner) {
    return
}

const isPrems = isROwner || global.prems.map(v => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net").includes(m.sender) || user.premium == true
const isOwners = [this.user.jid, ...global.owner.map((number) => number + "@s.whatsapp.net")].includes(m.sender)
if (opts["queque"] && m.text && !(isPrems)) {
const queque = this.msgqueque, time = 1000 * 5
const previousID = queque[queque.length - 1]
queque.push(m.id || m.key.id)
setInterval(async function () {
if (queque.indexOf(previousID) === -1) clearInterval(this)
await delay(time)
}, time)
}

if (m.isBaileys) return
m.exp += Math.ceil(Math.random() * 10)

try {
    if (m.message && m.key.remoteJid.endsWith('@g.us')) {
        const text = m.text || ''
        const sender = m.sender
        const userNumber = sender.split('@')[0]

        const userCountry = detectCountryByNumber(userNumber)
        const countryName = getCountryName(userCountry)

        if (chat.antiArabe) {
            const paisesArabes = [
                '+966', '966', 
                '+971', '971', 
                '+974', '974', 
                '+965', '965', 
                '+973', '973', 
                '+968', '968', 
                '+20', '20',    
                '+962', '962', 
                '+963', '963', 
                '+964', '964', 
                '+967', '967', 
                '+970', '970', 
                '+961', '961', 
                '+218', '218', 
                '+212', '212', 
                '+216', '216', 
                '+213', '213', 
                '+222', '222', 
                '+253', '253', 
                '+252', '252', 
                '+249', '249'    
            ]

            const esArabe = paisesArabes.some(code => userNumber.startsWith(code.replace('+', '')))

            if (esArabe) {
                const isUserAdm = await isUserAdmin(this, m.chat, sender)
                if (!isUserAdm) {
                    // Eliminación del usuario
                    await this.groupParticipantsUpdate(m.chat, [sender], 'remove')
                    
                    // Notificación de Ejecución
                    await this.sendMessage(m.chat, { 
                        text: `╭─「 PROTOCOLO ANTI-ARABE (EJECUTADO) 」
│ 
│ *DIRECTRIZ: Expulsar elemento de código 9xx*
│ 
│ 📋 *INFORME DE ACCIÓN:*
│ ├ Elemento: *Detectado como código árabe*
│ ├ Localización: Número árabe
│ ├ Razón: Infracción del Protocolo Anti-Arabe
│ ├ Acción: **Removido del Grupo**
│ 
│ 💡 *MODIFICACIÓN DEL SISTEMA:*
│ └ Use el comando .antiarabe off
╰─◉`.trim(),
                        mentions: [sender]
                    })
                    return
                }
            }
        }

        if (chat.antiExtranjero || (chat.paisesBloqueados && chat.paisesBloqueados.length > 0)) {
            const paisBloqueado = chat.paisesBloqueados.includes(userCountry)

            if (chat.antiExtranjero && userCountry !== 'local') {
                const isUserAdm = await isUserAdmin(this, m.chat, sender)
                if (!isUserAdm) {
                    // Eliminación del usuario
                    await this.groupParticipantsUpdate(m.chat, [sender], 'remove')

                    // Notificación de Ejecución
                    await this.sendMessage(m.chat, {
                        text: `╭─「 PROTOCOLO ANTI-EXTRANJERO (EJECUTADO) 」
│ 
│ *DIRECTRIZ: Expulsar elemento no local*
│ 
│ 📋 *INFORME DE ACCIÓN:*
│ ├ Elemento: Extranjero
│ ├ Localización: ${countryName}
│ ├ Razón: Infracción del Protocolo Anti-Extranjero
│ ├ Acción: **Removido del Grupo**
│ 
│ 🌍 *ESTADO ACTUAL:*
│ ├ Solo unidades locales permitidas.
│ 
│ 💡 *MODIFICACIÓN DEL SISTEMA:*
│ └ Use el comando .antiextranjero off
╰─◉`.trim(),
                        mentions: [sender]
                    })
                    return
                }
            }

            if (paisBloqueado) {
                const isUserAdm = await isUserAdmin(this, m.chat, sender)
                if (!isUserAdm) {
                    // Eliminación del usuario
                    await this.groupParticipantsUpdate(m.chat, [sender], 'remove')

                    // Notificación de Ejecución
                    await this.sendMessage(m.chat, {
                        text: `╭─「 PAÍS BAJO RESTRICCIÓN (BLOQUEADO) 」
│ 
│ *DIRECTRIZ: Expulsar elemento de zona restringida*
│ 
│ 📋 *INFORME DE ACCIÓN:*
│ ├ Elemento: Ciudadano de ${userCountry}
│ ├ Localización: ${countryName}
│ ├ Razón: País listado en Zonas Bloqueadas
│ ├ Acción: **Removido del Grupo**
│ 
│ 📋 *LISTADO DE ZONAS BLOQUEADAS:*
│ ${chat.paisesBloqueados.map(p => `├ ${getCountryName(p)}`).join('\n')}
│ 
│ 💡 *MODIFICACIÓN DEL SISTEMA:*
│ └ Use .bloquepais add/remove/list
╰─◉`.trim(),
                        mentions: [sender]
                    })
                    return
                }
            }
        }
    }
} catch (error) {
    console.error('Error en sistema de protocolo de seguridad:', error)
}

let usedPrefix
const groupMetadata = m.isGroup ? { ...(this.chats?.[m.chat]?.metadata || await this.groupMetadata(m.chat).catch(_ => null) || {}), ...(((this.chats?.[m.chat]?.metadata || await this.groupMetadata(m.chat).catch(_ => null) || {}).participants) && { participants: ((this.chats?.[m.chat]?.metadata || await this.groupMetadata(m.chat).catch(_ => null) || {}).participants || []).map(p => ({ ...p, id: p.jid, jid: p.jid, lid: p.lid })) }) } : {}
const participants = ((m.isGroup ? groupMetadata.participants : []) || []).map(participant => ({ id: participant.jid, jid: participant.jid, lid: participant.lid, admin: participant.admin }))
const userGroup = (m.isGroup ? participants.find((u) => this.decodeJid(u.jid) === m.sender) : {}) || {}
const botGroup = (m.isGroup ? participants.find((u) => this.decodeJid(u.jid) == this.user.jid) : {}) || {}
const isRAdmin = userGroup?.admin == "superadmin" || false
const isAdmin = isRAdmin || userGroup?.admin == "admin" || false

if (chat?.adminmode && !isAdmin && !isROwner) {
    return
}

const isBotAdmin = botGroup?.admin || false

const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), "./plugins")
for (const name in global.plugins) {
const plugin = global.plugins[name]
if (!plugin) continue
if (plugin.disabled) continue
const __filename = join(___dirname, name)
if (typeof plugin.all === "function") {
try {
await plugin.all.call(this, m, {
chatUpdate,
__dirname: ___dirname,
__filename,
user,
chat,
settings
})
} catch (err) {
console.error(err)
}}
if (!opts["restrict"])
if (plugin.tags && plugin.tags.includes("admin")) {
continue
}

// ----------------------------------------------------------------------------------
// ⭐ INICIO DE LÓGICA DE DETECCIÓN DE PREFIJOS MODIFICADA (MODO ESTRICTO)
// ----------------------------------------------------------------------------------

// 1. Obtener los prefijos del chat (principal + lista)
let chatPrefixes = []
// El prefijo principal configurado en el chat
if (chat?.prefix) {
    chatPrefixes.push(chat.prefix)
}
// Los prefijos adicionales configurados (secundarios)
if (chat?.prefixes && Array.isArray(chat.prefixes)) {
    // Solo incluimos prefijos secundarios si son diferentes del principal
    chatPrefixes.push(...chat.prefixes.filter(p => p && p !== chat.prefix))
}

// 2. Definir la lista de prefijos para DETECCIÓN
let detectionPrefixes = [...chatPrefixes]

// Añadir el prefijo de respaldo ('.') si el chat NO tiene un prefijo principal configurado
if (!chat?.prefix) {
    detectionPrefixes.push('.')
}

detectionPrefixes = [...new Set(detectionPrefixes)].filter(p => p && typeof p === 'string')

// 3. Detectar si el mensaje usa un prefijo de la lista.
let prefixMatch = global.detectPrefix(m.text || '', detectionPrefixes)

// 4. Excepción de seguridad: Si el comando es 'setprefix' o 'delprefix',
// permitimos que se use el prefijo de respaldo ('.') incluso si el chat tiene un prefijo principal.
const textWithoutPrefix = (m.text || '').replace(prefixMatch?.prefix || '', '').trim().toLowerCase()
const isPrefixCommand = textWithoutPrefix.startsWith('setprefix') || textWithoutPrefix.startsWith('delprefix')

if (!prefixMatch && isPrefixCommand) {
    // Buscar si el comando de prefijo se usó con el prefijo de respaldo ('.')
    const backupPrefixMatch = global.detectPrefix(m.text || '', ['.'])
    if (backupPrefixMatch) {
        prefixMatch = backupPrefixMatch
    }
}

// ----------------------------------------------------------------------------------
// ⭐ FIN DE LÓGICA DE DETECCIÓN DE PREFIJOS MODIFICADA
// ----------------------------------------------------------------------------------


let match

// 🛑 APLICACIÓN DE MODO ESTRICTO: Si no hay un prefixMatch, se salta el comando (continue).
if (prefixMatch) {
    match = [prefixMatch.prefix]
} else {
    continue 
}

let usedPrefixTemp = ''
// El único prefijo válido es el que detectó la lógica estricta
if (prefixMatch && prefixMatch.prefix) {
    usedPrefixTemp = prefixMatch.prefix 
} else if (match && match[0] && match[0][0]) {
    usedPrefixTemp = match[0][0]
}

if (usedPrefixTemp) {
usedPrefix = usedPrefixTemp
const noPrefix = (m.text || '').replace(usedPrefix, "")
let [command, ...args] = noPrefix.trim().split(" ").filter(v => v)
args = args || []
let _args = noPrefix.trim().split(" ").slice(1)
let text = _args.join(" ")
command = (command || "").toLowerCase()
const fail = plugin.fail || global.dfail
const isAccept = plugin.command instanceof RegExp ?
plugin.command.test(command) :
Array.isArray(plugin.command) ?
plugin.command.some(cmd => cmd instanceof RegExp ?
cmd.test(command) : cmd === command) :
typeof plugin.command === "string" ?
plugin.command === command : false
global.comando = command

if (!isOwners && settings.self) return
if ((m.id.startsWith("NJX-") || (m.id.startsWith("BAE5") && m.id.length === 16) || (m.id.startsWith("B24E") && m.id.length === 20))) return

if (global.db.data.chats[m.chat].primaryBot && global.db.data.chats[m.chat].primaryBot !== this.user.jid) {
const primaryBotConn = global.conns.find(conn => conn.user.jid === global.db.data.chats[m.chat].primaryBot && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED)
const participants = m.isGroup ? (await this.groupMetadata(m.chat).catch(() => ({ participants: [] }))).participants : []
const primaryBotInGroup = participants.some(p => p.jid === global.db.data.chats[m.chat].primaryBot)
if (primaryBotConn && primaryBotInGroup || global.db.data.chats[m.chat].primaryBot === global.conn.user.jid) {
throw !1
} else {
global.db.data.chats[m.chat].primaryBot = null
}} else {
}

if (!isAccept) continue
m.plugin = name
global.db.data.users[m.sender].commands++
if (chat) {
const botId = this.user.jid
const primaryBotId = chat.primaryBot
if (name !== "group-banchat.js" && chat?.isBanned && !isROwner) {
if (!primaryBotId || primaryBotId === botId) {
const aviso = `╭─「 ADVERTENCIA - COMANDO RESTRINGIDO 」
│
│ **El Bot está Desactivado en este Sector.**
│ 
│ > *La comunicación ha sido bloqueada.*
│ > Un **Administrador** puede restablecer el enlace
│ > con el comando: **${usedPrefix}bot on**
╰─◉`.trim()
await m.reply(aviso)
return
}}
if (m.text && user.banned && !isROwner) {
const mensaje = `╭─「 ACCESO DENEGADO - IDENTIDAD PROHIBIDA 」
│
│ **Su Identidad está Bajo Restricción.**
│ 
│ > **Razón:** ${user.bannedReason || 'No especificada'}
│ 
│ **No tiene autorización para emitir comandos.**
│ Si considera que es un error, contacte
│ con un moderador.
╰─◉`.trim()
if (!primaryBotId || primaryBotId === botId) {
m.reply(mensaje)
return
}}}
if (!isOwners && !m.chat.endsWith('g.us') && !/code|p|ping|qr|estado|status|infobot|botinfo|report|reportar|invite|join|logout|suggest|help|menu/gim.test(m.text)) return

const adminMode = chat.modoadmin || false
const wa = plugin.botAdmin || plugin.admin || plugin.group || plugin || noPrefix || usedPrefix || m.text.slice(0, 1) === usedPrefix || plugin.command

if (adminMode && !isOwner && m.isGroup && !isAdmin && wa) return

if (plugin.rowner && plugin.owner && !(isROwner || isOwner)) {
fail("owner", m, this)
continue
}
if (plugin.rowner && !isROwner) {
fail("rowner", m, this)
continue
}
if (plugin.owner && !isOwner) {
fail("owner", m, this)
continue
}
if (plugin.premium && !isPrems) {
fail("premium", m, this)
continue
}
if (plugin.group && !m.isGroup) {
fail("group", m, this)
continue
}  
if (plugin.botAdmin && !isBotAdmin) {
fail("botAdmin", m, this)
continue
}  
if (plugin.admin && !isAdmin) {
fail("admin", m, this)
continue
}
m.isCommand = true
m.exp += plugin.exp ? parseInt(plugin.exp) : 10
let extra = {
match,
prefixMatch,
usedPrefix,
noPrefix,
_args,
args,
command,
text,
conn: this,
participants,
groupMetadata,
userGroup,
botGroup,
isROwner,
isOwner,
isRAdmin,
isAdmin,
isBotAdmin,
isPrems,
chatUpdate,
__dirname: ___dirname,
__filename,
user,
chat,
settings
}
try {
await plugin.call(this, m, extra)
} catch (err) {
m.error = err
console.error(err)
} finally {
if (typeof plugin.after === "function") {
try {
await plugin.after.call(this, m, extra)
} catch (err) {
console.error(err)
}}}}}} catch (err) {
console.error(err)
} finally {
if (opts["queque"] && m.text) {
const quequeIndex = this.msgqueque.indexOf(m.id || m.key.id)
if (quequeIndex !== -1)
this.msgqueque.splice(quequeIndex, 1)
}
let user = global.db.data.users[m.sender]
if (m) {
if (m.sender && user) {
user.exp += m.exp
}}
try {
if (!opts["noprint"]) await (await import("./lib/print.js")).default(m, this)
} catch (err) {
console.warn(err)
console.log(m.message)
}}}

global.dfail = (type, m, conn) => {

let edadaleatoria = ['10', '28', '20', '40', '18', '21', '15', '11', '9', '17', '25'].getRandom()
let user2 = m.pushName || 'Anónimo'
let verifyaleatorio = ['registrar', 'reg', 'verificar', 'verify', 'register'].getRandom()

const msg = {
    rowner: `╭─「 RESTRICCIÓN - ACCESO DENEGADO (PROPIETARIO SUPREMO) 」
│
│ **El comando requiere Nivel de Autoridad Máxima.**
│ 
│ > **Acción Requerida:** Ser el Propietario Raíz del Bot.
╰─◉`,
    owner: `╭─「 RESTRICCIÓN - ACCESO DENEGADO (PROPIETARIO) 」
│
│ **El comando está reservado para el Propietario del Bot.**
│ 
│ > **Acción Requerida:** Ser el Propietario del Sistema.
╰─◉`,
    mods: `╭─「 RESTRICCIÓN - ACCESO DENEGADO (MODERADOR) 」
│
│ **El comando está restringido a Moderadores de Alto Nivel.**
╰─◉`,
    premium: `╭─「 RESTRICCIÓN - LICENCIA REQUERIDA 」
│
│ **Este comando exige una Licencia Premium (o Propietario).**
│ 
│ > Su estatus actual no califica para la ejecución.
╰─◉`,
    group: `╭─「 RESTRICCIÓN - DOMINIO INCORRECTO 」
│
│ **El comando solo puede ser invocado en Grupos/Sectores Colectivos.**
│ 
│ > Invoque el comando en un dominio apropiado.
╰─◉`,
    private: `╭─「 RESTRICCIÓN - DOMINIO INCORRECTO 」
│
│ **El comando solo puede ser invocado en Conversación Privada con el Bot.**
│ 
│ > Invoque el comando en un dominio apropiado.
╰─◉`,
    admin: `╭─「 RESTRICCIÓN - AUTORIDAD INSUFICIENTE 」
│
│ **El comando está reservado para Administradores de este Grupo.**
│ 
│ > Su nivel de autoridad no es suficiente para la ejecución.
╰─◉`,
    botAdmin: `╭─「 RESTRICCIÓN - PRIVILEGIOS DEL BOT 」
│
│ **El Bot debe ser un Administrador para ejecutar esta directriz.**
│ 
│ > Otorgue privilegios de Administración al Bot.
╰─◉`,
    unreg: `╭─「 PROTOCOLO DE IDENTIDAD REQUERIDO 」
│
│ **Necesita Registrar su Identidad en el Sistema.**
│ 
│ > **Instrucción:** Escriba **${verifyaleatorio} [Nombre].[Edad ${edadaleatoria}]** para inscribirse.
╰─◉`,
    restrict: `╭─「 RESTRICCIÓN - COMANDO DESHABILITADO 」
│
│ **El comando ha sido deshabilitado por el Propietario del Sistema.**
│ 
│ > No está disponible para su uso.
╰─◉`
}[type];
if (msg) return conn.reply(m.chat, msg, m, global.rcanal).then(_ => m.react('❌')) // Uso '❌' para error.
}

// === CORREGIDO: Cambiar global.__filename por fileURLToPath ===
let file = fileURLToPath(import.meta.url)
watchFile(file, async () => {
unwatchFile(file)
console.log(chalk.magenta("Se actualizo 'handler.js'"))
if (global.reloadHandler) console.log(await global.reloadHandler())
})

global.detectPrefix = detectPrefix
global.globalPrefixes = globalPrefixes

export default {  
    handler
}
