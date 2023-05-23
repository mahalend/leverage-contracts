import { ethers } from "hardhat";
import mahaLendJson from '../abi/mahalendDebt.json';
import { KernelFactory, SingleAssetETHLong } from "../../typechain-types";

const elvin = "0x9790C67E6062ce2965517E636377B954FA2d1afA";


async function main() {
    const kernel = await ethers.getContractFactory("Kernel");
    const kernalDeploy = await kernel.deploy(elvin);
    kernalDeploy.deployed();
    console.log("kernal contract deployed: ", kernalDeploy.address)


    const kernelFactory = await ethers.getContractFactory("KernelFactory");
    const KFDeploy = await kernelFactory.deploy(kernalDeploy.address);

    await KFDeploy.deployed();
    console.log("KernalFactory contract deployed: ", KFDeploy.address)

    const ETHLong = await ethers.getContractFactory("SingleAssetETHLong");
    const ethLong = await ETHLong.deploy(
        "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb",//Aave flashloan
        "0x88c6a98430Cc833E168430DaC427e9796C9EC576",//Mahalend
        "0xE592427A0AEce92De3Edee1F18E0157C05861564"// Uniswap router
    )

    await ethLong.deployed();
    console.log("ETHLong contract deployed: ", ethLong.address)

    await executeCreateKernalAccount(KFDeploy, ethLong);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

async function executeCreateKernalAccount(KFContract: KernelFactory, ELContract: SingleAssetETHLong) {
    const mahalendContract = new ethers.Contract("0x571befd7972a4fc8804d493ffec2183370ad2696", mahaLendJson)
    const elvinSigner = await ethers.getSigner(elvin);
    const debtToCover = "999999000000000000000000";

    await KFContract.connect(elvinSigner).createAccount(elvinSigner.getAddress(), 0);

    const kernalAccountAddr = await KFContract.connect(elvinSigner).getAccountAddress(elvinSigner.getAddress(), 0)
    const kernalAaccount = await ethers.getContractAt('Kernel', kernalAccountAddr)

    console.log('Kernel account', await KFContract.connect(elvinSigner).getAccountAddress(elvinSigner.getAddress(), 0))

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

    //passig in array inside a for loop

    await usdc.connect(elvinSigner).approve(kernalAaccount.address, debtToCover);

    //transfer 1 usdc from user account to kernel account
    const usdcTransferFrom = await usdc.interface.encodeFunctionData('transferFrom', [elvin, kernalAaccount.address, 1000000])
    // await kernalAaccount.connect(elvinSigner).executeAndRevert(usdc.address, 0, usdcTransferFrom, 0);

    //usdc approve for mahalend contract
    const usdcMahalendApprove = await usdc.interface.encodeFunctionData('approve', ['0x88c6a98430Cc833E168430DaC427e9796C9EC576', debtToCover])
    // await kernalAaccount.connect(elvinSigner).executeAndRevert(usdc.address, 0, usdcMahalendApprove, 0);

    //usdc approve to ETHLong Contract contract
    const usdcKernalApprove = await usdc.interface.encodeFunctionData('approve', [ELContract.address, debtToCover]);
    // await kernalAaccount.connect(elvinSigner).executeAndRevert(usdc.address, 0, usdcKernalApprove, 0);

    //Mahalend delegation approval to Kernal contract
    const mahalendKernelDelApprove = await mahalendContract.interface.encodeFunctionData('approveDelegation', [ELContract.address, debtToCover]);
    // await kernalAaccount.connect(elvinSigner).executeAndRevert(mahalendContract.address, 0, mahalendKernelDelApprove, 0)


    // deposit 1 usdc
    // leverage 2x
    // weth price 1800$
    // 
    // flashloan 2$ of weth -> 0.00111 weth
    // deposit 2$ of weth
    // borrow 1.1 usdc
    // swap 2.1 usdc for 2$ eth
    // payback 2$ eth

    //closing flow
    //flashloan 1.1 usdc 
    //repay 1.1 usdc to mahalend
    // withdraw 2$ of weth
    // swap 2$ weth for usdc
    //payback flashloan for usdc
    //return 0.9 usdc
    const requestELKernel = await ELContract.interface.encodeFunctionData('requestETHLong', [weth.address, 1110000000000000, usdc.address, 1000000, 1100000, kernalAaccount.address, 500]);
    // await kernalAaccount.connect(elvinSigner).executeAndRevert(ELContract.address, 0, requestELKernel, 0)


    const addressArray = [usdc.address, usdc.address, usdc.address, mahalendContract.address, ELContract.address];
    const valueArray = [0, 0, 0, 0, 0];
    const functionDataArray = [usdcTransferFrom, usdcMahalendApprove, usdcKernalApprove, mahalendKernelDelApprove, requestELKernel];
    const operationArray = [0, 0, 0, 0, 0];

    await kernalAaccount.connect(elvinSigner).executeAndRevertMultiple(addressArray, valueArray, functionDataArray, operationArray)
}