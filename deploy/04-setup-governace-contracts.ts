import { DeployFunction } from "hardhat-deploy/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { localChains, networkConfig } from "../hardhat-helper-config"
import { verify } from "../utils/verify"
import { ethers } from "hardhat"
import { ADDRESS_ZERO } from "../hardhat-helper-config"

const setupContracts: DeployFunction = async function ({
  getNamedAccounts,
  deployments,
  network,
}: HardhatRuntimeEnvironment) {
  const { deploy, log, get } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = network.config.chainId as number

  const timeLock = await get("TimeLock")
  const governor = await get("GovernorContract")

  const timeLockContract = await ethers.getContractAt("TimeLock", timeLock.address)
  const governorContract = await ethers.getContractAt("GovernorContract", governor.address)

  const governorContractAddress = await governorContract.getAddress()

  const proposerRole = await timeLockContract.PROPOSER_ROLE()
  const executorRole = await timeLockContract.EXECUTOR_ROLE()
  const adminRole = await timeLockContract.TIMELOCK_ADMIN_ROLE()

  log("setting up contracts...")

  const proposerTx = await timeLockContract.grantRole(proposerRole, governorContractAddress)
  await proposerTx.wait(1)

  const executorTx = await timeLockContract.grantRole(executorRole, ADDRESS_ZERO) //no one
  await executorTx.wait(1)

  const revokeTx = await timeLockContract.revokeRole(adminRole, deployer)
  await revokeTx.wait(1)
}

export default setupContracts
setupContracts.tags = ["all", "setup"]
