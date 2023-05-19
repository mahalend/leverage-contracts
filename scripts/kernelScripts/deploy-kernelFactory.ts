import { ethers } from "hardhat";

const entrypoint = "0xa847673b4e8120CB11820e7CaB28aa5b8c8AA6d5";


async function main() {
    const kernelFactory = await ethers.getContractFactory("KernelFactory");
    const KFDeploy = await kernelFactory.deploy(entrypoint);

    await KFDeploy.deployed();
    console.log("KernalFactory contract deployed: ", KFDeploy.address)
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});