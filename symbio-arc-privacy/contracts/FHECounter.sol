// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.27;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title SymbioMarket FHE smoke counter — encrypted increment only
contract FHECounter is ZamaEthereumConfig {
    euint32 private _count;

    function getCount() external view returns (euint32) {
        return _count;
    }

    function increment(externalEuint32 inputEuint32, bytes calldata inputProof) external {
        euint32 delta = FHE.fromExternal(inputEuint32, inputProof);
        _count = FHE.add(_count, delta);
        FHE.allowThis(_count);
        FHE.allow(_count, msg.sender);
    }
}
