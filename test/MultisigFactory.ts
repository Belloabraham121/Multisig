import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { MultisigFactory__factory } from "../typechain-types";


describe ("MultisigFactory", function(){
     async function deployMultisigFactoryFixture() {
     const [owner, signer1, signer2, signer3, recipient] = await ethers.getSigners();
     
     // Deploy ERC20 contract 
     const Mcbellie = await ethers.getContractFactory("Mcbellie");
     const mcbellie = await Mcbellie.deploy();
     
     // Set the quorum and the lsit of valid signers 
     const quorum = 3;
     const validSigners = [owner.address, signer1.address, signer2.address];
     
     // Deploy MultisigFactory contract 
     const MultisigFactory = await ethers.getContractFactory("MultisigFactory");
     const multisigFactory = await MultisigFactory.deploy();

     // Transfer some tokens to the multisig contract
     await mcbellie.transfer(multisigFactory.target, ethers.parseUnits("1000", 18));

     return { multisigFactory, mcbellie, recipient, quorum, validSigners };
          
     }

     describe("Deployment", function () {
          it("Should set the correct quorum and valid signers", async function () {
            const { multisigFactory, quorum, validSigners} = await loadFixture(deployMultisigFactoryFixture);
            
            const tx = await multisigFactory.createMultisigWallet(quorum, validSigners)
            const recipient = tx.wait()

            const getMultisig = await multisigFactory.getMultiSigClones()
            
            expect(getMultisig.length).to.be.equal(1)
          });
     })

     describe("Store Multisig", function () {
          it("Should store multiple multisig", async function () {
            const { multisigFactory, quorum, validSigners} = await loadFixture(deployMultisigFactoryFixture);
            
            const tx0 = await multisigFactory.createMultisigWallet(quorum, validSigners)
            const tx1 = await multisigFactory.createMultisigWallet(quorum, validSigners)
            const tx2 = await multisigFactory.createMultisigWallet(quorum, validSigners)
            const tx3 = await multisigFactory.createMultisigWallet(quorum, validSigners)
            const tx4 = await multisigFactory.createMultisigWallet(quorum, validSigners)

            

            const getMultisig = await multisigFactory.getMultiSigClones()
            
            expect(getMultisig.length).to.be.equal(5)
          });
     })

     
})