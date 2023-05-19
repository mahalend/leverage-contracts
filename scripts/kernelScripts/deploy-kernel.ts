import { ethers } from "hardhat";

const elvin = "0x9790C67E6062ce2965517E636377B954FA2d1afA";


async function main() {
    const kernel = await ethers.getContractFactory("Kernel");
    const kernalDeploy = await kernel.deploy(elvin);
    kernalDeploy.deployed();
    console.log("kernal contract deployed: ", kernalDeploy.address)
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});