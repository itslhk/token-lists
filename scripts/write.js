const path  = require("path")
const { writeFile, readFileSync } = require("fs")
const { build } = require("./build")
const util = require('util')

const lists = build()

const diff = (filePath, newTokenList) => {
	let ntl = newTokenList
	let raw_data = Buffer.from(readFileSync(filePath)).toString()
	let otl = JSON.parse(raw_data)
	delete otl.version
	delete otl.timestamp
	delete ntl.version
	delete ntl.timestamp
	return util.isDeepStrictEqual(otl, ntl)
}
Object.entries(lists).forEach(([tokenType, list]) => {
	Object.entries(list).forEach(([shortName, tokenList]) => {
		let cleanSN = shortName.toLowerCase()
		let cleanTT = tokenType.replace("s", "")
		let filename = `tradescrow-${cleanSN}.${cleanTT}list.json`
		let filepath = path.join(__dirname, "..", "build", `${cleanSN==="all"?"":tokenType}`,filename)
		let same = diff(filepath, tokenList)
		if (same) {
			console.log(`${filepath} is unchanged. Not updating`)
			return
		}
		console.log(`Writing ${path.join("build", `${cleanSN==="all"?"":tokenType}`, filename)}`)
		let json = JSON.stringify(tokenList, null, 2)
		writeFile(filepath, json, (err, file) => {
			if (err) {
				return console.log(`Unable to write ${file}. Error: ${err}`)
			}
		})
	})
})