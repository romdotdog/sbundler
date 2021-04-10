import fs from "fs"
import { cac } from "cac"
import identifyFromFileName, {
	FileType,
	getFileEndingFromType
} from "./fileNameIdentifier"
import glob from "glob-promise"
import { dirname, join } from "path"
import escalade from "escalade"
import { version } from "../package.json"

const cli = cac()

async function checkFileExists(file: string) {
	return fs.promises
		.access(file, fs.constants.F_OK)
		.then(() => true)
		.catch(() => false)
}

cli
	.command("", "Bundle this file and all dependencies")
	.option("-s <serverMain>, --server <serverMain>", "Set main server file")
	.option("-c <clientMain>, --client <clientMain>", "Set main client file")
	.option("-nw, --no-watermark", "Set no watermark")
	.action(async (options) => {
		const serverMain = options.serverMain ?? "main.server.lua"
		const clientMain = options.clientMain ?? "main.client.lua"

		if (!checkFileExists(serverMain)) {
			throw new Error("Server main file not found.")
		}

		if (!checkFileExists(clientMain)) {
			throw new Error("Client main file not found.")
		}

		const serverFileType = identifyFromFileName(serverMain)
		const clientFileType = identifyFromFileName(clientMain)

		if (serverFileType != FileType.Server)
			throw new Error(
				`Server file type cannot be ${getFileEndingFromType(serverFileType)}.`
			)

		if (clientFileType != FileType.Client)
			throw new Error(
				`Client file type cannot be ${getFileEndingFromType(clientFileType)}.`
			)

		// Find moduleLibraries
		const moduleLibraries = await escalade(
			__dirname,
			(_, names) => names.includes("moduleLibraries") && "moduleLibraries"
		)

		if (!moduleLibraries)
			throw new Error(
				"Could not find folder `moduleLibraries` in project directory. Are you sure you installed sbundler right?"
			)

		const sideSpecificLibraries = new Map<FileType, string>()
		sideSpecificLibraries.set(
			FileType.Server,
			await fs.promises.readFile(join(moduleLibraries, "server.lua"), "utf-8")
		)

		sideSpecificLibraries.set(
			FileType.Client,
			await fs.promises.readFile(join(moduleLibraries, "client.lua"), "utf-8")
		)

		const bundlingLibrary = await fs.promises.readFile(
			join(moduleLibraries, "bundle.lua"),
			"utf-8"
		)

		const resultingBundles = new Map<FileType, string>()
		for (const [type, library] of sideSpecificLibraries.entries()) {
			const mainFile = type == FileType.Server ? serverMain : clientMain

			let bundle = `${library}\n${bundlingLibrary}\nmodules = {`

			const files = await glob(`**/*.${getFileEndingFromType(type)}.lua`, {
				cwd: dirname(serverMain)
			})

			// Include file if is serverside
			for (const file of files) {
				if (file == mainFile) continue

				try {
					const fileType = identifyFromFileName(file)
					if (fileType == type || fileType == FileType.Shared) {
						let content = await fs.promises.readFile(file, "utf-8")
						content = content.replace(/\n/g, "\n\t\t")
						bundle += `\n\t["${file}"] = function()\n\t\t${content}\n\tend;`
					}
				} catch {
					console.log(`File ${file} does not obey filenaming rules.`)
				}
			}

			bundle += "\n}\n\n"
			bundle += await fs.promises.readFile(mainFile, "utf-8")

			resultingBundles.set(type, bundle)
		}

		const serverBundle = resultingBundles.get(FileType.Server)
		if (!serverBundle) throw new Error("Server bundle not found.")

		const clientBundle = resultingBundles.get(FileType.Client)
		if (!clientBundle) throw new Error("Client bundle not found.")

		// Generate enough equals signs to not cause conflicts (one of the few great qualities of Lua!)
		let eq = ""
		while (clientBundle.includes("]" + eq + "]")) eq += "="

		let watermark = `-- Bundled with sbundler ${version} - https://github.com/romdotdog/sbundler\n\n`

		if (options.nw) watermark = ""

		fs.promises.writeFile(
			"bundle.lua",
			serverBundle.replace(
				"__SBUNDLER__CLIENT__",
				watermark + `[${eq}[\n\t${clientBundle.replace(/\n/g, "\n\t")}\n]${eq}]`
			)
		)
	})

cli.help()
cli.version(version)

cli.parse()
