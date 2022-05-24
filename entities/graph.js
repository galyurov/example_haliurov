import Vue from "vue"
import Path from './path'
import Passport from './passport'
import parsers from "../services/parsers";

export const UPDATE_STATUS = {
    SUCCESS : 0,
    START_ERROR : 1,
    END_ERROR : 2
};

export default class Graph {
    id = null
    graphModel = {}
    startBPLayer = []
    middleBPLayer = []
    endBPLayer = []
    path = null
    built = false
    chain = null
    _existingPassport = null
    _vue = new Vue()

    constructor(id, chain, existingPassport) {
        this.chain = chain
        this.id = id
        if (existingPassport) {
            this._existingPassport = existingPassport.clone()
        }
    }

    getAllBlocks() {
        return [
            ...this.startBPLayer,
            ...this.middleBPLayer.flatMap(e => e),
            ...this.endBPLayer
        ]
    }

    get middleBPLayerBPs() {

        let output = []

        for (let layer of this.middleBPLayer) {
            layer.forEach(item => {
                item?.children?.length && (output = [...output, ...item.children.map(i=>i.bp.id)])
            })
        }

        return output

    }

    save(name, onSaved, bpChain) {

        this.setPicked()
        this.setManualLinks()

        let passport = new Passport(
            {
                name: name,
                model: this.graphModel
            },
            this.chain
        )

        passport.createOnAPI(bpChain).then(result => {
            onSaved(result.data.id)
        })
    }

    async complete(onSaved) {

        let bpChain = []

        if (this.path.isCompleted()) {
            bpChain = this.path.list
        }

        this.setPicked()

        if (this._existingPassport) {
            this._existingPassport.setModel(this.graphModel)
            this._existingPassport.chain = this.chain
            this._existingPassport.updateOnAPI().then(() => onSaved(this._existingPassport.data.id))
        } else {
            this.save("Новая сквозная цепочка", onSaved, bpChain)
        }
    }

    setPicked() {
        const lastPathBp = this.path?.list?.at(-1)?.[0]?.children?.[0]
        const endBpLayer= this.endBPLayer?.[0]?.[0]?.children?.[0]
        if(lastPathBp?.bp?.id !== endBpLayer?.bp?.id){
            this.path.push(this.endBPLayer[0])
        }
        let flat = this.path.getFlatBpList()

        this.graphModel.forEach(type => {
            type.bps.forEach(bp => {
                bp.picked = flat.includes(bp?.bp?.id)
            })
        })
    }

    async updateLayers() {}

    async buildGraphByAPI() {
        let [layers, existedPath] = await this._buildLayersOnApi()

        if (layers.length === 3) {
            this.startBPLayer = layers[0]
            this.middleBPLayer = layers[1]
            this.endBPLayer = layers[2] ?? []
        } else if (layers.length === 2 && !this.chain?.data?.mid.length) {
            this.startBPLayer = layers[0]
            this.middleBPLayer = []
            this.endBPLayer = layers[1]
        }

        this.path = new Path([this.startBPLayer[0], ...existedPath], this)
        this.built = true
    }

    setManualLinks() {
        const flatBps = this.path.getFlatBp()

        this.graphModel.forEach(layer => {
            layer.bps.forEach(bp => {
                const pathBp = flatBps.filter(e => e.bp.id === bp.bp.id )[0]
                if (pathBp) {
                    bp.links = pathBp.links
                } else if (bp.links === undefined) {
                    bp.links = []
                }
            })
        })
    }

    deleteBlock(id, forceManual) {
        if(!this.chain.data.start.some(v => v.parent.id !== id)){
            return UPDATE_STATUS.START_ERROR
        }
        if(!this.chain.data.end.some(v => v.parent.id !== id ) && !forceManual){
            return UPDATE_STATUS.END_ERROR
        }

        this.chain.resetChainByGroup(id, 'start')
        this.chain.resetChainByGroup(id, 'end')

        let start = this.chain.data.start
        let end = this.chain.data.end

       return this._updateIfAvailable(start, end, forceManual)
    }

    deleteBPBlock(id, forceManual) {
        this.chain.resetChain(id, 'start')
        this.chain.resetChain(id, 'end')

        let start = this.chain.data.start
        let end = this.chain.data.end

        return this._updateIfAvailable(start, end, forceManual)
    }

    async _buildLayersOnApi() {
        let existedBpS = []
        let existedPath = []
        let layers = []

        if (this._existingPassport) {
            existedBpS = this._existingPassport.data.model.flatMap(e => e.bps).filter(e => e.picked)
        }


        await this._vue.$repo('bp/e2e').buildModelOptions(this._makeOptions())
            .then((result) => {
                this.graphModel = JSON.parse(JSON.stringify(result.data))
                layers = parsers.parseGraph(
                    result.data,
                    (bp, parent, type) => {
                        if (type === 'START' || type === 'END') { return }
                        if (existedBpS?.map(e => e.bp.id).includes(bp.id)) {
                            bp.picked = true
                            existedPath.push([parent])
                        }
                    })
            })

        return [layers, existedPath]
    }

    _makeOptions() {
        return {
            midMeaning: this.chain?.midMeaning,
            START: this.chain?.data?.start?.map(e => { return {id: e.id}}),
            MID: this.chain?.data?.mid?.map(e => { return {id: e.id}}),
            END: this.chain?.data?.end?.map(e => { return {id: e.id}}),
        }
    }

    _updateIfAvailable(start, end, forceManual) {
        if (start.length === 0) { return UPDATE_STATUS.START_ERROR }
        if (end.length === 0 && !forceManual) { return UPDATE_STATUS.END_ERROR }

        this.chain.data.start = start
        this.chain.data.end = end

        this._resetGraph()

        return UPDATE_STATUS.SUCCESS
    }

    _resetGraph() {
        this.startBPLayer = []
        // this.middleBPLayer = []
        this.endBPLayer = []
        this.path = null
        this.built = false
    }
}
