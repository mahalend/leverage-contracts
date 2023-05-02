// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import {ILeverageHelper} from "./interfaces/ILeverageHelper.sol";
import {ISwapRouter} from "./interfaces/ISwapRouter.sol";
import {VersionedInitializable} from "./proxy/VersionedInitializable.sol";
import {IPool} from "@aave/core-v3/contracts/interfaces/IPool.sol";
import {IPoolAddressesProvider} from "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";
import {IERC20} from "@aave/core-v3/contracts/dependencies/openzeppelin/contracts/IERC20.sol";

contract SingleAssetLeverage is ILeverageHelper, VersionedInitializable {
    IPool public mahalend;
    IPoolAddressesProvider public override ADDRESSES_PROVIDER;
    IPool public override POOL;
    ISwapRouter router;

    function initialize(
        IPoolAddressesProvider _addressProvider,
        IPool _mahalendAddress
    ) external initializer {
        ADDRESSES_PROVIDER = _addressProvider;
        POOL = IPool(_addressProvider.getPool());
        mahalend = _mahalendAddress;
    }

    function openPosition(
        address assetToSupply,
        address assetToLeverage,
        address assetToBorrow,
        uint256 principalAmount,
        uint256 minLeverageAssetExposure,
        bytes memory extraParams
    ) external override {
        // todo
        // take the asset from the user;

        IERC20(assetToSupply).transferFrom(
            msg.sender,
            address(this),
            principalAmount
        );

        // perform any swaps if necessary
        if (assetToSupply != assetToLeverage) {
            // router.executeSwapInMax(
            // );
        }

        // flashloan the principal asset from mahalend or from aave
        // supply the asset into sushiswap as a LP token
        // deposit the LP token into mahalend
        // borrow (USDC or ARTH) from mahalend
        // payback the flashloan
        // return any balance back to the user

        // execute fhe flashloan
        bytes memory params = abi.encode(
            0, // 0 -> open position
            msg.sender,
            assetToLeverage,
            assetToBorrow
        );
        POOL.flashLoanSimple(
            address(this),
            assetToSupply,
            minLeverageAssetExposure,
            params,
            0
        );

        // refund any dush
        uint256 bal = IERC20(assetToSupply).balanceOf(address(this));
        IERC20(assetToSupply).transfer(msg.sender, bal);
    }

    function closePosition(
        address assetToReceive,
        address assetToLeverage,
        address assetToRepay,
        uint256 leverageAssetExposure,
        uint256 minPrincipalAmount,
        bytes memory extraParams
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

    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address,
        bytes calldata params
    ) external override returns (bool) {
        (
            uint8 action,
            address who,
            address assetToLeverage,
            address assetToBorrow
        ) = abi.decode(params, (uint8, address, address, address));

        if (action == 0)
            _openPositionInFlashloan(
                asset,
                amount,
                premium,
                who,
                assetToLeverage,
                assetToBorrow
            );

        return true;
    }

    function position(
        address who,
        address leverageAsset,
        address debtAsset
    )
        external
        view
        override
        returns (
            uint256 leverageAssetExposure,
            uint256 borrowedAmount,
            uint256 healthFactor
        )
    {}

    function getRevision() public pure virtual override returns (uint256) {
        return 0;
    }

    function _openPositionInFlashloan(
        address asset,
        uint256 amount,
        uint256 premium,
        address who,
        address assetToLeverage,
        address assetToBorrow
    ) internal {
        // todo
        // we have the borrowed funds
        // approve pool
        IERC20(assetToLeverage).approve(address(mahalend), amount);

        // supply the asset to mahalend
        mahalend.supply(assetToLeverage, amount, who, 0);

        // calculate how much to borrow of that same asset
        uint256 borrowAmount = (amount * ltv) / 100;

        // borrow the amount
        mahalend.borrow(asset, borrowAmount + premium, 2, 0, who);

        // repay the flashloan
        IERC20(asset).approve(address(POOL), amount + premium);
    }
}
