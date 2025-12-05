import fs from 'fs'
import fetch from 'node-fetch'
import axios from 'axios'
import moment from 'moment-timezone'

var handler = m => m
handler.all = async function (m) { 

  // ID y Nombre del Canal de WhatsApp (TU CANAL)
  const CANAL_ID = "0029Va4K0PZ5a245NkngBA2M@newsletter";
  const CANAL_NAME = "Lelouch vi Britannia ┇ Comunicados";
  
  // Lista de IDs: Usaremos tu ID. Asegúrate de que este ID sí funciona con los mensajes
  // de vista previa de canal, ya que es alfanumérico.
  global.canalIdM = [
    CANAL_ID
  ]
  global.canalNombreM = [
    CANAL_NAME
  ]
  
  // RESTAURAMOS la llamada a la función async que usa el código que funciona.
  global.channelRD = await getRandomChannel() 
  // NOTA: La función 'getRandomChannel' está definida al final de este archivo.

  // Fecha y hora
  global.d = new Date(new Date + 3600000)
  global.locale = 'es'
  global.dia = d.toLocaleDateString(locale, { weekday: 'long' })
  global.fecha = d.toLocaleDateString('es', { day: 'numeric', month: 'numeric', year: 'numeric' })
  global.mes = d.toLocaleDateString('es', { month: 'long' })
  global.año = d.toLocaleDateString('es', { year: 'numeric' })
  global.tiempo = d.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true })

  // Usuario y stickers
  global.nombre = m.pushName || 'Caballero'
  global.packsticker = ``

  // Iconos random actualizados
  global.iconos = [
    'https://i.postimg.cc/mk8FDzNc/descarga.jpg',
    'https://i.postimg.cc/j2dLGq0x/𝘾-𝘾.jpg',
    'https://i.postimg.cc/25R3C7R4/𝖃𝖀𝕽𝕺.jpg',
    'https://i.postimg.cc/YC1MzcTw/descarga-(4).jpg',
    'https://i.postimg.cc/85CGG759/descarga-(3).jpg',
    'https://i.postimg.cc/rs0Ld753/descarga-(2).jpg',
    'https://i.postimg.cc/05Fvg2ss/descarga-(1).jpg',
    'https://i.postimg.cc/mk8FDzNc/descarga.jpg',
    'https://i.postimg.cc/j2dLGq0x/𝘾-𝘾.jpg',
    'https://i.postimg.cc/25R3C7R4/𝖃𝖀𝕽𝕺.jpg',
    'https://i.postimg.cc/YC1MzcTw/descarga-(4).jpg'
  ]
  global.icono = global.iconos[Math.floor(Math.random() * global.iconos.length)]

  // Variables ya adaptadas al Imperio de Britannia
  global.wm = '© Lelouch vi Britannia'
  global.wm3 = '⫹⫺ Sistema Imperial ● Multi-Device'
  global.author = 'Desarrollado por Jared'
  global.dev = 'Owner: @Jared'
  global.textbot = 'Lelouch-vi-Britannia|AI-Core'
  global.etiqueta = '@Jared'
  global.gt = '© Desarrollado por Jared – Britannia'
  global.me = '⚜️ Sistema de Lelouch'

  global.fkontak = { 
    key: { 
      participants: "0@s.whatsapp.net",
      "remoteJid": "status@broadcast", 
      "fromMe": false,
      "id": "Imperium" 
    }, 
    message: { 
      contactMessage: { 
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Lelouch;;;\nFN:Lelouch vi Britannia\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Móvil\nEND:VCARD`
      }
    }, 
    participant: "0@s.whatsapp.net"
  }

  // Mensaje de canal estilo imperial
  global.rcanal = { 
    contextInfo: { 
      isForwarded: true, 
      forwardedNewsletterMessageInfo: { 
        // Usamos la variable global channelRD cargada arriba
        newsletterJid: global.channelRD.id, 
        serverMessageId: '', 
        newsletterName: global.channelRD.name 
      }, 
      externalAdReply: { 
        title: "Lelouch vi Britannia",
        body: global.dev,
        mediaUrl: null, 
        description: null, 
        previewType: "PHOTO", 
        thumbnailUrl: global.icono,
        sourceUrl: '',
        mediaType: 1, 
        renderLargerThumbnail: false 
      }
    }
  }

  // Otros
  global.listo = '*Aqui tienes*'
  global.moneda = 'Yenes'
  global.prefix = ['.', '!', '/', '#', '%']

}

export default handler

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}

// Función que selecciona un canal aleatorio de las listas
async function getRandomChannel() {
  // Verificamos si los arrays de canales están definidos y tienen elementos
  if (!global.canalIdM || global.canalIdM.length === 0 || !global.canalNombreM || global.canalNombreM.length === 0) {
      // Si no hay canales, devolvemos un objeto vacío para evitar errores
      return { id: '', name: 'Canal no configurado' }; 
  }

  let randomIndex = Math.floor(Math.random() * global.canalIdM.length)
  let id = global.canalIdM[randomIndex]
  let name = global.canalNombreM[randomIndex]
  
  // Aseguramos que el ID tenga el sufijo @newsletter (aunque ya lo pusiste bien)
  let fullId = id.includes("@newsletter") ? id : id + "@newsletter" 
  
  return { id: fullId, name } 
}

if (!Array.prototype.getRandom) {
  Array.prototype.getRandom = function () {
    return this[Math.floor(Math.random() * this.length)]
  }
}
