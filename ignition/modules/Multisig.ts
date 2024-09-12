import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MultisigModule = buildModule("MultisigModule", (m) => {

    const quorum = 2

    const ValidSigners = ["0xeeD71459493CDda2d97fBefbd459701e356593f3","0x9B03315A72861579E11F71f1aA774a36adc76015","0x4983a8374B0e2cEb3f8ceBD40B69457a4BF0BEFC"]

    const Multisig = m.contract("Multisig", [quorum, ValidSigners]);

    return { Multisig };

});

export default MultisigModule;

