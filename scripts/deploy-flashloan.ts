import { ethers } from "hardhat";
import * as helpers from "@nomicfoundation/hardhat-network-helpers";
import { BigNumber } from "@ethersproject/bignumber";
import { variableContract } from "./mahalendDelegate";
async function main() {
  const FlashLoan = await ethers.getContractFactory("FlashLoan");
  // const flashLoan = await FlashLoan.deploy(
  //   "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb", //flash loan
  //   "0x88c6a98430cc833e168430dac427e9796c9ec576" //mahalend pool
  // );

  // await flashLoan.deployed();
  // console.log("FlashLoan contract deployed : ", flashLoan.address);
  await executeFlashLoan("0x4a22d8deB38f232aB2f5AAb148B3A9b5B57BFe7E");
}

const executeFlashLoan = async (contract: any) => {
  const aniketh = "0x84327eD014908C3100A11F98b4Ec171557fA5F07";
  await helpers.impersonateAccount(aniketh);
  const anikethSigner = await ethers.getSigner(aniketh);
  await helpers.setBalance(aniketh, ethers.utils.parseEther("1"));

  // const usdt = await ethers.getContractAt(
  //   "IERC20",
  //   "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9"
  // );

  const usdc = await ethers.getContractAt(
    "IERC20",
    "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8"
  );

  const debtToCover = "1000000";
  console.log(34);

  //usdt to contact approve -> FLContract to pool
  await usdc.connect(anikethSigner).approve(contract, "100000000000000");
  await usdc.connect(anikethSigner).transfer(contract, 100000);
  //Uniswap Swap function call
  // console.log(
  //   "before usdt balance",
  //   (await usdt.balanceOf(contract.address)).toString()
  // );

  /// approve delegate  contract address and infinity amount  ///0x571BeFd7972A4fc8804D493fFEc2183370ad2696
  // const infinity = BigNumber.from(
  //   "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
  // );
  console.log(49);

  await variableContract.approveDelegation(
    contract,
    ethers.utils.parseEther("1000000000000").toString()
  );
  console.log(55);

  //   await contract
  //     .connect(anikethSigner)
  //     .requestFlashLoan(usdc.address, debtToCover);
};

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb", //flash loan
("0x88c6a98430cc833e168430dac427e9796c9ec576");
