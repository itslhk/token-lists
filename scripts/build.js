const path = require("path")
const merge = require("deepmerge")
const { version } = require("../package.json")
const { readdirSync, readFileSync } = require("fs")

const parsed = version.split(".")
const tokenTypes = ["nfts", "tokens"]

const NetworkTags = {
    "harmony": {
        "name": "Harmony",
        "description": "Tokens on the Harmony network"
    }
}

function sortTokens(tokens) {
    tokens
      .sort((t1, t2) => {
          if (t1.chainId === t2.chainId) {
              return t1.symbol.toLowerCase() < t2.symbol.toLowerCase() ? -1 : 1
          }
          return t1.chainId < t2.chainId ? -1 : 1
      })
}

function newTradescrowList(network, shortName) {
    let tags = {}
    tags[network] = NetworkTags[network]

    return {
        name: `Tradescrow ${shortName}`,
        timestamp: new Date().toISOString(),
        version: {
            major: +parsed[0],
            minor: +parsed[1],
            patch: +parsed[2],
        },
        keywords: ["tradescrow", "approved"],
        logoURI: "https://tradescrow.s3.us-east-2.amazonaws.com/black/logo.png",
        tags: tags
    }
}

function build() {
    console.log("Building lists...")
    console.log(`Version: ${version}`)

    let lists = {
        nfts: {
            all: {
                shortName: "ERC721",
                keywords: ["consolidated"],
                tokens: []
            }
        },
        tokens: {
            all: {
                shortName: "ERC20",
                keywords: ["consolidated"],
                tokens: []
            }
        }
    }
    tokenTypes.forEach((tokenType) => {
        const directoryPath = path.join(__dirname, "..", "src", tokenType);
        readdirSync(directoryPath).forEach((file) => {
            let [, network,] = file.split('-')
            let filePath = path.join(directoryPath, file)
            let raw_data = Buffer.from(readFileSync(filePath)).toString()
            let partialList = JSON.parse(raw_data)

            let shortName = partialList["shortName"]
            delete partialList["shortName"]

            lists[tokenType][shortName] = merge(
              newTradescrowList(network, shortName), partialList
        )
            sortTokens(lists[tokenType][shortName].tokens)
            lists[tokenType].all.tokens.push(...lists[tokenType][shortName].tokens)
        })
        // make consolidated list
        let shortName = lists[tokenType].all.shortName
        delete lists[tokenType].all.shortName
        let allTemp = lists[tokenType].all

        lists[tokenType].all = merge(
          newTradescrowList("harmony", shortName), allTemp
        )
        sortTokens(lists[tokenType].all.tokens)
    })
    return lists
}

exports.build = build
