import { ethers } from "hardhat"

async function main() {
  const currentTimestampInSeconds = Math.round(Date.now() / 1000)
  const unlockTime = currentTimestampInSeconds + 60
  const maxTotalSupply = 1000000
  const initialAccounts = [
    "0x3CD4873141677C270E3D42b76384C4819f0C2f7B",
  ]
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
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
