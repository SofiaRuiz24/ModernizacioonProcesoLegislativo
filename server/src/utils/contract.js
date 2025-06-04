const { ethers } = require("ethers");
const contractJson = require("../VotacionLegislatura.json")

// Configura el provider de Sepolia
const provider = new ethers.JsonRpcProvider("https://mainnet.infura.io/v3/3220585a54f247cda8702381952e2e3d");

// Si solo vas a leer, no necesitas wallet. Si vas a escribir, necesitas la private key del admin (NO la de los usuarios/metamask)
const wallet = new ethers.Wallet("3220585a54f247cda8702381952e2e3d", provider);

// Dirección del contrato desplegado en Sepolia
const contractAddress = "0xc1948ec53e467577eb5a86701c1d8b916535ac84"; // Pega aquí la dirección del contrato desplegado

// Instancia del contrato
const contract = new ethers.Contract(contractAddress, contractJson.abi, wallet);

module.exports = contract;
