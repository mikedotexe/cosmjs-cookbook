import {DirectSecp256k1HdWallet} from "@cosmjs/proto-signing";
import { chains } from 'chain-registry';
import { MsgDelegate } from "cosmjs-types/cosmos/staking/v1beta1/tx";
import { MsgExec } from "cosmjs-types/cosmos/authz/v1beta1/tx";

import {config} from "dotenv"
import {Chain} from "@chain-registry/types";
import {
    QueryClient,
    SigningStargateClient,
    setupDistributionExtension,
    coin
} from "@cosmjs/stargate";
import {Tendermint34Client} from "@cosmjs/tendermint-rpc";
import * as util from "util";
config({ path: '.env' })

// Get values from the environment variables located in the .env file
const seedPhrase: string = process.env.SEED_PHRASE
const prefix: string = process.env.PREFIX
const chainId: string = process.env.CHAIN_ID
const validatorAddress: string = process.env.VALIDATOR_ADDRESS
const ledgerAddress: string = process.env.LEDGER_ADDRESS

const ONE_ATOM = BigInt(1e24); // 1 atom is equal to 1e24 uatom

// Get RPC endpoints for the CHAIN_ID specified in .env file
const chainInfo: Chain = chains.find( ({ chain_id }) => chain_id === chainId)
const endpoints = chainInfo.apis.rpc

const start = async () => {
    const signerWallet = await DirectSecp256k1HdWallet.fromMnemonic(seedPhrase, { prefix })

    const userAddress = (await signerWallet.getAccounts())[0].address
    if (endpoints.length === 0) {
        console.error('Could not get chain-registry endpoints.')
        return
    }
    let firstRpc = endpoints[1].address;

    const tmClient = await Tendermint34Client.connect(firstRpc);
    let client = QueryClient.withExtensions(tmClient, setupDistributionExtension);

    const allRewards = await client.distribution.delegationRewards(ledgerAddress, validatorAddress)
    const atomReward = allRewards.rewards.find(reward => reward.denom === 'uatom').amount;
    console.log('ATOM rewards', atomReward)

    if (BigInt(atomReward) > ONE_ATOM) {
        console.log('Rewards bigger than 1 atom')
    } else {
        console.log('Rewards not bigger than 1 atom, egg-sitting')
        return
    }

    const wholeATOMs = Number(BigInt(atomReward) / ONE_ATOM);

    const msgDelegate = MsgDelegate.fromPartial({
        delegatorAddress: ledgerAddress,
        validatorAddress: validatorAddress,
        amount: coin(wholeATOMs, 'uatom'),
    });

    const msgDelegateData = MsgDelegate.encode(msgDelegate).finish();
    const msgExec = MsgExec.fromPartial({
        grantee: userAddress,
        msgs: [{
            typeUrl: '/cosmos.staking.v1beta1.MsgDelegate',
            value: msgDelegateData
        }]
    });

    const msgAuthzExec = {
        typeUrl: '/cosmos.authz.v1beta1.MsgExec',
        value: msgExec
    }

    const piClient = await SigningStargateClient.connectWithSigner(firstRpc, signerWallet);

    const fee = {
        amount: [{ denom: 'uatom', amount: '3000' }],
        gas: '666000', // Choose an appropriate gas limit for your specific transaction
    };
    const broadcastRes = await piClient.signAndBroadcast(userAddress, [msgAuthzExec], fee, 'I am delegating on your behalf, homie.');
    // if you want
    console.log('Response', util.inspect(broadcastRes, false, null, true))
}

// Calls start function
(() => start())()
