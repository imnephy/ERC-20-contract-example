import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { expect } from "chai"
import { ethers } from "hardhat"

describe("Lock", function () {
  async function deployToProvideAddresses() {
    const currentTimestampInSeconds = Math.round(Date.now() / 1000)
    const unlockTime = currentTimestampInSeconds + 60
    const maxTotalSupply = 1000000
    const initialAccounts = []
    for (let i = 0; i < 4; i++) {
      const wallet = ethers.Wallet.createRandom()
      initialAccounts.push(wallet.address)
    }
    ethers.Wallet.createRandom()
    const [deployer] = await ethers.getSigners()
    const initialSupplyPerAccount = 100000
    const lock = await ethers.deployContract("Lock", [
      maxTotalSupply,
      initialAccounts,
      initialSupplyPerAccount,
    ])

    await lock.waitForDeployment()

    console.log(
      `Unlock timestamp ${unlockTime} deployed to ${lock.target}`
    )

    return {
      lock,
      unlockTime,
      initialAccounts,
      initialSupplyPerAccount,
      deployer,
    }
  }

  describe("Deployment", function () {
    it("Should set the right amount of currency to array of addresses", async function () {
      const { lock, initialAccounts, initialSupplyPerAccount } =
        await loadFixture(deployToProvideAddresses)

      expect(await lock.balanceOf(initialAccounts[0])).to.equal(
        initialSupplyPerAccount
      )
    })

    it("Should set the right amount of currency to all addresses", async function () {
      const { lock, initialAccounts, initialSupplyPerAccount } =
        await loadFixture(deployToProvideAddresses)
      for (const wallet of initialAccounts) {
        const walletBalance = await lock.balanceOf(wallet)
        if (walletBalance !== BigInt(initialSupplyPerAccount)) {
          throw new Error(
            "Wallet balance of array wallet address isn't correct"
          )
        }
      }
    })

    it("Should set the new amount of supply to single address after mint", async function () {
      const { lock, initialAccounts, initialSupplyPerAccount } =
        await loadFixture(deployToProvideAddresses)

      await lock.mint(initialAccounts[2], 1000)

      expect(
        await lock.balanceOf(initialAccounts[2])
      ).to.be.not.equal(await lock.balanceOf(initialAccounts[0]))
    })

    it("Should set the right owner", async function () {
      const { lock, deployer } = await loadFixture(
        deployToProvideAddresses
      )

      expect(await lock.admin()).to.equal(deployer.address)
    })

    it("Should mint to address", async function () {
      const { lock, initialAccounts } = await loadFixture(
        deployToProvideAddresses
      )
      await lock.mint(initialAccounts[0], 100000)

      expect(await lock.balanceOf(initialAccounts[0])).to.be.equal(
        200000
      )
    })

    it("Should fail if max supply has been reached", async function () {
      const { lock, initialAccounts } = await loadFixture(
        deployToProvideAddresses
      )
      await expect(
        lock.mint(initialAccounts[0], 1000000)
      ).to.be.revertedWith("Exceeds max total supply")
    })

    it("Should not allow a non-owner to call a function with onlyAdmin modifier", async function () {
      const { lock, initialAccounts } = await loadFixture(
        deployToProvideAddresses
      )
      const nonOwner = ethers.Wallet.createRandom().connect(
        ethers.provider
      )
      await expect(
        lock.connect(nonOwner).mint(initialAccounts[0], 100000)
      ).to.be.revertedWith("Only admin can call this function")
    })

    it("Should revert if trying to mint more tokens during contract initialization than the max total supply.", async function () {
      try {
        const lock = await ethers.deployContract("Lock", [
          1000,
          ["0x3CD4873141677C270E3D42b76384C4819f0C2f7B"],
          100000,
        ])

        await lock.waitForDeployment()
      } catch (error: any) {
        expect(error.message).to.be.revertedWith(
          "Initial supply exceeds max total supply"
        )
      }
    })
  })
})
