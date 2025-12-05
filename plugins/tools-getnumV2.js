import { promises as fs } from 'fs'
import axios from 'axios'

const DB_FILE = './database/numvirtual.json'

const COUNTRIES = {
  nigeria: {
    nombre: 'Nigeria',
    emoji: '🇳🇬',
    prefijo: '+234',
    url: 'https://raw.githubusercontent.com/Ado21/Numbers/refs/heads/main/nigeria.txt'
  }
}

let userNumbers = {}
let pollingActive = new Set()

const loadDB = async () => {
  try {
    const data = await fs.readFile(DB_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return {}
  }
}

const saveDB = async (db) => {
  await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2))
}

const fetchAvailableNumbers = async () => {
  try {
    const res = await axios.get(COUNTRIES.nigeria.url)
    return res.data.trim().split('\n').map(n => n.trim()).filter(Boolean)
  } catch {
    return []
  }
}

const startPolling = async (conn, userId, number) => {
  if (pollingActive.has(userId)) return
  pollingActive.add(userId)

  const cleanUserNumber = number.replace('+234', '').trim()

  const poll = async () => {
    if (!pollingActive.has(userId)) return

    const db = await loadDB()

    if (!db[userId] || db[userId].number !== number) {
        pollingActive.delete(userId)
        return
    }

    try {
      const { data } = await axios.get('https://sms.apiadonix.space/messages')
      const msg = data 

      if (msg && msg.text) {
        let isMatch = false

        if (msg.text.includes(cleanUserNumber)) {
            isMatch = true
        } 
        else {
            const apiNumMatch = msg.text.match(/Number\s*:\s*([+\d\s*★]+)/i)
            if (apiNumMatch) {
                const apiNum = apiNumMatch[1].replace(/[^\d*★]/g, '') 
                const userNum = cleanUserNumber.replace(/\D/g, '')

                if (apiNum.length === userNum.length) {
                    isMatch = true
                    for (let i = 0; i < apiNum.length; i++) {
                        if (!['*', '★'].includes(apiNum[i]) && apiNum[i] !== userNum[i]) {
                            isMatch = false
                            break
                        }
                    }
                }
            }
        }


        if (isMatch) {

          const otpMatch = msg.text.match(/(?:OTP|Code|Código)\s*[:\s]*([\d-]{4,10})/i) || 
                           msg.text.match(/(\d{3}[- ]?\d{3})/);

          const otpRaw = otpMatch ? otpMatch[1] || otpMatch[0] : 'Ver mensaje'
          const otpClean = otpRaw.replace(/\D/g, '') 

          let cleanContent = msg.text
          if (msg.text.includes('💌Full-Message:')) {
             cleanContent = msg.text.split('💌Full-Message:')[1].trim()
             if (cleanContent.includes('🚀Be Active')) {
                 cleanContent = cleanContent.split('🚀Be Active')[0].trim()
             }
             if (cleanContent.includes('👨‍💻 Owner:')) {
                 cleanContent = cleanContent.split('👨‍💻 Owner:')[0].trim()
             }
          }

          const smsText = `ⓘ \`NUEVO SMS INTERCEPTADO\` 📱\n\n` +
                         `ⓘ \`Código OTP:\` ${otpRaw}\n` +
                         `ⓘ \`País de origen:\` Nigeria ${COUNTRIES.nigeria.emoji}\n` +
                         `ⓘ \`ID del mensaje:\` ${msg.id}\n` +
                         `ⓘ \`Número interceptado:\` +234${cleanUserNumber}\n\n` +
                         `ⓘ \`Contenido completo:\`\n${cleanContent}`

          db[userId] = db[userId] || { number: '', history: [] }

          const alreadyProcessed = db[userId].history.some(h => h.msgId === msg.id)

          if (!alreadyProcessed) {
              db[userId].history.push({
                code: otpClean,
                full: cleanContent,
                msgId: msg.id,
                time: new Date().toLocaleString('es-VE')
              })
              await saveDB(db)

              const msgContent = {
                  viewOnceMessage: {
                      message: {
                          interactiveMessage: {
                              body: { text: smsText },
                              footer: { text: "ⓘ Sistema de Intercepción SMS" },
                              nativeFlowMessage: {
                                  buttons: [
                                      {
                                          name: "cta_copy",
                                          buttonParamsJson: JSON.stringify({
                                              display_text: "📋 Copiar Código",
                                              id: "copy_otp",
                                              copy_code: otpClean 
                                          })
                                      }
                                  ]
                              }
                          }
                      }
                  }
              }

              await conn.relayMessage(userId, msgContent, {})

              const originalMsg = userNumbers[userId]?.message
              if (originalMsg) {
                await conn.sendMessage(userId, {
                  edit: originalMsg.key,
                  text: await generateNumberMessage(userId, number, db)
                })
              }
          }
        }
      }
    } catch (err) {
      console.log('ⓘ Error en intercepción SMS:', err.message)
    }

    setTimeout(poll, 3000) 
  }

  poll()
}

const generateNumberMessage = async (userId, number, db = null) => {
  if (!db) db = await loadDB()
  const history = (db[userId]?.history || []).slice(-5)

  let histText = history.length > 0
    ? '\nⓘ `Historial de intercepciones:` 📜\n' + history
        .map(h => `ⓘ [ ${h.code} ]\n   └ 🕒 ${h.time}`)
        .join('\n')
    : '\nⓘ `Historial de intercepciones:` 📜\nⓘ Esperando códigos OTP...'

  return `ⓘ \`SISTEMA DE NÚMEROS VIRTUALES\` 📞\n\n` +
         `ⓘ \`Número asignado:\` ${number}\n` +
         `ⓘ \`País:\` Nigeria 🇳🇬\n` +
         `ⓘ \`Estado del servicio:\` Activo 🟢\n` +
         `ⓘ \`Tiempo de escaneo:\` 3 segundos\n` +
         `${histText}\n\n` +
         `ⓘ \`Sistema de intercepción operativo. Todos los códigos OTP serán interceptados.\``
}

let handler = async (m, { conn }) => {
  const userId = m.sender
  const db = await loadDB()

  if (!db[userId]?.number || m.text.includes('cambiar')) {
    pollingActive.delete(userId)

    const allNumbers = await fetchAvailableNumbers()
    const usedNumbers = Object.values(db).map(u => u.number?.replace('+234', ''))
    const available = allNumbers.filter(n => !usedNumbers.includes(n))

    if (available.length === 0) {
      return conn.reply(m.chat, 
        `ⓘ \`ERROR EN ASIGNACIÓN\` ❌\n\n` +
        `ⓘ \`No hay números disponibles en este momento.\`\n` +
        `ⓘ \`Todos los recursos están siendo utilizados.\`\n` +
        `ⓘ \`Intenta nuevamente más tarde.\``, 
        m
      )
    }

    const selected = available[Math.floor(Math.random() * available.length)]
    const fullNumber = `+234${selected}`

    db[userId] = {
      number: fullNumber,
      assignedAt: new Date().toISOString(),
      history: []
    }
    await saveDB(db)

    const messageText = await generateNumberMessage(userId, fullNumber, db)

    const sentMsg = await conn.sendMessage(m.chat, {
      text: messageText,
      footer: 'ⓘ Sistema de números virtuales - Intercepción activa',
      buttons: [
        { buttonId: '.getnum2 cambiar', buttonText: { displayText: '🔄 Cambiar Número' }, type: 1 }
      ]
    }, { quoted: m })

    userNumbers[userId] = { number: fullNumber, message: sentMsg }
    startPolling(conn, userId, fullNumber)

    return
  }

  startPolling(conn, userId, db[userId].number)

  const currentNumber = db[userId].number
  const messageText = await generateNumberMessage(userId, currentNumber, db)

  const sentMsg = await conn.sendMessage(m.chat, {
    text: messageText,
    footer: 'ⓘ Tu número sigue activo. Interceptando códigos...',
    buttons: [
      { buttonId: '.numvirtual cambiar', buttonText: { displayText: '🔄 Cambiar Número' }, type: 1 }
    ]
  }, { quoted: m })

  userNumbers[userId] = { number: currentNumber, message: sentMsg }
}

handler.command = ['getnum2', 'numvirtual']
handler.help = ['numvirtual']
handler.tags = ['tools']
handler.owner = true

export default handler
