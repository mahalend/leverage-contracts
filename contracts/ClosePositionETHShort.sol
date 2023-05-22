// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import { FlashLoanSimpleReceiverBase } from "@aave/core-v3/contracts/flashloan/base/FlashLoanSimpleReceiverBase.sol";
import { IPoolAddressesProvider } from "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";
import { IPool } from "@aave/core-v3/contracts/interfaces/IPool.sol";
import { IERC20 } from "@aave/core-v3/contracts/dependencies/openzeppelin/contracts/IERC20.sol";

import { ISwapRouter } from "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import {ILeverageHelper} from "./interfaces/ILeverageHelper.sol";

contract ClosePositionETHShort is FlashLoanSimpleReceiverBase {
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
    uint24 fee
    ) = abi.decode(
      params,
      (address, address, uint256, uint24)
    );

    uint256 amountOwed = amount + premium;

    IERC20(debtAsset).approve(address(mahalend), type(uint256).max);

    
    // 2. payback WETH debt
    mahalend.supply(debtAsset, amount, user, 0);

    
// 3. withdraw USDC collateral
    mahalend.borrow(collateralAsset, amountToBorrow, 2, 0, user);

    //approve to the swap func
    IERC20(collateralAsset).approve(address(swap), type(uint256).max);
    IERC20(debtAsset).approve(address(swap), type(uint256).max);

// 4. sell USDC for WETH = 100%
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

    
// 5. repay WETH flashloan
    IERC20(debtAsset).approve(address(POOL), amountOwed);

    return true;
  }

  function requestClosingETHShort(
    address _closeDebtAsset, //weth
    uint256 _closeAmountDebt,  
    address _collateralAsset,// usdc
    uint256 _amountCollateral,
    uint256 _amountToBorrow,
    address _userAddress,
    uint24 _fee
  ) public {
    address receiverAddress = address(this);
    address asset = _closeDebtAsset;
    uint256 amountCollateral = _amountCollateral;
    uint256 loanAmount = _closeAmountDebt;
    uint16 referralCode = 0;   

    bytes memory params = abi.encode(_collateralAsset, _userAddress, _amountToBorrow, _fee);

    IERC20(_collateralAsset).transferFrom(
            _userAddress,
            receiverAddress,
            amountCollateral
        );

// 1. flashloan WETH = WETH in debt
    POOL.flashLoanSimple(receiverAddress, asset, loanAmount, params, referralCode);

// 6. send remaining WETH to the user
    IERC20(asset).transfer(
      _userAddress,
      IERC20(asset).balanceOf(address(this))
    );
  }

  function getBalance(address _tokenAddress) external view returns (uint256) {
    return IERC20(_tokenAddress).balanceOf(address(this));
  }
}
