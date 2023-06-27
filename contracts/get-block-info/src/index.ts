import {Tendermint34Client} from "@cosmjs/tendermint-rpc";
// We use this import to print out moar vs what console log does
import * as util from "util";

// Please use the chain-registry instead of hardcoding like we do here
// This will keep this example lightweight, though

const rpcEndpoint = 'https://juno-testnet-rpc.polkachu.com:443'

const start = async () => {
    const client: any = await Tendermint34Client.connect(rpcEndpoint)

    // Get the latest block height
    const currentStatus = await client.status()
    // console.log('currentStatus', currentStatus)
    let currentHeight = currentStatus.syncInfo.latestBlockHeight
    console.log('currentHeight', currentHeight)

    // Get block info from height
    const blockInfo = await client.block(currentHeight)
    console.log(blockInfo, util.inspect(blockInfo, false, null, true))
}

// Calls start function
(() => start())()
