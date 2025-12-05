import { watchFile, unwatchFile } from 'fs'
import chalk from 'chalk'
import { fileURLToPath, pathToFileURL } from 'url'
import fs from 'fs'
import * as cheerio from 'cheerio'
import fetch from 'node-fetch'
import axios from 'axios'
import moment from 'moment-timezone'
import { dirname } from 'path'

global.__dirname = (url) => dirname(fileURLToPath(url))

// Dueño legítimo
global.roowner = ['593994524688']
global.owner = [
    ['593994524688', 'Jared', true]
]

// Sin personal adicional
global.mods = []
global.suittag = []
global.prems = []

// Configuración general del bot
global.libreria = 'Baileys'
global.baileys = 'V 6.7.9'
global.languaje = 'Español'
global.vs = '7.5.2'
global.vsJB = '5.0'
global.nameqr = 'Itsukiqr'
global.namebot = 'Itsuki-IA'
global.sessions = 'Sessions/Principal'
global.jadi = 'Sessions/SubBot'
global.ItsukiJadibts = true
global.Choso = true
global.prefix = ['.', '!', '/', '#', '%']
global.apikey = 'ItsukiNakanoIA'
global.botNumber = '18482389332'

// Información del bot (sin emojis)
global.packname = 'Itsuki'
global.botname = 'Itsuki'
global.wm = '© Jared'
global.wm3 = 'Multi-Device'
global.author = 'Made by Jared'
global.dev = 'Owner Jared'
global.textbot = 'Itsuki-Nakano | IA V3'
global.etiqueta = '@Jared'
global.gt = 'Creado por Jared'
global.me = 'ITSUKI NAKANO UPDATE'
global.listo = 'Aquí tiene'
global.moneda = 'Yenes'
global.multiplier = 69
global.maxwarn = 3

global.cheerio = cheerio
global.fs = fs
global.fetch = fetch
global.axios = axios
global.moment = moment

// Sin enlaces oficiales (todos removidos)
global.gp1 = ''
global.comunidad1 = ''
global.channel = ''
global.channel2 = ''
global.md = ''
global.correo = ''

// APIs
global.APIs = {
  ryzen: 'https://api.ryzendesu.vip',
  xteam: 'https://api.xteam.xyz',
  lol: 'https://api.lolhuman.xyz',
  delirius: 'https://delirius-apiofc.vercel.app',
  siputzx: 'https://api.siputzx.my.id',
  mayapi: 'https://mayapi.ooguy.com'
}

global.APIKeys = {
  'https://api.xteam.xyz': 'YOUR_XTEAM_KEY',
  'https://api.lolhuman.xyz': 'API_KEY',
  'https://api.betabotz.eu.org': 'API_KEY',
  'https://mayapi.ooguy.com': 'may-f53d1d49'
}

// IA
global.SIPUTZX_AI = {
  base: global.APIs?.siputzx || 'https://api.siputzx.my.id',
  bardPath: '/api/ai/bard',
  queryParam: 'query',
  headers: { accept: '*/*' }
}

// Configuraciones predeterminadas
global.chatDefaults = {
  isBanned: false,
  sAutoresponder: '',
  welcome: true,
  autolevelup: false,
  autoAceptar: false,
  autosticker: false,
  autoRechazar: false,
  autoresponder: false,
  detect: true,
  antiBot: false,
  antiBot2: false,
  modoadmin: false,
  antiLink: true,
  antiImg: false,
  reaction: false,
  nsfw: false,
  antifake: false,
  delete: false,
  expired: 0,
  antiLag: false,
  per: [],
  antitoxic: false
}

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("Update 'config.js'"))
  try { import(pathToFileURL(file).href + `?update=${Date.now()}`) } catch {}
})

export default {
  prefix: global.prefix,
  owner: global.owner,
  sessionDirName: global.sessions,
  sessionName: global.sessions,
  botNumber: global.botNumber,
  chatDefaults: global.chatDefaults
}
