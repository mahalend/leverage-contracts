import { ethers, network } from "hardhat";
import * as helpers from "@nomicfoundation/hardhat-network-helpers";
import mahaLendJson from './abi/mahalendDebt.json';

async function main() {
    const ETHLong = await ethers.getContractFactory("SingleAssetETHLong");
    const ethLong = await ETHLong.deploy(
        "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb",//Aave flashloan
        "0x88c6a98430Cc833E168430DaC427e9796C9EC576",//Mahalend
        "0xE592427A0AEce92De3Edee1F18E0157C05861564"// Uniswap router
    )

    await ethLong.deployed();
    console.log("ETHLong contract deployed: ", ethLong.address)
    executeETHLong(ethLong);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

async function executeETHLong(ELContract: any) {
    const contract = new ethers.Contract("0x571befd7972a4fc8804d493ffec2183370ad2696", mahaLendJson)
    console.log(`Deploying to ${network.name}...`);

    //user
    const elvin = "0x9790C67E6062ce2965517E636377B954FA2d1afA";
    const elvinSigner = await ethers.getSigner(elvin);

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

    const debtToCover = "500000000000000000";

    //approve for the borrow function
    await usdc.connect(elvinSigner).approve('0x88c6a98430Cc833E168430DaC427e9796C9EC576', debtToCover)

    //usdc to contact approve -> ELContract to pool
    await usdc.connect(elvinSigner).approve(ELContract.address, debtToCover)

    //delegation approval to contract
    await contract.connect(elvinSigner).approveDelegation(ELContract.address, "999999000000000000000000")


    console.log('ETHLong func')
    //Calling the ETHLong Function
    await ELContract.connect(elvinSigner).requestETHLong(
        weth.address,
        1000000000000000,
        usdc.address,
        500000,
        1400000,
        elvinSigner.getAddress(),
        500
    )
}