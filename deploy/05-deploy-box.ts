import { DeployFunction } from "hardhat-deploy/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { localChains, networkConfig } from "../hardhat-helper-config"
import { verify } from "../utils/verify"
import { ethers } from "hardhat"

const deployBox: DeployFunction = async function ({
  getNamedAccounts,
  deployments,
  network,
}: HardhatRuntimeEnvironment) {
  const { deploy, log, get } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = network.config.chainId as number

  log("Deploying Box...")
  const box = await deploy("Box", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: networkConfig[chainId].blockConfirmations || 1,
  })

  if (!localChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    log("Verifying...")
    await verify(box.address, [])
  }

  const timeLock = await get("TimeLock")
  //const timeLockContract = await ethers.getContractAt("TimeLock", timeLock.address)
  const boxContract = await ethers.getContractAt("Box", box.address)
  const transferTx = await boxContract.transferOwnership(timeLock.address)
  await transferTx.wait(1)
  log("done!")
}

export default deployBox
deployBox.tags = ["all", "box"]
