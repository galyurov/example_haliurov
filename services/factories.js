import storeService from "./store_service";
import Passport from "../entities/passport";
import ManualGraph from "../entities/graph_manual";
import Graph from "../entities/graph";
import { Block, BlockAccented, BlockAccentedManual } from "../entities/block";
import Chain from "../entities/chain";
import Vue from "vue";


let _vue = new Vue()


export default {
    async createGraph(passportId, onManualModeLayerUpdated) {
        let graph = null
        let chain = storeService.getChain(passportId)
        let existing_passport = null

        if (passportId > 0) {
            await this.getPassportFromAPI(passportId).then((passport) => {
                existing_passport = passport
                if (chain) {
                    // перезаписываем, так как сейчас в сторе chain из загруженного паспорта
                    // а нужна текущая, так как она могла редактироваться
                    storeService.storeChain(chain)
                } else {
                    chain = passport.chain
                }
            })
        }

        // let endLayer = existing_passport?.data.model.find(e => e.type === "END")?.bps

        if (chain?.data?.end?.length) {
            graph = new Graph(
                passportId,
                chain,
                existing_passport
            )
        } else {
            graph = new ManualGraph(
                passportId,
                chain,
                existing_passport,
                onManualModeLayerUpdated
            )
        }
        await graph.buildGraphByAPI()

        return graph
    },

    createBlock(data, layerIndex, graph) {
        if (graph) {
            return graph instanceof ManualGraph
                ? new BlockAccentedManual(data, layerIndex, graph)
                : new BlockAccented(data, layerIndex, graph)
        }
        return new Block(data, layerIndex, graph)
    },

    getOrCreateChain(passportId) {
        return storeService.getChain(passportId) || new Chain(passportId)
    },

    getPassportFromAPI(id) {
        return new Promise(resolve => _vue.$repo('bp/e2e')
            .getPassport(id)
            .then((result) => {
                let chain = new Chain(result.data.id)
                chain.set('start', result.data.params['START'])
                chain.set('mid', result.data.params['MID'])
                chain.set('end', result.data.params['END'])

                resolve(new Passport(result.data, chain))
            })
        )
    },
}
