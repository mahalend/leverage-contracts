// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import {ILeverageHelper} from "./interfaces/ILeverageHelper.sol";

contract SushiSwapLeverage is ILeverageHelper {
    function openPosition(
        address assetToSupply,
        address assetToLeverage,
        address assetToBorrow,
        uint256 principalAmount,
        uint256 minLeverageAssetExposure
    ) external override {
        // todo
        // take the asset from the user;
        // flashloan the principal asset from mahalend or from aave
        // perform any swaps if necessary
        // supply the asset into sushiswap as a LP token
        // deposit the LP token into mahalend
        // borrow (USDC or ARTH) from mahalend
        // payback the flashloan
        // return any balance back to the user
    }

    function closePosition(
        address assetToReceive,
        address assetToLeverage,
        address assetToRepay,
        uint256 leverageAssetExposure,
        uint256 minPrincipalAmount
    ) external override {
        // todo
        // flashloan the principal asset from mahalend or from aave
        // payback (USDC or ARTH) to mahalend
        // withdraw the LP token from mahalend
        // withdraw the asset into sushiswap as a LP token
        // perform any swaps if necessary
        // payback the flashloan
        // send the assets and the rewards back to the user;
    }

    function position(
        address who,
        address leverageAsset
    )
        external
        view
        returns (
            uint256 leverageAssetExposure,
            uint256 borrowedAmount,
            uint256 healthFactor
        )
    {
        return (0, 0, 0);
    }
}
