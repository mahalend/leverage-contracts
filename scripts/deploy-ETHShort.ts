import { ethers, network } from "hardhat";
import * as helpers from "@nomicfoundation/hardhat-network-helpers";


async function main() {
    const ETHShort = await ethers.getContractFactory("SingleAssetETHShort");
    const ethShort = await ETHShort.deploy(
        "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb",//Aave flashloan
        "0x88c6a98430Cc833E168430DaC427e9796C9EC576",//Mahalend
        "0xE592427A0AEce92De3Edee1F18E0157C05861564"// Uniswap router
    )

    await ethShort.deployed();
    console.log("ETHShort contract deployed: ", ethShort.address)
    executeETHShort(ethShort)
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

async function executeETHShort(ESContract: any) {
    console.log(`Deploying to ${network.name}...`);

    const now = 1660780800; // Math.floor(Date.now() / 1000) - 86400 * 7;

    //user
    const elvin = "0x9790C67E6062ce2965517E636377B954FA2d1afA";
    await helpers.impersonateAccount(elvin);
    const elvinSigner = await ethers.getSigner(elvin);
    await helpers.setBalance(elvin, ethers.utils.parseEther('1'))

    //mahalend deployer
    const address = "0xC97F87cE2673C5225843f9df631DDa331cab3286"; // mahalend deployer
    await helpers.impersonateAccount(address);
    const poolAdmin = await ethers.getSigner(address);
    await helpers.setBalance(address, ethers.utils.parseEther('1'))

    //aave pool contract
    const pool = await ethers.getContractAt(
        "@aave/core-v3/contracts/interfaces/IPool.sol:IPool",
        "0x88c6a98430Cc833E168430DaC427e9796C9EC576"
    );

    //usdc token
    const usdc = await ethers.getContractAt(
        "@aave/core-v3/contracts/dependencies/openzeppelin/contracts/IERC20.sol:IERC20",
        "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8"
    );

    //Weth token
    const weth = await ethers.getContractAt(
        "@aave/core-v3/contracts/dependencies/openzeppelin/contracts/IERC20.sol:IERC20",
        "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1"
    );

    const debtToCover = "1000000000000000000";

    //weth to contact approve -> ESContract to pool
    await weth.connect(elvinSigner).approve(ESContract.address, debtToCover)

    await weth.connect(elvinSigner).approve('0x88c6a98430Cc833E168430DaC427e9796C9EC576', debtToCover)


    //Calling the ETHShort Function
    await ESContract.connect(elvinSigner).requestETHShort(
        usdc.address,
        2000000,
        weth.address,
        100000000000000,
        100000000000000,
        elvinSigner.getAddress()
    )
}