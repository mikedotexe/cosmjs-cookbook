import {fromBech32, toBech32} from '@cosmjs/encoding'
const start = async () => {
    const ibossptk = "osmo1tt88g9jta96ghh8m4wk2rzp8x55hmsadf3p8ep"
    const from = fromBech32(ibossptk).data
    const to = toBech32("stars", from)
    console.log("dude's stargaze account, send him a bad kid", to)
}

// Calls start function
(() => start())()
