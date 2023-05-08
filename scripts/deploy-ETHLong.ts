import { ethers } from "hardhat";

async function main() {
    const ETHLong = await ethers.getContractFactory("SingleAssetETHLong");
    const ethLong = await ETHLong.deploy(
        "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb",//Aave flashloan
        "0x88c6a98430Cc833E168430DaC427e9796C9EC576",//Mahalend
        "0xE592427A0AEce92De3Edee1F18E0157C05861564"// Uniswap router
    )

    await ethLong.deployed();
    console.log("ETHLong contract deployed: ", ethLong.address)
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
