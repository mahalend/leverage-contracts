import { ethers } from "hardhat";
import mahaLendJson from './abi/mahalendDebt.json';
import rewardContractJson from './abi/rewardContract.json';

import { encodeCloseClaimPositionHelper, encodeFunctionHelper } from "../test/EncodeFunctionHelper";
import { BigNumber } from "ethers";
import { SingleAssetETHLong } from "../typechain-types";
import * as helpers from "@nomicfoundation/hardhat-network-helpers";
import { formatToBN } from "../test/utils";


const elvin = "0x9790C67E6062ce2965517E636377B954FA2d1afA";


async function main() {

    await executeCreateKernalAccount();
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

async function executeCreateKernalAccount() {
    const mahalendContract = new ethers.Contract("0x571befd7972a4fc8804d493ffec2183370ad2696", mahaLendJson)
    const rewardContract = new ethers.Contract("0x6BD21E06274EBb92eEa5f9EB794914bAcfF0491F", rewardContractJson)
    const elvinSigner = await ethers.getSigner(elvin);
    const kernelFactory = await ethers.getContractAt('KernelFactory', '0x842e8915613560Db4113d952038090b088f0fC05')
    const ELContract = await ethers.getContractAt('SingleAssetETHLong', '0xBf3076D16Dbf13605e622FC7b52ec47f6C0E3f05')

    await kernelFactory.connect(elvinSigner).createAccount(elvinSigner.getAddress(), 0);

    const kernalAccountAddr = await kernelFactory.connect(elvinSigner).getAccountAddress(elvinSigner.getAddress(), 0)

    console.log('kernalAccountAddr', kernalAccountAddr)

    const kernalAaccount = await ethers.getContractAt('Kernel', kernalAccountAddr);
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

    const mWeth = await ethers.getContractAt(
        "@aave/core-v3/contracts/dependencies/openzeppelin/contracts/IERC20.sol:IERC20",
        "0x67C38e607e75002Cea9abec642B954f27204dda5"
    );

    const mUsdc = await ethers.getContractAt(
        "@aave/core-v3/contracts/dependencies/openzeppelin/contracts/IERC20.sol:IERC20",
        "0x571BeFd7972A4fc8804D493fFEc2183370ad2696"
    )

    const mWETHBalance = await mWeth.connect(elvinSigner).balanceOf(elvin);

    await usdc.connect(elvinSigner).approve(kernalAaccount.address, formatToBN(1, 6));

    console.log('open position start');

    const openRes = await encodeFunctionHelper(
        usdc,
        mahalendContract,
        ELContract,
        formatToBN(1, 6),
        formatToBN(2, 18),
        formatToBN(1807, 18),
        kernalAaccount.address,
        elvin
    );
    await kernalAaccount.connect(elvinSigner).executeAndRevertMultiple(openRes.addressArray, openRes.valueArray, openRes.functionDataArray, openRes.operationArray);
    console.log('open position end');

    console.log('close position start');
    const CloseRes = await encodeCloseClaimPositionHelper(
        mWeth,
        weth,
        usdc,
        rewardContract,
        ELContract,
        kernalAaccount,
        mUsdc.address,
        mWETHBalance,
    );

    await kernalAaccount.connect(elvinSigner).executeAndRevertMultiple(CloseRes.addressArray, CloseRes.valueArray, CloseRes.functionDataArray, CloseRes.operationArray);

    console.log('close position end');
}