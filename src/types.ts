
export interface BitWardenPasswordExport {
	encrypted: boolean
	folders: Folder[]
	items: Item[]
}

export interface Folder {
	id: string
	name: string
}

export interface Item {
	passwordHistory: unknown[]
	revisionDate: string
	creationDate: string
	deletedDate: string | null
	id: string
	organizationId: string | null
	folderId: string
	type: number
	reprompt: number
	name: string
	notes: string | null
	favorite: boolean
	fields: Field[]
	login: Login | null
	collectionIds: string | null
}

export interface Login {
	uris: [
		{
			match: string | null
			uri: string
		}
	]
	username: string
	password: string
	totp: unknown | null
}

export interface Field {
	name: string
	value: string
	type: number
	linkedId: string | null
}
