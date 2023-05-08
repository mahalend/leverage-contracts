// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import { FlashLoanSimpleReceiverBase } from "@aave/core-v3/contracts/flashloan/base/FlashLoanSimpleReceiverBase.sol";
import { IPoolAddressesProvider } from "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";
import { IPool } from "@aave/core-v3/contracts/interfaces/IPool.sol";
import { IERC20 } from "@aave/core-v3/contracts/dependencies/openzeppelin/contracts/IERC20.sol";

import { ISwapRouter } from "./interfaces/ISwapRouter.sol";
import {ILeverageHelper} from "./interfaces/ILeverageHelper.sol";


import "hardhat/console.sol";

contract SingleAssetETHLong is FlashLoanSimpleReceiverBase {
  address payable owner;
  IPool public mahalend;
  ISwapRouter public swap;

  constructor(
    address _addressProvider,
    address _mahalendAddress,
    address _UniSwapAddress
  ) FlashLoanSimpleReceiverBase(IPoolAddressesProvider(_addressProvider)) {
    owner = payable(msg.sender);
    mahalend = IPool(_mahalendAddress);
    swap = ISwapRouter(_UniSwapAddress);
  }

  function executeOperation(
    address debtAsset, // eth
    uint256 amount, // loan amount 100$ eth
    uint256 premium,
    address initiator,
    bytes calldata params
  ) external override returns (bool) {
    //logic added here
    (address collateralAsset, address user, uint256 amountCollateral, uint256 amountToBorrow) = abi.decode(
      params,
      (address, address, uint256, uint256)
    );

    uint256 amountOwed = amount + premium;

    //supply 100$ eth to mahalend
    mahalend.supply(debtAsset, amount, user, 0);

    //borrow 50$ usdc from mahalend
    mahalend.borrow(collateralAsset, amountToBorrow, 2, 0, user);
    
    //swaping 50 usdc borrowed + 50 usdc from user -> 100$ eth
    uint256 swapAmount = amountCollateral + amountToBorrow;
    swap.executeSwapOutMin(collateralAsset, debtAsset, swapAmount, amountOwed, ISwapRouter.ExchangeRoute.UNISWAP_V3, params);

    // then repay the loan with the below code.
    IERC20(debtAsset).approve(address(POOL), amountOwed);

    return true;
  }

  function requestETHLong(
    address _debtAsset, // eth
    uint256 _amountDebt, // 100$
    address _collateralAsset,  // usdc
    uint256 _amountCollateral, // 50$
    uint256 _amountToBorrow, //50 usdc
    address _userAddress
  ) public {
    address receiverAddress = address(this);
    address asset = _debtAsset;
    uint256 amountCollateral = _amountCollateral;
    uint256 loanAmount = _amountDebt;
    uint16 referralCode = 0;

   

    bytes memory params = abi.encode(_collateralAsset, _userAddress, amountCollateral, _amountToBorrow);

    IERC20(_collateralAsset).transferFrom(
            msg.sender,
            address(this),
            amountCollateral
        );

    // take flashloan of the debt
    POOL.flashLoanSimple(receiverAddress, asset, loanAmount, params, referralCode);

    // send the profits to the caller to be done.
    IERC20(asset).transfer(
      _userAddress,
      IERC20(asset).balanceOf(address(this))
    );
  }

  function getBalance(address _tokenAddress) external view returns (uint256) {
    return IERC20(_tokenAddress).balanceOf(address(this));
  }
}
