import { writeFileSync, mkdirSync, existsSync } from 'fs'
import path from 'path'

let handler = async (m, { text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`> ⓘ Uso incorrecto: Debes proporcionar la ruta y nombre del archivo

*Ejemplo:*
• ${usedPrefix + command} plugins/hola.js
• ${usedPrefix + command} database/config.json

*Nota:* Responde al mensaje que contiene el código a guardar.`)
  }

  if (!m.quoted || !m.quoted.text) {
    return m.reply('> ⓘ Responde al mensaje que contiene el código que quieres guardar, mi señor.')
  }

  try {
    let filePath = text.trim()

    // Asegurar ruta correcta
    if (!filePath.startsWith('./')) filePath = './' + filePath

    // Crear directorio si no existe
    const dir = path.dirname(filePath)
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })

    // Guardar archivo
    writeFileSync(filePath, m.quoted.text, 'utf8')

    const fileContent = m.quoted.text

    return m.reply(`> ⓘ Orden ejecutada: Archivo guardado correctamente, mi señor.

> ⓘ Ubicación:
\`\`\`${filePath}\`\`\`

> ⓘ Tamaño:
\`\`\`${fileContent.length} caracteres\`\`\`

> ⓘ Ruta completa:
\`\`\`${path.resolve(filePath)}\`\`\``)

  } catch (error) {
    console.error('Error:', error)
    return m.reply(`> ⓘ Error al guardar el archivo, mi señor.\n\`\`\`${error.message}\`\`\``)
  }
}

handler.help = ['guardar']
handler.tags = ['owner']
handler.command = ['guardar', 'save']
handler.rowner = true

export default handler
