import { ethers, network, deployments } from "hardhat"
import {
  localChains,
  FUNC,
  NEW_STORE_VALUE,
  PROPOSAL_DESCRIPTION,
  VOTING_DELAY,
  proposalsFile,
  VOTING_PERIOD,
  MIN_DELAY,
} from "../hardhat-helper-config"
import * as fs from "fs"
import { moveBlocks } from "../utils/move-blocks"
import { moveTime } from "../utils/move-time"

async function queueAndExecute() {
  const args = [NEW_STORE_VALUE]

  const { get } = deployments
  const boxDeployment = await get("Box")
  const box = await ethers.getContractAt(boxDeployment.abi, boxDeployment.address)

  const encodedFunctionCall = box.interface.encodeFunctionData(FUNC, args)
  const descriptionHash = ethers.keccak256(ethers.toUtf8Bytes(PROPOSAL_DESCRIPTION))

  const governorDeployment = await get("GovernorContract")
  const governor = await ethers.getContractAt(governorDeployment.abi, governorDeployment.address)
  console.log("Queueing...")

  const queueTx = await governor.queue(
    [boxDeployment.address],
    [0],
    [encodedFunctionCall],
    descriptionHash
  )
  await queueTx.wait(1)

  if (localChains.includes(network.name)) {
    await moveTime(MIN_DELAY + 1)
    await moveBlocks(1)
  }
  console.log("Executing...")
  const executeTx = await governor.execute(
    [boxDeployment.address],
    [0],
    [encodedFunctionCall],
    descriptionHash
  )
  await executeTx.wait(1)

  const boxNewValue = await box.getValue()
  console.log(`New Box value is: ${boxNewValue}`)
  console.log("-----------------------------------------------------------")
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
queueAndExecute().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
