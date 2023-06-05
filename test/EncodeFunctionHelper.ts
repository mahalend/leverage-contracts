import { BigNumber, Contract } from 'ethers';

export async function encodeFunctionHelper(
    usdcContract: Contract,
    mahalendContract: Contract,
    ELContract: Contract,
    depositAmount: BigNumber,
    leverageValue: BigNumber,
    ethPrice: BigNumber,
    leverageAccount: string,
    walletAddress: string
) {
    const executeLeverage = await calculateLeverage(depositAmount, leverageValue, ethPrice);

    console.log(executeLeverage.ethExposureConverted.toString(), executeLeverage.usdcBorrow.toString());

    const usdcTransferFrom = await usdcContract.interface.encodeFunctionData('transferFrom', [walletAddress, leverageAccount, depositAmount])

    const usdcMahalendApprove =
        await usdcContract.interface.encodeFunctionData('approve', [mahalendContract.address, depositAmount])

    const usdcKernalApprove =
        await usdcContract.interface.encodeFunctionData(
            'approve', [ELContract.address, depositAmount]
        );

    const mahalendKernelDelApprove =
        await mahalendContract.interface.encodeFunctionData(
            'approveDelegation', [ELContract.address, depositAmount]
        );

    const requestELKernel =
        await ELContract.interface.encodeFunctionData(
            'requestOpenETHLong',
            [
                '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
                executeLeverage.ethExposureConverted,
                usdcContract.address,
                depositAmount,
                executeLeverage.usdcBorrow,
            ]
        );


    const addressArray = [usdcContract.address, usdcContract.address, usdcContract.address, mahalendContract.address, ELContract.address];
    const valueArray = [0, 0, 0, 0, 0];
    const functionDataArray = [usdcTransferFrom, usdcMahalendApprove, usdcKernalApprove, mahalendKernelDelApprove, requestELKernel];
    const operationArray = [0, 0, 0, 0, 0];

    return { addressArray, valueArray, functionDataArray, operationArray }
}

export async function calculateLeverage(_depositAmount: BigNumber, _leverageValue: BigNumber, _ethPrice: BigNumber) {
    const divValue = BigNumber.from(100);
    const onevalue = BigNumber.from(1);
    const pow18 = BigNumber.from(10).pow(18);
    const pow6 = BigNumber.from(10).pow(6);
    const usdcConvert = BigNumber.from(10).pow(12);

    let depositAmount = _depositAmount.div(pow6);
    let leverageValue = _leverageValue.div(pow18);
    let ethPrice = _ethPrice.div(pow18);

    //calculate eth exposure in usdc terms
    let ethExposure = depositAmount.mul(leverageValue);

    //convert ethExposure in eth terms
    let ethExposureConverted = ethExposure.mul(pow18).div(ethPrice); //ethPrice

    //gets the borrow percentage from the formula
    let borrowPert = ((leverageValue.sub(onevalue)).mul(pow18).div(leverageValue)).mul(divValue);

    //amount of usdc to borrow using percentage of eth given
    let usdcBorrow = ((borrowPert.div(divValue)).mul(ethExposure)).div(usdcConvert);

    return { ethExposureConverted, usdcBorrow };

}

export async function encodeClosePositionHelper(
    mWethContract: Contract, //0x67C38e607e75002Cea9abec642B954f27204dda5
    wethContract: Contract,
    usdcContract: Contract,
    ELContract: Contract,
    variableDebtTokenAddress: string, //variableDebtmArbUSDC - 0x571BeFd7972A4fc8804D493fFEc2183370ad2696
    stableDebtTokenAddress: BigNumber //mWETH balance
) {
    const mWethKernelApprove = await mWethContract.interface.encodeFunctionData('approve', [ELContract.address, stableDebtTokenAddress]);

    const requestClosePosition = await ELContract.interface.encodeFunctionData('requestCloseETHLong', [usdcContract.address, wethContract.address, stableDebtTokenAddress, variableDebtTokenAddress, mWethContract.address]);

    const addressArray = [mWethContract.address, ELContract.address];
    const valueArray = [0, 0, 0, 0, 0];
    const functionDataArray = [mWethKernelApprove, requestClosePosition];
    const operationArray = [0, 0, 0, 0, 0];

    return { addressArray, valueArray, functionDataArray, operationArray }
}