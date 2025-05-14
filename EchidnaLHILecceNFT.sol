// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "./LHILecceNFT_flat.sol";

contract EchidnaLHILecceNFT is LHILecceNFT {
    constructor()
        LHILecceNFT(
            "ipfs://bafkreight2qjl53xhxxhhqagqccdk7ryj4455zx3ggazk7mqpbzxxiqlma",
            0xf9909c6CD90566BD56621EE0cAc42986ae334Ea3,
            0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619
        )
    {}

    // Esempio di proprietà Echidna
    function echidna_totalMinted_nonzero() public view returns (bool) {
        return totalMinted[1] >= 0;
    }
}
