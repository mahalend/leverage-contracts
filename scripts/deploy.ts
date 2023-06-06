import { ethers } from "hardhat";

const elvin = "0x9790C67E6062ce2965517E636377B954FA2d1afA";

async function main() {
    // const kernel = await ethers.getContractFactory("Kernel");
    // const kernalDeploy = await kernel.deploy(elvin);
    // kernalDeploy.deployed();
    // console.log("kernal contract deployed: ", kernalDeploy.address)


    const kernelFactory = await ethers.getContractFactory("KernelFactory");
    const KFDeploy = await kernelFactory.deploy('0xc6d57b3107dA5d553d7eD70c00c3D09277e6b4B5');

    await KFDeploy.deployed();
    console.log("KernalFactory contract deployed: ", KFDeploy.address)

    // const ETHLong = await ethers.getContractFactory("SingleAssetETHLong");
    // const ethLong = await ETHLong.deploy(
    //     "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb",//Aave flashloan
    //     "0x88c6a98430Cc833E168430DaC427e9796C9EC576",//Mahalend
    //     "0xE592427A0AEce92De3Edee1F18E0157C05861564"// Uniswap router
    // )

    // await ethLong.deployed();
    // console.log("ETHLong contract deployed: ", ethLong.address)
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});