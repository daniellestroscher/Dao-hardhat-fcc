import { DeployFunction } from "hardhat-deploy/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { localChains, networkConfig } from "../hardhat-helper-config"
import { verify } from "../utils/verify"
import { ethers } from "hardhat"

const deployGovernanceToken: DeployFunction = async function ({
  getNamedAccounts,
  deployments,
  network,
}: HardhatRuntimeEnvironment) {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = network.config.chainId as number

  log("Deploying governance token...")
  const governanceToken = await deploy("GovernanceToken", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: networkConfig[chainId].blockConfirmations || 1,
  })

  if (!localChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    log("Verifying...")
    await verify(governanceToken.address, [])
  }

  await delegate(governanceToken.address, deployer)
  log("Delegated!")
}

const delegate = async function (governanceTokenAddress: string, delegateAccount: string) {
  console.log(governanceTokenAddress, delegateAccount, "PARAMS")
  const governanceToken = await ethers.getContractAt("GovernanceToken", governanceTokenAddress)
  const tx = await governanceToken.delegate(delegateAccount)
  await tx.wait(1)

  console.log(`Checkpoints ${await governanceToken.numCheckpoints(delegateAccount)}`)
}
export default deployGovernanceToken
deployGovernanceToken.tags = ["all", "token"]
