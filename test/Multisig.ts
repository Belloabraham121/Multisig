import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { token } from "../typechain-types/@openzeppelin/contracts";

describe("Multisig", function () {
  async function deployMultisigFixture() {
    const [owner, signer1, signer2, signer3, recipient] = await ethers.getSigners();
    
    const Mcbellie = await ethers.getContractFactory("Mcbellie");
    const mcbellie = await Mcbellie.deploy();

    const quorum = 2;
    const validSigners = [owner.address, signer1.address, signer2.address];
    
    const Multisig = await ethers.getContractFactory("Multisig");
    const multisig = await Multisig.deploy(quorum, validSigners);

    // Transfer some tokens to the multisig contract
    await mcbellie.transfer(multisig.target, ethers.parseUnits("1000", 18));

    return { multisig, mcbellie, owner, signer1, signer2, signer3, recipient, quorum };
  }

  describe("Deployment", function () {
    it("Should set the correct quorum and valid signers", async function () {
      const { multisig, quorum, owner, signer1, signer2 } = await loadFixture(deployMultisigFixture);
      
      expect(await multisig.quorum()).to.equal(quorum);
      expect(await multisig.noOfValidSigners()).to.equal(3);

      expect(await multisig.isValidSigner(await owner.getAddress())).to.be.true;
      expect(await multisig.isValidSigner(await signer1.getAddress())).to.be.true;
      expect(await multisig.isValidSigner(await signer2.getAddress())).to.be.true;
     
    });

    it("Should if quorum is too small", async function () {
      
    })
  });

  describe("Transfer", function(){


    // require(msg.sender != address(0), "address zero found");

    it("Should revert if a zero address is provided as a valid signer", async function () {

      const [owner, signer1] = await ethers.getSigners();
      const quorum = 2;
      const invalidSigners = [owner.address, signer1.address, ethers.ZeroAddress];
        
      const Multisig = await ethers.getContractFactory("Multisig");
        
      await expect(Multisig.deploy(quorum, invalidSigners))
          .to.be.revertedWith("zero address not allowed");
    });


    // require(isValidSigner[msg.sender], "invalid signer");


    it("Should revert if sender is not a valid signer", async function () {
      const { multisig, mcbellie, signer3, recipient } = await loadFixture(deployMultisigFixture);
              
      await expect(multisig.connect(signer3).transfer(100, recipient.address, mcbellie.target))
          .to.be.revertedWith("invalid signer");
    });


    //  require(_amount > 0, "can't send zero amount");

    it("Should revert on zero amount", async function () {
      const {multisig, mcbellie, signer1, recipient} = await loadFixture(deployMultisigFixture);
        
      const amount = ethers.parseUnits("0", 18);
  
      await expect(multisig.connect(signer1).transfer(amount, mcbellie.target, recipient.address))
            .to.be.revertedWith("can't send zero amount");
    })

    // require(_recipient != address(0), "address zero found");

    it("Should revert if the recipient is address zero", async function () {
      const {multisig, mcbellie, signer2} = await loadFixture(deployMultisigFixture);

      await expect(multisig.connect(signer2).transfer(100, ethers.ZeroAddress, mcbellie.target))
          .to.be.revertedWith("address zero found")
      
    })

    // require(IERC20(_tokenAddress).balanceOf(address(this)) >= _amount, "insufficient funds");

    it("Should revert if amount is greater than balance (simple method)", async function () {
      const { multisig, mcbellie, signer1, recipient } = await loadFixture(deployMultisigFixture);
    
      // Get the current balance of the multisig contract
      const contractBalance = await mcbellie.balanceOf(multisig.target);

    
      // Create an amount slightly larger than the contract balance
      const excessiveAmount = contractBalance + ethers.parseUnits("1", 18);
    
      // Prepare the transaction data
      const transferTx = await expect(multisig.connect(signer1).transfer(
        excessiveAmount,
        recipient.address,
        mcbellie.target
      )).to.be.revertedWith("insufficient funds");
    
      // Verify that the contract balance remains unchanged
      expect(await mcbellie.balanceOf(multisig.target)).to.equal(contractBalance);
    });

     // require(IERC20(_tokenAddress).balanceOf(address(this)) >= _amount, "insufficient funds");

    it("Should revert if amount is greater than balance (alternative version)", async function () {
      const { multisig, mcbellie, signer1, recipient } = await loadFixture(deployMultisigFixture);
    
      // Get the current balance of the multisig contract
      const contractBalance = await mcbellie.balanceOf(multisig.target);
    
      // Try to transfer an amount greater than the contract balance
      const excessiveAmount = contractBalance + BigInt(1);
    
      // Attempt to initiate a transfer with an excessive amount
      await expect(
        multisig.connect(signer1).transfer(excessiveAmount, recipient.address, mcbellie.target)
      ).to.be.revertedWith("insufficient funds");
    
      // Verify that the contract balance remains unchanged
      expect(await mcbellie.balanceOf(multisig.target)).to.equal(contractBalance);
    });


    // require(IERC20(_tokenAddress).balanceOf(address(this)) >= _amount, "insufficient funds");




    it("Should create a new transaction", async function () {
      const { multisig, mcbellie, owner, recipient } = await loadFixture(deployMultisigFixture);
      
      const amount = ethers.parseEther("100");
      await multisig.transfer(amount, recipient.address, mcbellie.target);
      
      const tx = await multisig.transactions(1);
      expect(tx.id).to.equal(1);
      expect(tx.amount).to.equal(amount);
      expect(tx.recipient).to.equal(recipient.address);
      expect(tx.sender).to.equal(owner.address);
      expect(tx.isCompleted).to.be.false;
      expect(tx.noOfApproval).to.equal(1);
      expect(tx.tokenAddress).to.equal(mcbellie.target);
    })

  });

  describe("approveTx", function () {
    
    it("Should approve a transaction and execute it when quorum is reached", async function () {
      const { multisig, mcbellie, owner, signer1, signer2, recipient, quorum } = await loadFixture(deployMultisigFixture);
      
      const transferAmount = ethers.parseUnits("100", 18);
      
      // Create a new transaction
      await multisig.connect(owner).transfer(transferAmount, recipient.address, mcbellie.target);
      
      // Get the initial balances
      const initialMultisigBalance = await mcbellie.balanceOf(multisig.target);
      const initialRecipientBalance = await mcbellie.balanceOf(recipient.address);
      
      // Approve the transaction with signer1
      await multisig.connect(signer1).approveTx(1);
      
      // Check if the transaction is completed (quorum should be 2)
      const tx = await multisig.transactions(1);
      expect(tx.isCompleted).to.be.true;
      expect(tx.noOfApproval).to.equal(quorum);
      
      // Check if the balances are updated correctly
      const finalMultisigBalance = await mcbellie.balanceOf(multisig.target);
      const finalRecipientBalance = await mcbellie.balanceOf(recipient.address);
      
      expect(finalMultisigBalance).to.equal(initialMultisigBalance - transferAmount);
      expect(finalRecipientBalance).to.equal(initialRecipientBalance + transferAmount);
    });
  
    it("Should not allow non-signers to approve transactions", async function () {
      const { multisig, mcbellie, owner, signer3, recipient } = await loadFixture(deployMultisigFixture);
      
      const transferAmount = ethers.parseUnits("100", 18);
      
      // Create a new transaction
      await multisig.connect(owner).transfer(transferAmount, recipient.address, mcbellie.target);
      
      // Try to approve the transaction with a non-signer
      await expect(multisig.connect(signer3).approveTx(1))
        .to.be.revertedWith("not a valid signer");
    });
  
    it("Should not allow approving an invalid transaction ID", async function () {
      const { multisig, signer1 } = await loadFixture(deployMultisigFixture);
      
      // Try to approve a non-existent transaction
      await expect(multisig.connect(signer1).approveTx(0))
        .to.be.revertedWith("invalid tx id");
    });
  
    it("Should not allow approving an already completed transaction", async function () {
      const { multisig, mcbellie, owner, signer1, signer2, recipient } = await loadFixture(deployMultisigFixture);
      
      const transferAmount = ethers.parseUnits("100", 18);
      
      // Create and approve a transaction
      await multisig.connect(owner).transfer(transferAmount, recipient.address, mcbellie.target);
      await multisig.connect(signer1).approveTx(1);
      
      // Try to approve the completed transaction again
      await expect(multisig.connect(signer2).approveTx(1))
        .to.be.revertedWith("transaction already completed");
    });
  
    it("Should not allow a signer to approve the same transaction twice", async function () {
      const { multisig, mcbellie, owner, signer1, recipient } = await loadFixture(deployMultisigFixture);
      
      const transferAmount = ethers.parseUnits("100", 18);
      
      // Create a new transaction
      await multisig.connect(owner).transfer(transferAmount, recipient.address, mcbellie.target);
      
      // Approve the transaction once
      await multisig.connect(signer1).approveTx(1);
      
      // Try to approve the same transaction again
      await expect(multisig.connect(signer1).approveTx(1))
        .to.be.revertedWith("transaction already completed");
    });
  

    it("Should revert if there are insufficient funds when approving a transaction", async function () {
      const { multisig, mcbellie, owner, signer1, recipient } = await loadFixture(deployMultisigFixture);



      // Get the current balance
      const balance = await mcbellie.balanceOf(multisig.target);

      // Try to create a transaction with more than the available balance
      const txAmount =  ethers.parseUnits("1000", 18);
      const txAmount1 =  ethers.parseUnits("1000", 18);



      await multisig.transfer(txAmount, recipient.address, mcbellie.target);
      await multisig.transfer(txAmount1, recipient.address, mcbellie.target);
      
      
      await expect(multisig.connect(signer1).approveTx(1))
      await expect(multisig.connect(owner).approveTx(1))

      await expect(multisig.connect(signer1).approveTx(2))
      await expect(multisig.connect(owner).approveTx(2))
      .to.be.revertedWith("insufficient funds")
     
      
    
  });


  describe("UpdateNewQuorum", function(){

    it("Should revert if a zero address is provided as a valid signer", async function () {

        const [owner, signer1] = await ethers.getSigners();
        const quorum = 3;
        const invalidSigners = [owner.address, signer1.address, ethers.ZeroAddress];
            
        const Multisig = await ethers.getContractFactory("Multisig");
            
        await expect(Multisig.deploy(quorum, invalidSigners))
            .to.be.revertedWith("zero address not allowed");
        });
    
    
    
        it("Should revert if sender is not a valid signer", async function () {
          const { multisig, mcbellie, signer3, recipient } = await loadFixture(deployMultisigFixture);
                  
          await expect(multisig.connect(signer3).transfer(100, recipient.address, mcbellie.target))
              .to.be.revertedWith("invalid signer");
        });

    it("Should revert if sender is not a valid signer", async function () {
      const { multisig, signer3 } = await loadFixture(deployMultisigFixture);
              
      await expect(multisig.connect(signer3).updateNewQuorum(3))
          .to.be.revertedWith("invalid signer");
    });

    it("Should create a new transaction for updating quorum", async function () {
      const { multisig, owner } = await loadFixture(deployMultisigFixture);
      
      const newQuorum = 3;
      await multisig.connect(owner).updateNewQuorum(newQuorum);
      
      const tx = await multisig.transactions(1);
      expect(tx.id).to.equal(1);
      expect(tx.sender).to.equal(owner.address);
      expect(tx.noOfApproval).to.equal(1);
      expect(tx.newQuorum).to.equal(newQuorum);
      expect(tx.isCompleted).to.be.false;
    });
  });

  describe("approveNewQuorum", function() {

    it("Should not allow approving an invalid transaction ID", async function () {
      const { multisig, signer1 } = await loadFixture(deployMultisigFixture);
      
      await expect(multisig.connect(signer1).approveNewQuorum(0))
        .to.be.revertedWith("invalid tx id");
    });

    it("Should not allow approving an already completed transaction", async function () {
      const { multisig, owner, signer1, signer2 } = await loadFixture(deployMultisigFixture);
      
      await multisig.connect(owner).updateNewQuorum(3);
      await multisig.connect(signer1).approveNewQuorum(1);
      
      await expect(multisig.connect(signer2).approveNewQuorum(1))
        .to.be.revertedWith("transaction already completed");
    });

    it("Should not allow non-signers to approve new quorum", async function () {
      const { multisig, owner, signer3 } = await loadFixture(deployMultisigFixture);
      
      await multisig.connect(owner).updateNewQuorum(3);
      
      await expect(multisig.connect(signer3).approveNewQuorum(1))
        .to.be.revertedWith("not a valid signer");
    });


    

    it("Should not allow a signer to approve the same transaction twice", async function () {
      const { multisig, owner, signer1 } = await loadFixture(deployMultisigFixture);
      
      await multisig.connect(owner).updateNewQuorum(3);
      
      await expect(multisig.connect(owner).approveNewQuorum(1))
        .to.be.revertedWith("can't sign twice");
    });

    it("Should not allow a signer to approve the same transaction twice", async function () {
      const { multisig, owner, signer1 } = await loadFixture(deployMultisigFixture);
      
      await multisig.connect(owner).updateNewQuorum(3);
      
      await expect(multisig.connect(owner).approveNewQuorum(1))
        .to.be.revertedWith("can't sign twice");
    });

    it("Should approve new quorum and update when quorum is reached", async function () {
      const { multisig, owner, signer1 } = await loadFixture(deployMultisigFixture);
      
      const newQuorum = 3;
      await multisig.connect(owner).updateNewQuorum(newQuorum);
      await multisig.connect(signer1).approveNewQuorum(1);
      
      const tx = await multisig.transactions(1);
      expect(tx.isCompleted).to.be.true;
      expect(tx.noOfApproval).to.equal(2);
      expect(await multisig.quorum()).to.equal(newQuorum);
    });
  });
})
});