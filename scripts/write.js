const path  = require("path")
const { writeFile } = require("fs")
const { build } = require("./build")

const lists = build()

Object.entries(lists).forEach(([tokenType, list]) => {
	Object.entries(list).forEach(([shortName, tokenList]) => {
		let cleanSN = shortName.toLowerCase()
		let cleanTT = tokenType.replace("s", "")
		let filename = `tradescrow-${cleanSN}.${cleanTT}list.json`
		let filepath = path.join(__dirname, "..", "build", filename)
		console.log(`Writing ${path.join("build", filename)}`)
		let json = JSON.stringify(tokenList, null, 2)
		writeFile(filepath, json, (err, file) => {
			if (err) {
				return console.log(`Unable to write ${file}. Error: ${err}`)
			}
		})
	})
})