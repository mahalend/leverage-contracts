import hre, { ethers } from "hardhat";
import * as helpers from "@nomicfoundation/hardhat-network-helpers";

const usdcAddr = "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8";
const variableContractAddr = "0x571BeFd7972A4fc8804D493fFEc2183370ad2696";

async function main() {
  const FlashLoan = await ethers.getContractFactory("FlashLoan");
  const contract = await FlashLoan.deploy(
    "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb", // flash loan
    "0x88c6a98430cc833e168430dac427e9796c9ec576" // mahalend pool
  );

  await contract.deployTransaction.wait(1);
  // const contract = await ethers.getContractAt(
  //   "FlashLoan",
  //   "0x2fAA0A64aBcaaB73736706e776C0032Ba26A7713"
  // );

  await hre.run("verify:verify", {
    address: contract.address,
    constructorArguments: [
      "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb", // flash loan
      "0x88c6a98430cc833e168430dac427e9796c9ec576", // mahalend pool
    ],
  });

  const [deployer] = await ethers.getSigners();

  const usdc = await ethers.getContractAt("IERC20", usdcAddr);

  const debtToCover = "1000";

  //usdt to contact approve -> FLContract to pool
  await usdc.connect(deployer).approve(contract.address, "100000000000000");

  const variableContract = await ethers.getContractAt(
    "VariableDebtToken",
    variableContractAddr
  );

  await variableContract
    .connect(deployer)
    .approveDelegation(
      contract.address,
      ethers.utils.parseEther("1000000000000").toString()
    );

  await contract
    .connect(deployer)
    .flasloanOpen(usdc.address, debtToCover, 95, 20);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
