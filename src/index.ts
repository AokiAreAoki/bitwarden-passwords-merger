import fs from 'fs'
import { BitWardenPasswordExport } from './types'

const DATE_CHANGE_KEY = "revisionDate"

async function main(args: string[]) {
	const fileNames = []
	const outputFile = args.pop()
	const filesToMerge = args
		.map(path => {
			if (!path.includes('*')) {
				fileNames.push(`\`${filename(path)}\``)
				return path
			}

			const dir = path
				.replace(/\\/g, '/')
				.split('/')
				.slice(0, -1)
				.join('/')

			const pattern = new RegExp(
				path
					.replace(/\\/g, '/')
					.split('/')
					.slice(-1)[0]
					.replace(/\./g, '\\.')
					.replace(/\*/g, '.*')
			)

			const matchedFiles = fs
				.readdirSync(dir || '.')
				.filter(filename => pattern.test(filename))
			const matchedFileNames =
				matchedFiles
					.map(f => `  - \`${f}\``)
					.join('\n')

			fileNames.push(`\`${filename(path)}\`; matched:\n${matchedFileNames}`)

			return matchedFiles.map(f => (dir ? `${dir}/` : '') + f)
		})
		.flat(1)

	if (!outputFile || filesToMerge.length === 0) {
		console.error('Usage: bitwarden-passwords-merger <...filesToMerge> <outputFile>')
		process.exit(1)
	}

	console.log(`Merging:\n${fileNames
		.map(path => `- ${filename(path)}`)
		.join('\n')
		}`)
	console.log(`Output file: \`${filename(outputFile)}\``)

	const folderLookupMap = new Map<string, Folder>()
	const itemLookupMap = new Map<string, Item>()

	let folderCountBefore = 0
	let itemCountBefore = 0

	for (const file of filesToMerge) {
		const fileContent = fs.readFileSync(file, 'utf-8')
		const data = JSON.parse(fileContent) as BitWardenPasswordExport

		// Folders
		for (const folder of data.folders) {
			try {
				const folderKey = folder.name
				const existingFolder = folderLookupMap.get(folderKey)

				if (existingFolder) {
					folderLookupMap.set(folderKey, {
						...folder,
						...existingFolder,
					})
				} else {
					folderLookupMap.set(folderKey, folder)
				}

				++folderCountBefore
			} catch (error) {
				console.error(`Error processing folder: `, folder)
				throw error
			}
		}

		// Files
		for (const item of data.items) {
			try {
				const itemKey = Buffer.from(JSON.stringify({
					name: item.name,
					notes: item.notes,
					// login: item.login && {
					// 	username: item.login.username,
					// 	password: item.login.password,
					// 	uris: item.login.uris,
					// },
				})).toString('base64')
				const existingItem = itemLookupMap.get(itemKey)

				if (existingItem) {
					const itemChangedAt = new Date(item[DATE_CHANGE_KEY])
					const existingItemChangedAt = new Date(existingItem[DATE_CHANGE_KEY])
					const latestItem = itemChangedAt > existingItemChangedAt
						? item
						: existingItem

					itemLookupMap.set(itemKey, latestItem)

					// itemLookupMap.set(itemKey, {
					// 	...item,
					// 	...existingItem,
					// })
				} else {
					itemLookupMap.set(itemKey, item)
				}

				++itemCountBefore
			} catch (error) {
				console.error(`Error processing item: `, item)
				throw error
			}
		}
	}

	const mergedData: BitWardenPasswordExport = {
		encrypted: false,
		folders: Array.from(folderLookupMap.values()),
		items: Array.from(itemLookupMap.values()),
	}

	const mergedContent = JSON.stringify(mergedData, null, 2)
	fs.writeFileSync(outputFile, mergedContent, 'utf-8')

	console.log(`Merged ${folderCountBefore} folders into ${mergedData.folders.length} unique folders. (${folderCountBefore - mergedData.folders.length} duplicates)`)
	console.log(`Merged ${itemCountBefore} items into ${mergedData.items.length} unique items. (${itemCountBefore - mergedData.items.length} duplicates)`)
}

function filename(path: string) {
	return path.replace(/.*[\\/]/, '')
}

main(process.argv.slice(2))
