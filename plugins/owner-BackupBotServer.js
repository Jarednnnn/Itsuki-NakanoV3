import fsp from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')
const TEMP = path.join(ROOT, 'temp')

const ALWAYS_EXCLUDE = new Set(['node_modules', '.git', '.vscode', 'temp', '.npm'])
const EXCLUDE_FILES = new Set(['database.json', 'package-lock.json'])
const SESSION_DIRS = new Set(['sessions', 'sessions-qr', 'botSession'])

function stamp() {
  const d = new Date()
  const p = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`
}

async function calculateDirectorySize(dir) {
  let total = 0
  try {
    const entries = await fsp.readdir(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        total += await calculateDirectorySize(fullPath)
      } else {
        const stats = await fsp.stat(fullPath)
        total += stats.size
      }
    }
  } catch {}
  return total / (1024 * 1024)
}

async function copyTree(src, dst, includeSessions) {
  await fsp.mkdir(dst, { recursive: true })
  const entries = await fsp.readdir(src, { withFileTypes: true })
  for (const e of entries) {
    const name = e.name
    if (ALWAYS_EXCLUDE.has(name)) continue
    if (!includeSessions && SESSION_DIRS.has(name)) continue
    const sp = path.join(src, name)
    const dp = path.join(dst, name)
    if (e.isDirectory()) {
      await copyTree(sp, dp, includeSessions)
    } else if (e.isFile()) {
      if (EXCLUDE_FILES.has(name)) continue
      await fsp.mkdir(path.dirname(dp), { recursive: true })
      try { await fsp.copyFile(sp, dp) } catch {}
    }
  }
}

async function zipFolderWin(sourceDir, zipPath) {
  const destPS = zipPath.replace(/'/g, "''")
  const script = `$ErrorActionPreference='Stop'; $dest='${destPS}'; if (Test-Path -LiteralPath $dest) { Remove-Item -LiteralPath $dest -Force }; $items = Get-ChildItem -Force | Select-Object -ExpandProperty FullName; Compress-Archive -Path $items -DestinationPath $dest -Force`
  const cmd = `powershell -NoProfile -Command "${script.replace(/"/g, '`"')}"`
  execSync(cmd, { cwd: sourceDir, stdio: 'inherit' })
}

async function zipFolderUnix(sourceDir, zipPath) {
  try {
    execSync('zip -v', { stdio: 'ignore' })
    execSync(`zip -r "${zipPath}" .`, { cwd: sourceDir, stdio: 'inherit' })
    return zipPath
  } catch {
    const gzPath = zipPath.replace(/\.zip$/i, '.tar.gz')
    execSync(`tar -czf "${gzPath}" .`, { cwd: sourceDir, stdio: 'inherit' })
    return gzPath
  }
}

function parseArgs(args) {
  const opts = { includeSessions: false, name: '' }
  for (const a of args || []) {
    const s = String(a)
    if (/^--with-?sessions$/i.test(s)) opts.includeSessions = true
    const m = s.match(/^--name=(.+)$/i)
    if (m) opts.name = m[1]
  }
  return opts
}

let handler = async (m, { conn, args }) => {
  const opts = parseArgs(args)
  const includeSessions = !!opts.includeSessions
  const sanitize = (s = '') => String(s).replace(/\s+/g, '-').replace(/[^a-z0-9._-]/ig, '')
  const baseName = opts.name ? sanitize(opts.name) : sanitize(global.namebot || 'bot-backup')
  const base = opts.name ? baseName : `${baseName}-${stamp()}`
  const exportDir = path.join(TEMP, base)
  const zipPath = path.join(TEMP, `${base}.zip`)

  // ⓘ Mensaje inicial estilo Lelouch
  await conn.reply(m.chat, 
`┏━━━━━━━━━━━━━━━━━━━━━┓
┃  ⓘ 𝑪𝑶𝑴𝑨𝑵𝑫𝑶 𝑨𝑪𝑻𝑰𝑽𝑨𝑫𝑶  ┃
┗━━━━━━━━━━━━━━━━━━━━━┛

⚔️ *𝑰𝒏𝒊𝒄𝒊𝒂𝒏𝒅𝒐 𝒆𝒍 𝑷𝒍𝒂𝒏: 𝑩𝒂𝒄𝒌𝒖𝒑*
╰─▸ *𝑷𝒂𝒓á𝒎𝒆𝒕𝒓𝒐𝒔 𝒅𝒆 𝒆𝒋𝒆𝒄𝒖𝒄𝒊ó𝒏:*
   • 𝑰𝒏𝒄𝒍𝒖𝒊𝒓 𝒔𝒆𝒔𝒊𝒐𝒏𝒆𝒔: ${includeSessions ? '𝑺í ⚜️' : '𝑵𝒐 ✖️'}
   • 𝑵𝒐𝒎𝒃𝒓𝒆 𝒑𝒆𝒓𝒔𝒐𝒏𝒂𝒍𝒊𝒛𝒂𝒅𝒐: ${opts.name ? `"${opts.name}"` : '𝑵𝒊𝒏𝒈𝒖𝒏𝒐'}
   • 𝑻𝒊𝒎𝒆𝒔𝒕𝒂𝒎𝒑: ${stamp()}
   • 𝑷𝒍𝒂𝒕𝒂𝒇𝒐𝒓𝒎𝒂: ${process.platform}

🎭 *"𝑺𝒐𝒍𝒐 𝒂𝒒𝒖𝒆𝒍𝒍𝒐𝒔 𝒒𝒖𝒆 𝒕𝒊𝒆𝒏𝒆𝒏 𝒆𝒍 𝒑𝒐𝒅𝒆𝒓 𝒅𝒆 𝒓𝒆𝒔𝒑𝒂𝒍𝒅𝒂𝒓, 𝒑𝒖𝒆𝒅𝒆𝒏 𝒂𝒗𝒂𝒏𝒛𝒂𝒓 𝒔𝒊𝒏 𝒎𝒊𝒆𝒅𝒐."*
🔸 𝑷𝒓𝒆𝒑𝒂𝒓𝒂𝒏𝒅𝒐 𝒆𝒏𝒕𝒐𝒓𝒏𝒐 𝒅𝒆 𝒓𝒆𝒔𝒑𝒂𝒍𝒅𝒐...`, m)
  
  await conn.sendMessage(m.chat, { react: { text: '📂', key: m.key } })

  await fsp.mkdir(TEMP, { recursive: true }).catch(() => {})

  // ⓘ Fase 1: Copia de archivos
  try {
    await conn.reply(m.chat, 
`┏━━━━━━━━━━━━━━━━━━━━━┓
┃  ⓘ 𝑭𝑨𝑺𝑬 1: 𝑪𝑶𝑷𝑰𝑨  ┃
┗━━━━━━━━━━━━━━━━━━━━━┛

⚔️ *𝑪𝒐𝒑𝒊𝒂𝒏𝒅𝒐 𝒆𝒔𝒕𝒓𝒖𝒄𝒕𝒖𝒓𝒂 𝒅𝒆 𝒂𝒓𝒄𝒉𝒊𝒗𝒐𝒔*
╰─▸ *𝑫𝒆𝒕𝒂𝒍𝒍𝒆𝒔:*
   • 𝑶𝒓𝒊𝒈𝒆𝒏: ${ROOT}
   • 𝑫𝒆𝒔𝒕𝒊𝒏𝒐: ${exportDir}
   • 𝑬𝒙𝒄𝒍𝒖𝒔𝒊𝒐𝒏𝒆𝒔: ${Array.from(ALWAYS_EXCLUDE).join(', ')}
   • 𝑺𝒆𝒔𝒊𝒐𝒏𝒆𝒔: ${includeSessions ? '𝑰𝑵𝑪𝑳𝑼𝑰𝑫𝑨𝑺 ⚜️' : '𝑬𝑿𝑪𝑳𝑼𝑰𝑫𝑨𝑺 ✖️'}

👑 *"𝑳𝒂 𝒔𝒖𝒑𝒆𝒓𝒊𝒐𝒓𝒊𝒅𝒂𝒅 𝒅𝒆 𝒖𝒏 𝒔𝒊𝒔𝒕𝒆𝒎𝒂 𝒏𝒐 𝒔𝒆 𝒎𝒊𝒅𝒆 𝒑𝒐𝒓 𝒔𝒖 𝒑𝒐𝒅𝒆𝒓, 𝒔𝒊𝒏𝒐 𝒑𝒐𝒓 𝒔𝒖 𝒄𝒂𝒑𝒂𝒄𝒊𝒅𝒂𝒅 𝒅𝒆 𝒑𝒓𝒆𝒔𝒆𝒓𝒗𝒂𝒓𝒔𝒆."*`, m)
    
    await copyTree(ROOT, exportDir, includeSessions)
    
    await conn.reply(m.chat, 
`┏━━━━━━━━━━━━━━━━━━━━━┓
┃  ⓘ 𝑭𝑨𝑺𝑬 1: 𝑪𝑶𝑴𝑷𝑳𝑬𝑻𝑨 ┃
┗━━━━━━━━━━━━━━━━━━━━━┛

✅ *𝑪𝒐𝒑𝒊𝒂 𝒇𝒊𝒏𝒂𝒍𝒊𝒛𝒂𝒅𝒂 𝒄𝒐𝒏 é𝒙𝒊𝒕𝒐*
╰─▸ *𝑹𝒆𝒔𝒖𝒎𝒆𝒏:*
   • 𝑫𝒊𝒓𝒆𝒄𝒕𝒐𝒓𝒊𝒐𝒔 𝒑𝒓𝒐𝒄𝒆𝒔𝒂𝒅𝒐𝒔: ✓
   • 𝑨𝒓𝒄𝒉𝒊𝒗𝒐𝒔 𝒆𝒙𝒄𝒍𝒖𝒊𝒅𝒐𝒔: ${ALWAYS_EXCLUDE.size + EXCLUDE_FILES.size}
   • 𝑬𝒔𝒕𝒂𝒅𝒐: 𝑪𝒐𝒑𝒊𝒂 𝒇𝒊𝒏𝒂𝒍𝒊𝒛𝒂𝒅𝒂 𝒄𝒐𝒓𝒓𝒆𝒄𝒕𝒂𝒎𝒆𝒏𝒕𝒆

👑 *"𝑬𝒍 𝒑𝒓𝒊𝒎𝒆𝒓 𝒑𝒂𝒔𝒐 𝒉𝒂𝒄𝒊𝒂 𝒍𝒂 𝒗𝒊𝒄𝒕𝒐𝒓𝒊𝒂 𝒆𝒔 𝒆𝒍 𝒑𝒓𝒆𝒑𝒂𝒓𝒂𝒕𝒊𝒗𝒐."*`, m)
    
  } catch (e) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    return conn.reply(m.chat, 
`┏━━━━━━━━━━━━━━━━━━━━━┓
┃  ⓘ 𝑬𝑹𝑹𝑶𝑹: 𝑭𝑨𝑺𝑬 1 ┃
┗━━━━━━━━━━━━━━━━━━━━━┛

❌ *𝑭𝒂𝒍𝒍𝒐 𝒆𝒏 𝒍𝒂 𝒄𝒐𝒑𝒊𝒂 𝒅𝒆 𝒂𝒓𝒄𝒉𝒊𝒗𝒐𝒔*
╰─▸ *𝑫𝒆𝒕𝒂𝒍𝒍𝒆𝒔 𝒅𝒆𝒍 𝒆𝒓𝒓𝒐𝒓:*
   • 𝑬𝒓𝒓𝒐𝒓: ${e.message}
   • 𝑶𝒑𝒆𝒓𝒂𝒄𝒊ó𝒏: 𝑪𝒂𝒏𝒄𝒆𝒍𝒂𝒅𝒂

💀 *"𝑼𝒏 𝒓𝒆𝒗𝒆𝒔 𝒏𝒐 𝒆𝒔 𝒅𝒆𝒓𝒓𝒐𝒕𝒂, 𝒑𝒆𝒓𝒐 𝒔𝒊 𝒖𝒏𝒂 𝒂𝒅𝒗𝒆𝒓𝒕𝒆𝒏𝒄𝒊𝒂."*
🔸 𝑽𝒆𝒓𝒊𝒇𝒊𝒒𝒖𝒆 𝒑𝒆𝒓𝒎𝒊𝒔𝒐𝒔 𝒚 𝒆𝒔𝒑𝒂𝒄𝒊𝒐 𝒆𝒏 𝒅𝒊𝒔𝒄𝒐.`, m)
  }

  // ⓘ Fase 2: Compresión
  let artifact = zipPath
  try {
    await conn.reply(m.chat, 
`┏━━━━━━━━━━━━━━━━━━━━━┓
┃  ⓘ 𝑭𝑨𝑺𝑬 2: 𝑪𝑶𝑴𝑷𝑹𝑬𝑺𝑰Ó𝑵 ┃
┗━━━━━━━━━━━━━━━━━━━━━┛

⚔️ *𝑰𝒏𝒊𝒄𝒊𝒂𝒏𝒅𝒐 𝒄𝒐𝒎𝒑𝒓𝒆𝒔𝒊ó𝒏 𝒅𝒆 𝒂𝒓𝒄𝒉𝒊𝒗𝒐𝒔*
╰─▸ *𝑪𝒐𝒏𝒇𝒊𝒈𝒖𝒓𝒂𝒄𝒊ó𝒏:*
   • 𝑴é𝒕𝒐𝒅𝒐: ${process.platform === 'win32' ? '𝑷𝒐𝒘𝒆𝒓𝑺𝒉𝒆𝒍𝒍 𝑪𝒐𝒎𝒑𝒓𝒆𝒔𝒔-𝑨𝒓𝒄𝒉𝒊𝒗𝒆' : '𝒛𝒊𝒑/𝒕𝒂𝒓'}
   • 𝑭𝒐𝒓𝒎𝒂𝒕𝒐 𝒅𝒆𝒔𝒕𝒊𝒏𝒐: ${process.platform === 'win32' ? '𝒁𝑰𝑷' : '𝒁𝑰𝑷 (𝒓𝒆𝒔𝒆𝒓𝒗𝒂: 𝑻𝑨𝑹.𝑮𝒁)'}
   • 𝑼𝒃𝒊𝒄𝒂𝒄𝒊ó𝒏: ${artifact}

👑 *"𝑳𝒂 𝒆𝒇𝒊𝒄𝒊𝒆𝒏𝒄𝒊𝒂 𝒆𝒔 𝒆𝒍 𝒂𝒓𝒕𝒆 𝒅𝒆 𝒐𝒃𝒕𝒆𝒏𝒆𝒓 𝒆𝒍 𝒎á𝒙𝒊𝒎𝒐 𝒓𝒆𝒔𝒖𝒍𝒕𝒂𝒅𝒐 𝒄𝒐𝒏 𝒆𝒍 𝒎í𝒏𝒊𝒎𝒐 𝒓𝒆𝒔𝒐𝒖𝒓𝒔𝒐."*`, m)
    
    if (process.platform === 'win32') {
      await zipFolderWin(exportDir, zipPath)
    } else {
      artifact = await zipFolderUnix(exportDir, zipPath)
    }

    const stat = await fsp.stat(artifact)
    const maxSend = 95 * 1024 * 1024
    
    await conn.reply(m.chat, 
`┏━━━━━━━━━━━━━━━━━━━━━┓
┃  ⓘ 𝑭𝑨𝑺𝑬 2: 𝑪𝑶𝑴𝑷𝑳𝑬𝑻𝑨 ┃
┗━━━━━━━━━━━━━━━━━━━━━┛

✅ *𝑪𝒐𝒎𝒑𝒓𝒆𝒔𝒊ó𝒏 𝒇𝒊𝒏𝒂𝒍𝒊𝒛𝒂𝒅𝒂*
╰─▸ *𝑬𝒔𝒕𝒂𝒅í𝒔𝒕𝒊𝒄𝒂𝒔 𝒅𝒆 𝒄𝒐𝒎𝒑𝒓𝒆𝒔𝒊ó𝒏:*
   • 𝑻𝒂𝒎𝒂ñ𝒐 𝒄𝒐𝒎𝒑𝒓𝒊𝒎𝒊𝒅𝒐: ${(stat.size / 1024 / 1024).toFixed(2)} 𝑴𝑩
   • 𝑻𝒂𝒎𝒂ñ𝒐 𝒍í𝒎𝒊𝒕𝒆 𝒅𝒆 𝒆𝒏𝒗í𝒐: ${(maxSend / 1024 / 1024).toFixed(0)} 𝑴𝑩
   • 𝑬𝒔𝒕𝒂𝒅𝒐: ${stat.size > maxSend ? '𝑺𝑶𝑩𝑹𝑬𝑷𝑨𝑺𝑨 𝑳Í𝑴𝑰𝑻𝑬 ⚠️' : '𝑫𝑬𝑵𝑻𝑹𝑶 𝒅𝒆 𝒍í𝒎𝒊𝒕𝒆𝒔 ✓'}

👑 *"𝑳𝒂 𝒑𝒆𝒓𝒇𝒆𝒄𝒄𝒊ó𝒏 𝒏𝒐 𝒆𝒔 𝒖𝒏 𝒂𝒄𝒄𝒊𝒅𝒆𝒏𝒕𝒆, 𝒆𝒔 𝒖𝒏𝒂 𝒅𝒆𝒄𝒊𝒔𝒊ó𝒏."*`, m)

    if (stat.size > maxSend) {
      await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } })
      return conn.reply(m.chat, 
`┏━━━━━━━━━━━━━━━━━━━━━┓
┃  ⓘ 𝑨𝑳𝑬𝑹𝑻𝑨: 𝑻𝑨𝑴𝑨Ñ𝑶 ┃
┗━━━━━━━━━━━━━━━━━━━━━┛

⚠️ *𝑨𝑹𝑪𝑯𝑰𝑽𝑶 𝑫𝑬𝑴𝑨𝑺𝑰𝑨𝑫𝑶 𝑮𝑹𝑨𝑵𝑫𝑬*
╰─▸ *𝑫𝒆𝒕𝒂𝒍𝒍𝒆𝒔:*
   • 𝑷𝒆𝒔𝒐 𝒕𝒐𝒕𝒂𝒍: ${(stat.size / 1024 / 1024).toFixed(1)} 𝑴𝑩
   • 𝑳í𝒎𝒊𝒕𝒆 𝒅𝒆 𝒆𝒏𝒗í𝒐: ${(maxSend / 1024 / 1024).toFixed(0)} 𝑴𝑩
   • 𝑬𝒙𝒄𝒆𝒅𝒆 𝒆𝒏: ${((stat.size - maxSend) / 1024 / 1024).toFixed(1)} 𝑴𝑩

💀 *"𝑼𝒏 𝒑𝒍𝒂𝒏 𝒑𝒆𝒓𝒇𝒆𝒄𝒕𝒐 𝒓𝒆𝒒𝒖𝒊𝒆𝒓𝒆 𝒂𝒅𝒂𝒑𝒕𝒂𝒄𝒊ó𝒏 𝒂 𝒍𝒂𝒔 𝒄𝒊𝒓𝒄𝒖𝒏𝒔𝒕𝒂𝒏𝒄𝒊𝒂𝒔."*
🔸 𝑺𝒖𝒃𝒂 𝒎𝒂𝒏𝒖𝒂𝒍𝒎𝒆𝒏𝒕𝒆: ${artifact}`, m)
    }

    // ⓘ Fase 3: Envío
    await conn.reply(m.chat, 
`┏━━━━━━━━━━━━━━━━━━━━━┓
┃  ⓘ 𝑭𝑨𝑺𝑬 3: 𝑬𝑵𝑽Í𝑶  ┃
┗━━━━━━━━━━━━━━━━━━━━━┛

⚔️ *𝑻𝒓𝒂𝒏𝒔𝒎𝒊𝒕𝒊𝒆𝒏𝒅𝒐 𝒓𝒆𝒔𝒑𝒂𝒍𝒅𝒐*
╰─▸ *𝑫𝒆𝒕𝒂𝒍𝒍𝒆𝒔 𝒅𝒆 𝒆𝒏𝒗í𝒐:*
   • 𝑵𝒐𝒎𝒃𝒓𝒆 𝒅𝒆𝒍 𝒂𝒓𝒄𝒉𝒊𝒗𝒐: ${path.basename(artifact)}
   • 𝑻𝒂𝒎𝒂ñ𝒐: ${(stat.size / 1024 / 1024).toFixed(2)} 𝑴𝑩
   • 𝑻𝒊𝒑𝒐 𝑴𝑰𝑴𝑬: ${artifact.endsWith('.zip') ? '𝒂𝒑𝒑𝒍𝒊𝒄𝒂𝒕𝒊𝒐𝒏/𝒛𝒊𝒑' : '𝒂𝒑𝒑𝒍𝒊𝒄𝒂𝒕𝒊𝒐𝒏/𝒈𝒛𝒊𝒑'}

👑 *"𝑬𝒍 𝒎𝒐𝒎𝒆𝒏𝒕𝒐 𝒇𝒊𝒏𝒂𝒍 𝒅𝒆𝒃𝒆 𝒔𝒆𝒓 𝒕𝒂𝒏 𝒊𝒎𝒑𝒆𝒄𝒂𝒃𝒍𝒆 𝒄𝒐𝒎𝒐 𝒆𝒍 𝒑𝒓𝒊𝒎𝒆𝒓𝒐."*`, m)
    
    const buffer = await fsp.readFile(artifact)
    const fileName = path.basename(artifact)
    const mt = artifact.endsWith('.zip')
      ? 'application/zip'
      : (artifact.endsWith('.tar.gz') ? 'application/gzip' : 'application/octet-stream')
    
    await conn.sendMessage(
      m.chat,
      { document: buffer, mimetype: mt, fileName },
      { quoted: m }
    )

    await conn.sendMessage(m.chat, { react: { text: '👑', key: m.key } })

    // ⓘ Mensaje final de éxito
    await conn.reply(m.chat, 
`┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃     ⓘ 𝑴𝑰𝑺𝑰Ó𝑵: 𝑪𝑶𝑴𝑷𝑳𝑬𝑻𝑨𝑫𝑨    ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

👑 *𝑹𝑬𝑺𝑷𝑨𝑳𝑫𝑶 𝑪𝑶𝑴𝑷𝑳𝑬𝑻𝑶 𝑪𝑶𝑵 É𝑿𝑰𝑻𝑶*
╰─▸ *𝑹𝒆𝒔𝒖𝒎𝒆𝒏 𝒇𝒊𝒏𝒂𝒍:*
   • 𝑭𝒂𝒔𝒆𝒔 𝒄𝒐𝒎𝒑𝒍𝒆𝒕𝒂𝒅𝒂𝒔: 3/3
   • 𝑻𝒊𝒆𝒎𝒑𝒐 𝒕𝒐𝒕𝒂𝒍: ${Date.now() - m.messageTimestamp * 1000}𝒎𝒔
   • 𝑻𝒂𝒎𝒂ñ𝒐 𝒇𝒊𝒏𝒂𝒍: ${(stat.size / 1024 / 1024).toFixed(2)} 𝑴𝑩
   • 𝑬𝒔𝒕𝒂𝒅𝒐: 𝑷𝑹𝑶𝑻𝑶𝑪𝑶𝑳𝑶 𝑪𝑼𝑴𝑷𝑳𝑰𝑫𝑶 ⚜️

🎭 *"𝑳𝒂 𝒗𝒊𝒄𝒕𝒐𝒓𝒊𝒂 𝒆𝒔 𝒂𝒒𝒖𝒆𝒍𝒍𝒂 𝒒𝒖𝒆 𝒑𝒆𝒓𝒔𝒊𝒔𝒕𝒆 𝒆𝒏 𝒔𝒖 𝒑𝒓𝒆𝒑𝒂𝒓𝒂𝒄𝒊ó𝒏."*
🔸 𝑬𝒍 𝒓𝒆𝒔𝒑𝒂𝒍𝒅𝒐 𝒅𝒆𝒍 𝒓𝒆𝒊𝒏𝒐 𝒆𝒔𝒕á 𝒔𝒆𝒈𝒖𝒓𝒐 𝒃𝒂𝒋𝒐 𝒕𝒖 𝒄𝒖𝒊𝒅𝒂𝒅𝒐, 𝒎𝒊 𝒔𝒆ñ𝒐𝒓.

⚡ *𝑪𝒐𝒎𝒂𝒏𝒅𝒐 𝒆𝒋𝒆𝒄𝒖𝒕𝒂𝒅𝒐 𝒑𝒐𝒓: ${conn.getName(m.sender)}*`, m)

  } catch (e) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    await conn.reply(m.chat, 
`┏━━━━━━━━━━━━━━━━━━━━━┓
┃  ⓘ 𝑬𝑹𝑹𝑶𝑹: 𝑭𝑰𝑵𝑨𝑳 ┃
┗━━━━━━━━━━━━━━━━━━━━━┛

❌ *𝑭𝑨𝑳𝑳𝑶 𝑬𝑵 𝑬𝑳 𝑷𝑹𝑶𝑪𝑬𝑺𝑶 𝑫𝑬 𝑹𝑬𝑺𝑷𝑨𝑳𝑫𝑶*
╰─▸ *𝑫𝒆𝒕𝒂𝒍𝒍𝒆𝒔 𝒅𝒆𝒍 𝒆𝒓𝒓𝒐𝒓:*
   • 𝑬𝒓𝒓𝒐𝒓: ${e.message}
   • 𝑭𝒂𝒔𝒆 𝒇𝒂𝒍𝒍𝒂𝒅𝒂: 𝑭𝒂𝒔𝒆 3 (𝑬𝒏𝒗í𝒐)

💀 *"𝑯𝒂𝒔𝒕𝒂 𝒆𝒍 𝒑𝒍𝒂𝒏 𝒎á𝒔 𝒑𝒆𝒓𝒇𝒆𝒄𝒕𝒐 𝒑𝒖𝒆𝒅𝒆 𝒇𝒂𝒍𝒍𝒂𝒓 𝒇𝒓𝒆𝒏𝒕𝒆 𝒂 𝒍𝒂 𝒊𝒎𝒑𝒓𝒆𝒗𝒊𝒔𝒊ó𝒏."*
🔸 𝑳𝒐𝒔 𝒂𝒓𝒄𝒉𝒊𝒗𝒐𝒔 𝒕𝒆𝒎𝒑𝒐𝒓𝒂𝒍𝒆𝒔 𝒔𝒆 𝒆𝒍𝒊𝒎𝒊𝒏𝒂𝒓á𝒏 𝒂𝒖𝒕𝒐𝒎á𝒕𝒊𝒄𝒂𝒎𝒆𝒏𝒕𝒆.`, m)
  } finally {
    try { await fsp.rm(exportDir, { recursive: true, force: true }) } catch {}
    try { await fsp.rm(artifact, { force: true }) } catch {}
  }
}

handler.help = ['backupbot']
handler.tags = ['owner']
handler.command = ['backup', 'backupbot', 'export', 'respaldo']
handler.rowner = true

export default handler
