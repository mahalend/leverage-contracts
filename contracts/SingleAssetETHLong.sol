// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import { FlashLoanSimpleReceiverBase } from "@aave/core-v3/contracts/flashloan/base/FlashLoanSimpleReceiverBase.sol";
import { IPoolAddressesProvider } from "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";
import { IPool } from "@aave/core-v3/contracts/interfaces/IPool.sol";
import { IERC20 } from "@aave/core-v3/contracts/dependencies/openzeppelin/contracts/IERC20.sol";

import { ISwapRouter } from "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import {ILeverageHelper} from "./interfaces/ILeverageHelper.sol";

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
    address debtAsset,
    uint256 amount,
    uint256 premium,
    address initiator,
    bytes calldata params
  ) external override returns (bool) {
    //logic added here
    (address collateralAsset,
    address user, 
    uint256 amountToBorrow,
    uint24 fee,
    uint positionFlag
    ) = abi.decode(
      params,
      (address, address, uint256, uint24, uint)
    );

    uint256 amountOwed = amount + premium;
    address _mWETH = 0x67C38e607e75002Cea9abec642B954f27204dda5;

    //approve to the mahalend contract
    IERC20(debtAsset).approve(address(mahalend), type(uint256).max);

    //if flag is 0 then it's open position else it is close position
    if(positionFlag == 0){
        
    //supply 0.1 weth to mahalend
    mahalend.supply(debtAsset, amount, user, 0);

    //borrow 0.5 usdc from mahalend
    mahalend.borrow(collateralAsset, amountToBorrow, 2, 0, user);

    //approve to the swap func
    IERC20(collateralAsset).approve(address(swap), type(uint256).max);

    ISwapRouter.ExactOutputSingleParams memory swapParams = ISwapRouter.ExactOutputSingleParams({
      tokenIn: collateralAsset,
      tokenOut: debtAsset,
      fee: fee,
      recipient: address(this),
      deadline: block.timestamp,
      amountOut:amountOwed,
      amountInMaximum: IERC20(collateralAsset).balanceOf(address(this)),
      sqrtPriceLimitX96: 0
    });
    
    swap.exactOutputSingle(swapParams);

    // then repay the loan with the below code.
    IERC20(debtAsset).approve(address(POOL), amountOwed);

    } else {
    
    // 2. repay USDC debt
    mahalend.repay(debtAsset, amount,2, user);


    IERC20(_mWETH).transferFrom(
      user,
      address(this),
      amountToWithdraw
    );
    
// 3. withdraw WETH collateral
    mahalend.withdraw(collateralAsset, amountToWithdraw, address(this));

    //approve to the swap func
    IERC20(collateralAsset).approve(address(swap), type(uint256).max);

// 4. sell WETH for USDC = 100%
    ISwapRouter.ExactOutputSingleParams memory swapParams = ISwapRouter.ExactOutputSingleParams({
      tokenIn: collateralAsset,
      tokenOut: debtAsset,
      fee: fee,
      recipient: address(this),
      deadline: block.timestamp,
      amountOut:amountOwed,
      amountInMaximum: IERC20(collateralAsset).balanceOf(address(this)),
      sqrtPriceLimitX96: 0
    });
    
    swap.exactOutputSingle(swapParams);

// 5. repay USDC flashloan
    IERC20(debtAsset).approve(address(POOL), amountOwed);

    }

    return true;
  }

  function requestOpenETHLong(
    address _debtAsset,
    uint256 _amountDebt,
    address _collateralAsset,
    uint256 _amountCollateral,
    uint256 _amountToBorrow,
    address _userAddress,
    uint24 _fee
  ) public {
    address receiverAddress = address(this);
    address asset = _debtAsset;
    uint256 amountCollateral = _amountCollateral;
    uint256 loanAmount = _amountDebt;
    uint16 referralCode = 0;
    uint positionFlag = 0;

    bytes memory params = abi.encode(_collateralAsset, _userAddress, _amountToBorrow, _fee, positionFlag);

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

   function requestCloseETHLong(
    address _closingDebtAsset, //usdc as debt
    address _collateralAsset, // weth as collateral
    uint256 _amountToWithdraw,
    address _userAddress,
    uint24 _fee
  ) public {
    address receiverAddress = address(this);
    address asset = _closingDebtAsset;
    address variableDebt = 0x571BeFd7972A4fc8804D493fFEc2183370ad2696;
    uint256 loanAmount = IERC20(variableDebt).balanceOf(msg.sender);
    uint16 referralCode = 0;
    uint positionFlag = 1;

    bytes memory params = abi.encode(_collateralAsset, _userAddress, _amountToWithdraw, _fee, positionFlag);

// 1. flashloan USDC = USDC in debt
    POOL.flashLoanSimple(receiverAddress, asset, loanAmount, params, referralCode);

// 6. send remaining USDC to the user
    IERC20(asset).transfer(
      _userAddress,
      IERC20(asset).balanceOf(address(this))
    );
  }
}
