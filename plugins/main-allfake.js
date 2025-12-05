import fs from 'fs'
import fetch from 'node-fetch'
import axios from 'axios'
import moment from 'moment-timezone'

var handler = m => m
handler.all = async function (m) { 

  // Canales (sin links para que su majestad los ponga luego)
  global.canalIdM = [
    "0029Va4K0PZ5a245NkngBA2M@newsletter",
    "0029Va4K0PZ5a245NkngBA2M@newsletter"
  ]
  global.canalNombreM = [
    "Imperio de Britannia ┇ Noticias",
    "Lelouch vi Britannia ┇ Comunicados"
  ]
  global.channelRD = await getRandomChannel()

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
        newsletterJid: channelRD.id, 
        serverMessageId: '', 
        newsletterName: channelRD.name 
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

async function getRandomChannel() {
  let randomIndex = Math.floor(Math.random() * global.canalIdM.length)
  let id = global.canalIdM[randomIndex]
  let name = global.canalNombreM[randomIndex]
  return { id, name }
}

if (!Array.prototype.getRandom) {
  Array.prototype.getRandom = function () {
    return this[Math.floor(Math.random() * this.length)]
  }
}
