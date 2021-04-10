export enum FileType {
	Server,
	Client,
	Shared
}

const fileEndingToType: Record<string, FileType | undefined> = {
	server: FileType.Server,
	client: FileType.Client,
	shared: FileType.Shared
}

export function getFileEndingFromType(fileType: FileType): string {
	const result = Object.keys(fileEndingToType).find(
		(fileEnding) => fileEndingToType[fileEnding] === fileType
	)

	if (!result)
		throw new Error("Invalid fileType provided for getFileEndingFromType")
	return result
}

export default function identifyFromFileName(
	fileName: string
): FileType | never {
	const splitByDot = fileName.split(".")

	let result

	if (
		splitByDot.length > 2 &&
		(result = fileEndingToType[splitByDot[splitByDot.length - 2]]) !== undefined
	) {
		return result
	}

	throw new Error(
		`Expected one of ${Object.keys(fileEndingToType).map(
			(f) => `fileName.${f}.lua`
		)} while parsing filename ${fileName}.`
	)
}
