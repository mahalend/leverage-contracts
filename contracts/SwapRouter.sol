// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import {ISwapRouter} from "./interfaces/ISwapRouter.sol";
import {VersionedInitializable} from "./proxy/VersionedInitializable.sol";

contract SwapRouter is VersionedInitializable, ISwapRouter {
    function initialize() external initializer {
        // todo
    }

    function executeSwapOutMin(
        address fromAsset,
        address toAsset,
        uint256 amountIn,
        uint256 amountOutMin,
        ExchangeRoute exchange,
        bytes memory params
    ) external override returns (uint256 amountInConsumed) {
        // todo
        return 0;
    }

    function executeSwapInMax(
        address fromAsset,
        address toAsset,
        uint256 amountInMax,
        uint256 amountOut,
        ExchangeRoute exchange,
        bytes memory params
    ) external override returns (uint256 amountOutReceived) {
        // todo
        return 0;
    }

    function getRevision() public pure virtual override returns (uint256) {
        return 0;
    }
}
