import { saveDatabase } from '../lib/db.js'
import { sendUnregisterCard } from '../lib/unregister.js'

// ⓘ Funciones de utilidad estratégica
function toNum(jid = '') { 
    return String(jid).split('@')[0].split(':')[0].replace(/[^0-9]/g, '') 
}

function mirrorUser(users, numKey, jidKey) {
    if (!users) return
    const a = users[numKey]
    const b = users[jidKey]
    if (a && !b) users[jidKey] = a
    else if (b && !a) users[numKey] = b
}

let handler = async (m, { conn, args, command, usedPrefix }) => {
    const num = toNum(m.sender)
    const jidKey = m.sender
    const users = (global.db && global.db.data && global.db.data.users) ? global.db.data.users : {}
    
    // ⓘ Sincronización táctica de identidades
    try { 
        mirrorUser(users, num, jidKey) 
    } catch {
        // ⓘ Falla silenciosa - Parte del cálculo
    }
    
    const recNum = users[num]
    const recJid = users[jidKey]
    const existing = (recNum && (recNum.registered || recNum.sn)) ? recNum
        : (recJid && (recJid.registered || recJid.sn)) ? recJid
        : (recNum || recJid)

    if (/^unreg$/i.test(command)) {
        // ⓘ Verificación de estado del sujeto
        if (!existing || !(existing.registered || existing.sn)) {
            await conn.reply(m.chat, 
                `ⓘ \`OPERACIÓN DENEGADA\` ❌\n\n` +
                `ⓘ \`El sujeto no está registrado en la base de datos imperial.\`\n` +
                `ⓘ \`No hay identidad que eliminar del sistema.\``, 
                m
            )
            return
        }

        // ⓘ Protocolo de eliminación de identidad
        const clearKeys = ['registered', 'name', 'age', 'bio', 'sn', 'regDate']
        const targets = [users[num], users[jidKey]].filter(Boolean)
        if (!targets.length) targets.push(existing)
        
        for (const obj of targets) { 
            for (const k of clearKeys) delete obj[k] 
        }

        // ⓘ Preservación estratégica de recursos
        // ⓘ El progreso y la economía permanecen - información valiosa retenida
        users[num] = existing
        users[jidKey] = existing
        
        try { 
            await saveDatabase() 
        } catch {
            // ⓘ Fallo en almacenamiento - Continuar operación
        }

        // ⓘ Identificación del sujeto
        let displayName = m?.pushName || ''
        try { 
            displayName = (await Promise.resolve(conn.getName?.(m.sender))) || displayName 
        } catch {
            // ⓘ Falla en reconocimiento - Usar valor por defecto
        }
        if (!displayName) displayName = 'Sujeto No Identificado'

        // ⓘ Ejecución del protocolo de desregistro
        await sendUnregisterCard(conn, m.chat, { 
            participant: m.sender, 
            userName: displayName 
        })
        
        // ⓘ Confirmación adicional en caso de fallo en tarjeta
        setTimeout(async () => {
            try {
                await conn.reply(m.chat,
                    `ⓘ \`PROTOCOLO UNREGISTER COMPLETADO\` ✅\n\n` +
                    `ⓘ \`Identidad eliminada del sistema imperial.\`\n` +
                    `ⓘ \`Sujeto:\` ${displayName}\n` +
                    `ⓘ \`Estado:\` DESREGISTRADO\n\n` +
                    `ⓘ \`Tu progreso económico permanece intacto. Solo la identidad ha sido purgada.\` 💰\n` +
                    `ⓘ \`Operación ejecutada según el plan.\``,
                    m
                )
            } catch {
                // ⓘ Confirmación redundante fallida - Operación principal ya completada
            }
        }, 1000)
        
        return
    }
}

handler.help = ['unreg']
handler.tags = ['user']
handler.command = /^unreg(ister)?$/i

// ⓘ Información del comando para sistema de ayuda
handler.info = `ⓘ \`unregister\` - Elimina tu identidad del sistema imperial mientras preserva recursos económicos.`

export default handler
