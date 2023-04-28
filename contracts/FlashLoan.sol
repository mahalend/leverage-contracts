// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.10;

import {FlashLoanSimpleReceiverBase} from "@aave/core-v3/contracts/flashloan/base/FlashLoanSimpleReceiverBase.sol";
import {IPoolAddressesProvider} from "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";
import {IERC20} from "@aave/core-v3/contracts/dependencies/openzeppelin/contracts/IERC20.sol";
import {IStableSwap} from "./interfaces/IStableSwap.sol";
import {IPool} from "@aave/core-v3/contracts/interfaces/IPool.sol";

contract FlashLoan is FlashLoanSimpleReceiverBase {
    IPool public mahalend;

    constructor(
        address _addressProvider,
        address _mahalendAddress
    ) FlashLoanSimpleReceiverBase(IPoolAddressesProvider(_addressProvider)) {
        mahalend = IPool(_mahalendAddress);
    }

    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address,
        bytes calldata params
    ) external override returns (bool) {
        (address who, uint256 ltv) = abi.decode(params, (address, uint256));

        // we have the borrowed funds
        // approve pool
        IERC20(asset).approve(address(mahalend), amount);

        // supply the asset to mahalend
        mahalend.supply(asset, amount, who, 0);

        // calculate how much to borrow of that same asset
        uint256 borrowAmount = (amount * ltv) / 100;

        // borrow the amount
        mahalend.borrow(asset, borrowAmount + premium, 2, 0, who);

        // repay the flashloan
        IERC20(asset).approve(address(POOL), amount + premium);
        return true;
    }

    function flasloanOpen(
        address supplyToken,
        uint256 amount,
        uint256 ltv,
        uint256 leverage
    ) public {
        IERC20(supplyToken).transferFrom(msg.sender, address(this), amount);

        // execute fhe flashloan
        uint256 leveragedAmount = amount * leverage;
        bytes memory params = abi.encode(msg.sender, ltv);
        POOL.flashLoanSimple(
            address(this),
            supplyToken,
            leveragedAmount,
            params,
            0
        );

        // refund any dush
        uint256 bal = IERC20(supplyToken).balanceOf(address(this));
        IERC20(supplyToken).transfer(msg.sender, bal);
    }
}
