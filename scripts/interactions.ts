import { ethers } from "hardhat";

async function main() {
    const TokenAddress = "0xF6D73AAbB92766c5feC3C7dcE5698FFD0dC44970";
    const Mcb = await ethers.getContractAt("IERC20", TokenAddress);

    const MultisigContractAddress = "0x93dd3dB2b31Eb1A4dc1d41F0D61B4fb6394a6cDA";
    const Multisig = await ethers.getContractAt("IMultisig", MultisigContractAddress);


    // const transferAmount = ethers.parseUnits("1000", 18);
    // const ApproveTx = await OluchiToken.transferFrom(Multisig, transferAmount)

    //  console.log("transfer transaction", ApproveTx);
    // //Approve savings contract to spend token
    // const approvalAmount = ethers.parseUnits("1000", 18);
    // const approveTx = await OluchiToken.approve(Multisig, approvalAmount);
    // approveTx.wait();

    // console.log("approved transaction", approveTx);
    
    // const contractBalanceBeforeDeposit = await Multisig.getContractBalance();
    // console.log("Contract balance before :::", contractBalanceBeforeDeposit);

    // const depositAmount = ethers.parseUnits("150", 18);
    // const depositTx = await saveERC20.deposit(depositAmount);

    // console.log(depositTx);

    // depositTx.wait();

    // const contractBalanceAfterDeposit = await saveERC20.getContractBalance();

    // console.log("Contract balance after :::", contractBalanceAfterDeposit);



    // // Withdrawal Interaction

    // const Withdrawal = ethers.parseUnits("10", 18);

    // const withdrawTx = await saveERC20.withdraw(Withdrawal);

    // await withdrawTx.wait();
    // console.log(withdrawTx);

    // const contractBalanceAfterWithdrawal = await saveERC20.getContractBalance();

    // console.log("contract error after withdrawal :::", contractBalanceAfterWithdrawal)

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});