import fs from "fs"
import { cac } from "cac"
import identifyFromFileName, {
	FileType,
	getFileEndingFromType
} from "./fileNameIdentifier"

const cli = cac()

async function checkFileExists(file: string) {
	return fs.promises
		.access(file, fs.constants.F_OK)
		.then(() => true)
		.catch(() => false)
}

cli
	.command("[input] <output>", "Bundle this file and all dependencies")
	.action(async (input: string, output: string | undefined) => {
		if (!checkFileExists(input)) {
			throw new Error("Input file not found.")
		}

		const mainFileType = identifyFromFileName(input)

		if (mainFileType == FileType.Shared) {
			throw new Error("Main file type cannot be shared.")
		}

		// Check if output filename is correct
		if (!output) {
			output ??= `main.${getFileEndingFromType(mainFileType)}.lua`
		} else {
			try {
				identifyFromFileName(output)
			} catch {
				output = `${output.replace(".lua", "")}.${getFileEndingFromType(
					mainFileType
				)}.lua`
			}
		}
	})
