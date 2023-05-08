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
    address debtAsset, // weth
    uint256 amount, // loan amount 0.1 weth
    uint256 premium,
    address initiator,
    bytes calldata params
  ) external override returns (bool) {
    //logic added here
    (address collateralAsset, //usdc
    address user, 
    uint256 amountCollateral, //0.5 usdc
    uint256 amountToBorrow //0.5 usdc
    ) = abi.decode(
      params,
      (address, address, uint256, uint256)
    );

    uint256 amountOwed = amount + premium;

    console.log('46');

    //approve to the mahalend contract
    IERC20(debtAsset).approve(address(mahalend), type(uint256).max);
    
    console.log('before supply debtAsset balance', IERC20(debtAsset).balanceOf(address(this)));
    console.log('collateralAsset balance', IERC20(collateralAsset).balanceOf(address(this)));

    console.log('50');
    //supply 0.1 weth to mahalend
    mahalend.supply(debtAsset, amount, user, 0);

    console.log('after supply debtAsset balance', IERC20(debtAsset).balanceOf(address(this)));


    console.log('54');
    //borrow 0.5 usdc from mahalend
    mahalend.borrow(collateralAsset, amountToBorrow, 2, 0, user);

    console.log('58');
    //approve to the swap func
    IERC20(collateralAsset).approve(address(swap), type(uint256).max);
    
    //swaping 50 usdc borrowed + 50 usdc from user -> 100$ eth
    uint256 swapAmount = amountCollateral + amountToBorrow;
    console.log('60');
    swap.executeSwapOutMin(collateralAsset, debtAsset, swapAmount, amountOwed, ISwapRouter.ExchangeRoute.UNISWAP_V3, params);

    console.log('63');
    // then repay the loan with the below code.
    IERC20(debtAsset).approve(address(POOL), amountOwed);

    return true;
  }

  function requestETHLong(
    address _debtAsset, // weth
    uint256 _amountDebt, // 0.1$
    address _collateralAsset,  // usdc
    uint256 _amountCollateral, // 0.5 usdc
    uint256 _amountToBorrow, //0.5 usdc
    address _userAddress
  ) public {
    address receiverAddress = address(this);
    address asset = _debtAsset;
    uint256 amountCollateral = _amountCollateral;
    uint256 loanAmount = _amountDebt;
    uint16 referralCode = 0;

    console.log("collateral address", _collateralAsset);
   

    bytes memory params = abi.encode(_collateralAsset, _userAddress, amountCollateral, _amountToBorrow);

    IERC20(_collateralAsset).transferFrom(
            _userAddress,
            receiverAddress,
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
