import { ethers } from "hardhat";
import mahaLendJson from './abi/mahalendDebt.json';
import { KernelFactory, SingleAssetETHLong, ClosePositionETHLong } from "../typechain-types";

const elvin = "0x9790C67E6062ce2965517E636377B954FA2d1afA";


async function main() {
    // const kernel = await ethers.getContractFactory("Kernel");
    // const kernalDeploy = await kernel.deploy(elvin);
    // kernalDeploy.deployed();
    // console.log("kernal contract deployed: ", kernalDeploy.address)


    // const kernelFactory = await ethers.getContractFactory("KernelFactory");
    // const KFDeploy = await kernelFactory.deploy(kernalDeploy.address);

    // await KFDeploy.deployed();
    // console.log("KernalFactory contract deployed: ", KFDeploy.address)

    // const ETHLong = await ethers.getContractFactory("SingleAssetETHLong");
    // const ethLong = await ETHLong.deploy(
    //     "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb",//Aave flashloan
    //     "0x88c6a98430Cc833E168430DaC427e9796C9EC576",//Mahalend
    //     "0xE592427A0AEce92De3Edee1F18E0157C05861564"// Uniswap router
    // )

    // await ethLong.deployed();
    // console.log("ETHLong contract deployed: ", ethLong.address)

    const closePosition = await ethers.getContractFactory("ClosePositionETHLong");
    const closeETHLong = await closePosition.deploy(
        "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb",//Aave flashloan
        "0x88c6a98430Cc833E168430DaC427e9796C9EC576",//Mahalend
        "0xE592427A0AEce92De3Edee1F18E0157C05861564"// Uniswap router
    )

    await closeETHLong.deployed();
    console.log("ClosePositionETHLong contract deployed: ", closeETHLong.address)

    await executeCreateKernalAccount(closeETHLong);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

async function executeCreateKernalAccount(closeELContract: ClosePositionETHLong) {
    const mahalendContract = new ethers.Contract("0x571befd7972a4fc8804d493ffec2183370ad2696", mahaLendJson)
    const elvinSigner = await ethers.getSigner(elvin);
    const debtToCover = "999999000000000000000000";

    // await KFContract.connect(elvinSigner).createAccount(elvinSigner.getAddress(), 0);

    // const kernalAccountAddr = await KFContract.connect(elvinSigner).getAccountAddress(elvinSigner.getAddress(), 0)
    // const kernalAaccount = await ethers.getContractAt('Kernel', kernalAccountAddr)
    const kernalAaccount = await ethers.getContractAt('Kernel', '0x14f92ED2B3860e282Bb60b6D7cA58937f309517c')


    // console.log('Kernel account', await KFContract.connect(elvinSigner).getAccountAddress(elvinSigner.getAddress(), 0))

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
    )


    // //open position flow start

    // console.log('open position flow start');

    // await usdc.connect(elvinSigner).approve(kernalAaccount.address, debtToCover);

    // const usdcTransferFrom = await usdc.interface.encodeFunctionData('transferFrom', [elvin, kernalAaccount.address, 1000000])

    // const usdcMahalendApprove = await usdc.interface.encodeFunctionData('approve', ['0x88c6a98430Cc833E168430DaC427e9796C9EC576', debtToCover])

    // const usdcKernalApprove = await usdc.interface.encodeFunctionData('approve', [ELContract.address, debtToCover]);

    // const mahalendKernelDelApprove = await mahalendContract.interface.encodeFunctionData('approveDelegation', [ELContract.address, debtToCover]);

    // const requestELKernel = await ELContract.interface.encodeFunctionData('requestETHLong', [weth.address, 1110000000000000, usdc.address, 1000000, 1100000, kernalAaccount.address, 500]);

    // const addressArray = [usdc.address, usdc.address, usdc.address, mahalendContract.address, ELContract.address];
    // const valueArray = [0, 0, 0, 0, 0];
    // const functionDataArray = [usdcTransferFrom, usdcMahalendApprove, usdcKernalApprove, mahalendKernelDelApprove, requestELKernel];
    // const operationArray = [0, 0, 0, 0, 0];

    // await kernalAaccount.connect(elvinSigner).executeAndRevertMultiple(addressArray, valueArray, functionDataArray, operationArray)

    // await kernalAaccount.connect(elvinSigner).flushERC20(usdc.address, await elvinSigner.getAddress());

    // console.log('open position flow end');

    // //open position flow end

    //close position flow start
    console.log('close position flow start');

    const musdcKernalApprove = await mWeth.interface.encodeFunctionData('approve', [closeELContract.address, debtToCover]);

    await kernalAaccount.connect(elvinSigner).executeAndRevert(mWeth.address, 0, musdcKernalApprove, 0);


    const requestClosePosition = await closeELContract.interface.encodeFunctionData('requestCloseETHLong', [usdc.address, weth.address, 1110000000000000, kernalAaccount.address, 500]);

    await kernalAaccount.connect(elvinSigner).executeAndRevert(closeELContract.address, 0, requestClosePosition, 0);

    // await kernalAaccount.connect(elvinSigner).flushERC20(weth.address, await elvinSigner.getAddress());


    console.log('close position flow end');
    //close position flow end

}

//closing flow
    //flashloan 1.1 usdc
    //repay 1.1 usdc to mahalend
    // withdraw 2$ of weth
    // swap 2$ weth for usdc
    //payback flashloan for usdc
    //return 0.9 usdc