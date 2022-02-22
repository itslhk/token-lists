const buildLists = require('./buildLists');
const arg = process.argv[2]
console.log(JSON.stringify(buildLists[`build_${arg}_list`](), null, 2));