import { ethers, network, deployments } from "hardhat"
import { VOTING_PERIOD, localChains, proposalsFile } from "../hardhat-helper-config"
import * as fs from "fs"
import { moveBlocks } from "../utils/move-blocks"

const index = 0
async function vote(proposalIndex: number) {
  const proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"))
  const proposalId = proposals[network.config.chainId!][proposalIndex]
  //0 = against, 1 = for, 2 = abstain
  const voteWay = 1
  const reason = "i like the number 77"

  const { get } = deployments
  const governorDeployment = await get("GovernorContract")
  const governor = await ethers.getContractAt(governorDeployment.abi, governorDeployment.address)

  const voteTxResponse = await governor.castVoteWithReason(proposalId, voteWay, reason)
  await voteTxResponse.wait(1)

  if (localChains.includes(network.name)) {
    await moveBlocks(VOTING_PERIOD + 1)
  }
  console.log("Voted! Ready to go!")
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
vote(index).catch((error) => {
  console.error(error)
  process.exitCode = 1
})
