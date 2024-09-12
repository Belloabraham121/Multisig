import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MultisigFactoryModule = buildModule("MultisigFactoryModule", (m) => {

    const mutisigFactory = m.contract("MultisigFactory");

    return { mutisigFactory };

});

export default MultisigFactoryModule; 

// MultisigFactoryModule#MultisigFactory - 0x2F571f303b437Dc695E59b286b60d4197185250a
// MebellieModule#Mcbellie - 0xE15fF589A2a0b91aDACc4650e14a59c981A61F41