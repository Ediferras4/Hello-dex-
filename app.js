import { ethers } from "./ethers.min.js";

// Endereços
const HELLO_ADDRESS = "0xa0E8D663b7AeEcc4A820fC126b4B63d1FA96917F";
const USDC_ADDRESS  = "0x3600000000000000000000000000000000000000";
const DEX_ADDRESS   = "0x520998855De56a6293C30F9c9857f37C3baCaC99";

// ABIs mínimos
const ERC20_ABI = [
    "function balanceOf(address) view returns (uint256)",
    "function allowance(address,address) view returns (uint256)",
    "function approve(address,uint256) returns (bool)",
    "function decimals() view returns (uint8)"
];

const DEX_ABI = [
    "function swap(address tokenIn, uint256 amountIn) returns (uint256)"
];

// Provider + signer
let provider;
let signer;

// Conectar carteira
window.connectWallet = async () => {
    if (!window.ethereum) return alert("Instale uma carteira!");

    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();

    let addr = await signer.getAddress();
    document.getElementById("walletBtn").innerText = addr.slice(0, 6) + "..." + addr.slice(-4);
};

// Função para fazer swap
window.swapTokens = async () => {
    if (!signer) return alert("Conecte a carteira!");

    const tokenIn = document.getElementById("tokenSelect").value;
    const amountIn = document.getElementById("amountIn").value;

    const token = new ethers.Contract(tokenIn, ERC20_ABI, signer);
    const dex = new ethers.Contract(DEX_ADDRESS, DEX_ABI, signer);

    const decimals = await token.decimals();
    const amountParsed = ethers.parseUnits(amountIn, decimals);

    // Aprovar primeiro
    const allowance = await token.allowance(await signer.getAddress(), DEX_ADDRESS);
    if (allowance < amountParsed) {
        let tx = await token.approve(DEX_ADDRESS, amountParsed);
        await tx.wait();
    }

    // Swap
    let tx = await dex.swap(tokenIn, amountParsed);
    await tx.wait();

    alert("Swap realizado!");
};
