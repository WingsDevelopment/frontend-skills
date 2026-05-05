#!/usr/bin/env node

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const skillRoot = path.resolve(__dirname, "..")
const templatesRoot = path.join(skillRoot, "assets", "display-fields")

function printHelp() {
  console.log(
    [
      "web3-display-components skill: display-fields scaffold",
      "",
      "Usage:",
      "  node scripts/init-display-fields.mjs [--target <path>] [--force]",
      "",
      "Options:",
      "  --target   Output directory for generated files.",
      "             Default: src/app/components/display-fields",
      "  --force    Overwrite existing files if they already exist.",
      "  --help     Show this help output.",
    ].join("\n"),
  )
}

function parseArgs(argv) {
  const args = [...argv]
  let target = "src/app/components/display-fields"
  let force = false

  while (args.length > 0) {
    const arg = args.shift()

    if (arg === "--help" || arg === "-h") {
      return { help: true, target, force }
    }

    if (arg === "--target") {
      const next = args.shift()
      if (!next) {
        throw new Error("Missing value for --target")
      }
      target = next
      continue
    }

    if (arg === "--force") {
      force = true
      continue
    }

    throw new Error(`Unknown argument: ${arg}`)
  }

  return { help: false, target, force }
}

function listTemplateFiles(rootDir) {
  const files = []

  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true })

    for (const entry of entries) {
      const absolutePath = path.join(currentDir, entry.name)

      if (entry.isDirectory()) {
        walk(absolutePath)
        continue
      }

      if (entry.isFile()) {
        files.push(absolutePath)
      }
    }
  }

  walk(rootDir)
  return files
}

function copyTemplates({ target, force }) {
  if (!fs.existsSync(templatesRoot)) {
    throw new Error(`Template directory not found: ${templatesRoot}`)
  }

  const targetRoot = path.resolve(process.cwd(), target)
  const templateFiles = listTemplateFiles(templatesRoot)

  const conflicts = []
  const written = []

  for (const sourceFile of templateFiles) {
    const relativePath = path.relative(templatesRoot, sourceFile)
    const destinationFile = path.join(targetRoot, relativePath)

    if (fs.existsSync(destinationFile) && !force) {
      conflicts.push(destinationFile)
      continue
    }

    fs.mkdirSync(path.dirname(destinationFile), { recursive: true })
    fs.copyFileSync(sourceFile, destinationFile)
    written.push(destinationFile)
  }

  if (conflicts.length > 0) {
    const preview = conflicts.slice(0, 8).map((item) => `- ${item}`).join("\n")
    const extra = conflicts.length > 8 ? `\n...and ${conflicts.length - 8} more` : ""

    throw new Error(
      [
        "Refusing to overwrite existing files without --force:",
        preview + extra,
      ].join("\n"),
    )
  }

  return { targetRoot, written }
}

try {
  const { help, target, force } = parseArgs(process.argv.slice(2))

  if (help) {
    printHelp()
    process.exit(0)
  }

  const { targetRoot, written } = copyTemplates({ target, force })

  console.log(`Generated display-fields wrapper folder at: ${targetRoot}`)

  if (written.length > 0) {
    for (const filePath of written) {
      console.log(`- ${path.relative(process.cwd(), filePath) || filePath}`)
    }
  } else {
    console.log("No files written.")
  }

  console.log("\nImport from the generated index file to use the wrappers.")
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`Error: ${message}`)
  process.exit(1)
}
