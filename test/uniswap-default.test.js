const packageJson = require('../package.json')
const tokenSchema = require('@uniswap/token-lists/src/tokenlist.schema.json')
const nftSchema = require('../schemas/nftlist.schema.json')
const { expect } = require('chai')
const { ethers } = require('ethers')
const { getAddress } = require('@ethersproject/address')
const Ajv = require('ajv')
const { build } = require('../scripts/build')

const ajv = new Ajv({ allErrors: true, format: 'full' })
const tokenValidator = ajv.compile(tokenSchema);
const nftValidator = ajv.compile(nftSchema);

const lists = build()

const miniABI = [
    "function name() returns (string memory)",
    "function symbol() returns (string memory)",
    "function decimals() returns (uint8)"
]

const jsonRPCProvider = new ethers.providers.JsonRpcProvider("https://rpc.cosmicuniverse.one", {name: "Harmony", chainId: 1666600000})

Object.entries(lists).forEach(([tokenType, list]) => {
    let validator = tokenType === "tokens" ? tokenValidator : nftValidator
    Object.entries(list).forEach(([shortName, tokenList]) => {
        describe(`${shortName} (${tokenType.replace("s", "")})`, () => {
            const defaultTokenList = tokenList

            it('validates', () => {
                expect(validator(defaultTokenList)).to.equal(true);
            });
            it('contains no duplicate addresses', () => {
                const map = {};
                for (let token of defaultTokenList.tokens) {
                    const key = `${token.chainId}-${token.address}`;
                    expect(typeof map[ key ])
                      .to.equal('undefined');
                    map[ key ] = true;
                }
            });
            it('contains no duplicate symbols', () => {
                const map = {};
                for (let token of defaultTokenList.tokens) {
                    const key = `${token.chainId}-${token.symbol.toLowerCase()}`;
                    expect(typeof map[ key ])
                      .to.equal('undefined');
                    map[ key ] = true;
                }
            })
            it('contains no duplicate names', () => {
                const map = {};
                for (let token of defaultTokenList.tokens) {
                    const key = `${token.chainId}-${token.name.toLowerCase()}`;
                    expect(typeof map[ key ])
                      .to.equal('undefined', `duplicate name: ${token.name}`);
                    map[ key ] = true;
                }
            })
            it('all addresses are valid and checksummed', () => {
                for (let token of defaultTokenList.tokens) {
                    expect(getAddress(token.address)).to.eq(token.address);
                }
            });
            it('version matches package.json', () => {
                expect(packageJson.version).to.match(/^\d+\.\d+\.\d+$/);
                expect(packageJson.version).to.equal(`${defaultTokenList.version.major}.${defaultTokenList.version.minor}.${defaultTokenList.version.patch}`);
            });
            it( 'metadata matches', () => {
                for (let token of defaultTokenList.tokens) {
                    const contract = new ethers.Contract(token.address, miniABI, jsonRPCProvider)
                    contract.name().then(name => expect(name).to.eq(token.name))
                    contract.symbol().then(symbol => expect(symbol).to.eq(token.symbol))
                    if (tokenType === "tokens") {
                        contract.decimals().then(decimals => expect(decimals).to.eq(token.decimals))
                    }
                }
            })
        });
    })
})
