import store from '@/store'
import {BP_CROSS_CHAIN_STATE, BP_CROSS_CHAIN_STATE_NAME} from "../bp_cross_chain.state";

export default {
    getChain: (passportId) => {
        if (BP_CROSS_CHAIN_STATE.state.chain?.passportId === passportId) {
            return BP_CROSS_CHAIN_STATE.state.chain
        }
        // return BP_CROSS_CHAIN_STATE.state.chains.find(m => m.key === key)
    },
    storeChain: (chain) => {
        store.commit(`${BP_CROSS_CHAIN_STATE_NAME}/saveChain`, chain)
    },
    clear: () => {
        store.commit(`${BP_CROSS_CHAIN_STATE_NAME}/clear`)
    }
}
