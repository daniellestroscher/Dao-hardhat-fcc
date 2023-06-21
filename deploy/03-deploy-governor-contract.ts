import { DeployFunction } from "hardhat-deploy/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { localChains, networkConfig } from "../hardhat-helper-config"
import { verify } from "../utils/verify"
import { ethers } from "hardhat"
import { VOTING_DELAY, VOTING_PERIOD, QUORUM_PERCENTAGE } from "../hardhat-helper-config"

const deployGovernorContract: DeployFunction = async function ({
  getNamedAccounts,
  deployments,
  network,
}: HardhatRuntimeEnvironment) {
  const { deploy, log, get } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = network.config.chainId as number

  const governanceToken = await get("GovernanceToken")
  const timeLock = await get("TimeLock")

  log("Deploying Governor Contract...")
  const args = [
    governanceToken.address,
    timeLock.address,
    QUORUM_PERCENTAGE,
    VOTING_PERIOD,
    VOTING_DELAY,
  ]

  const governorContract = await deploy("GovernorContract", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: networkConfig[chainId].blockConfirmations || 1,
  })

  if (!localChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    log("Verifying...")
    await verify(governorContract.address, args)
  }
}

export default deployGovernorContract
deployGovernorContract.tags = ["all", "governorContract"]
