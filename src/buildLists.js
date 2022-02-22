const { version } = require("../package.json");
const dfk_harmony_mainnet = require("./tokens/dfk-harmony-mainnet.json");
const default_harmony_mainnet = require("./tokens/default-harmony-mainnet.json");

function buildBase(list_name, logoURI, keywords, token_list) {
    const parsed = version.split(".");
    return {
        name: `Tradescrow ${list_name}`,
        timestamp: new Date().toISOString(),
        version: {
            major: +parsed[0],
            minor: +parsed[1],
            patch: +parsed[2],
        },
        tags: {},
        logoURI: logoURI,
        keywords: keywords,
        tokens: token_list
            .sort((t1, t2) => {
                if (t1.chainId === t2.chainId) {
                    return t1.symbol.toLowerCase() < t2.symbol.toLowerCase() ? -1 : 1;
                }
                return t1.chainId < t2.chainId ? -1 : 1;
            }),
    };
}

function build_default_list() {
    let name = "Default"
    let logoURI = "https://upload.wikimedia.org/wikipedia/commons/3/33/White_square_with_question_mark.png"
    let keywords = ["tradescrow", "default"]
    return buildBase(name, logoURI, keywords, default_harmony_mainnet)
}

function build_dfk_list() {
    let name = "DFK"
    let logoURI = "https://firebasestorage.googleapis.com/v0/b/defi-kingdoms.appspot.com/o/tokens%2FJEWEL.png?alt=media&token=729d388d-1013-4bed-a194-77ba8e53e79d"
    let keywords = ["dfk", "tradescrow", "approved"]
    return buildBase(name, logoURI, keywords, dfk_harmony_mainnet)
}

module.exports = {
    buildBase,
    build_default_list,
    build_dfk_list
}
