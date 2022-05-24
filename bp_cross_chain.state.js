export const BP_CROSS_CHAIN_STATE_NAME = 'bp_cross_chain'
export const BP_CROSS_CHAIN_SET_NAMES = ['start', 'mid', 'end']


export const BP_CROSS_CHAIN_STATE = {
    namespaced: true,
    state: {
        chain: null,
        isChainEdited: false,
        // chains: [],
    },
    mutations: {
        saveChain: (state, chain) => {
            state.chain = chain
            // state.chains.push(chain)
        },
        clear: (state) => {
            state.chain = null
            // state.chains = []
        },
        chainEdited (state, value = false) {
            state.isChainEdited = value
            // state.chains = []
        },
    }
}
