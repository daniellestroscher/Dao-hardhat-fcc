import { ethers, deployments, network } from "hardhat"
import {
  localChains,
  FUNC,
  NEW_STORE_VALUE,
  PROPOSAL_DESCRIPTION,
  VOTING_DELAY,
  proposalsFile,
} from "../hardhat-helper-config"
import { moveBlocks } from "../utils/move-blocks"
import { BigNumberish, FunctionFragment } from "ethers"
import * as fs from "fs"

export async function propose(
  args: [BigNumberish],
  functionToCall: any,
  proposalDescription: string
) {
  const { get } = deployments
  const governorDeployment = await get("GovernorContract")
  const governor = await ethers.getContractAt(governorDeployment.abi, governorDeployment.address)

  const boxDeployment = await get("Box")
  const box = await ethers.getContractAt(boxDeployment.abi, boxDeployment.address)

  const encodedFunctionCall = box.interface.encodeFunctionData(functionToCall, args)

  console.log(`Proposing ${functionToCall} on ${boxDeployment.address} with ${args}...`)
  console.log(`Proposal description: \n ${proposalDescription}`)

  const proposeTx = await governor.propose(
    [boxDeployment.address],
    [0],
    [encodedFunctionCall],
    proposalDescription
  )
  const proposeReceipt = await proposeTx.wait(1)

  const parsedLogs = proposeReceipt.logs.map((log: any) => governor.interface.parseLog(log))
  const proposalId = parsedLogs[0].args.proposalId

  let proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"))
  proposals[network.config.chainId!.toString()].push(proposalId.toString())
  fs.writeFileSync(proposalsFile, JSON.stringify(proposals))

  if (localChains.includes(network.name)) {
    await moveBlocks(VOTING_DELAY + 1)
  }
}

propose([NEW_STORE_VALUE], FUNC, PROPOSAL_DESCRIPTION).catch((error) => {
  console.error(error)
  process.exitCode = 1
})
