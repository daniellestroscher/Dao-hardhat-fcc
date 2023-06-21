import { ethers } from "ethers"

interface NetworkConfigObject {
  [key: number]: {
    name: string
    vrfCoordinatorV2?: string
    blockConfirmations?: number
    entranceFee: string
    gasLane: string
    subscriptionId?: string
    callbackGasLimit: string
    interval: string
  }
}

export const networkConfig: NetworkConfigObject = {
  31337: {
    name: "localhost",
    entranceFee: ethers.parseEther("0.01").toString(),
    gasLane: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c", //this value doesn't matter. mocked by hardhat.
    callbackGasLimit: "500000",
    interval: "30",
  },
  11155111: {
    name: "sepolia",
    vrfCoordinatorV2: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
    blockConfirmations: 6,
    entranceFee: ethers.parseEther("0.01").toString(),
    gasLane: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
    subscriptionId: "2446",
    callbackGasLimit: "500000",
    interval: "30",
  },
}

export const localChains = ["hardhat", "localhost"]
export const MIN_DELAY = 3600
export const VOTING_PERIOD = 5
export const VOTING_DELAY = 1
export const QUORUM_PERCENTAGE = 4 //4% of voters need to vote!
export const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000"
export const NEW_STORE_VALUE = 77
export const FUNC = "setValue"
export const PROPOSAL_DESCRIPTION = "Proposal #1: Store 77 in the box!"
export const proposalsFile = "proposals.json"
