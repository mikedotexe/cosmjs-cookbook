# Authz delegate

This repo demonstrates using the `DelegationRewards` message once you've given another address an authz grant allowing it to delegate on its behalf.

# Repository set up

Please remember to copy `.env.template` to `.env` and fill out the variables.

Then:

    npm run build && npm run start

# Set up authz

For this example, we'll use the Cosmos Hub, since that doesn't have CosmWasm and therefore (so far) cannot leverage CronCat automation. So we'll create a script that'll call this in a cron job.

Below are some commands that will be helpful in following along:

```sh
# Add key for Ledger
gaiad keys add lpink --ledger
# Add key that'll be moved to Raspberry Pi
gaiad keys add forpi

# Give authz grant to new "forpi" account, allowing it to call MsgDelegate on behalf of the ledger's account
gaiad tx authz grant $(gaiad keys show forpi -a) generic --msg-type="/cosmos.staking.v1beta1.MsgDelegate" --gas auto --gas-prices 0.025uatom --gas-adjustment 1.3 --from lpink -y

# See the grant, confirming it works
gaiad q authz grants $(gaiad keys show lpink -a) $(gaiad keys show forpi -a)

# See how much rewards have accumulated under the "uatom" denom
gaiad q distribution rewards $(gaiad keys show lpink -a) cosmosvaloper1xwazl8ftks4gn00y5x3c47auquc62ssuqlj02r
```
