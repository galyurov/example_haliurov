import Graph, { UPDATE_STATUS } from "./graph"
import Path from "./path";

export default class ManualGraph extends Graph {
    _onLayerUpdated = () => {}

    constructor(id, chain, existingPassport, onLayerUpdated) {
        super(id, chain, existingPassport)
        this._onLayerUpdated = onLayerUpdated
    }

    getLastBlockLayerIndex() {
        return this.getAllBlocks().find(e => e.isLast)?.layerIndex
    }

    getLayersCount() {
        let length = this.middleBPLayer.length
        if (this.middleBPLayer[length - 1].length === 0) {
            return length - 1
        }
        return length
    }

    hasLastBlocks() {
        return !!this.getAllBlocks().find(e => e.isLast)
    }

    unsetLastBlocks() {
        this.getAllBlocks()
            .filter(e => e.isLast)
            .forEach(e => e.isLast = false)
    }

    complete(onSaved) {
        // if (!this.path.isCompleted()) { return }

        this._setManualSelected()
        this.setManualLinks()

        super.complete(onSaved)
    }

    save(name, onSaved) {
        // if (!this.path.isCompleted()) { return }

        this._setManualSelected()

        super.save(name, onSaved)
    }

    async buildGraphByAPI() {
        let [layers, existedPath] = await this._buildLayersOnApi()

        this.startBPLayer = layers[0]
        this.middleBPLayer = layers[1]
        this.endBPLayer = layers[2] ?? []

        this.path = new Path([this.startBPLayer[0], ...existedPath], this)
        this.built = true
    }

    async updateLayers(block) {
        // Cut all values
        this.middleBPLayer = this.middleBPLayer.slice(0, block.layerIndex)
        this.graphModel = this.graphModel.slice(0, block.layerIndex + 1)
        const availableBlocks = this.startBPLayer?.concat(this.middleBPLayer)
            .flatMap(e => e)
            .flatMap(e => e?.children)
            .map(e => String(e?.layerLink))

        this._onLayerUpdated(availableBlocks)

        await this._vue.$repo('bp/e2e').getNextChild(block.children[0].bp.id)
            .then((result) => {
                let parents = []
                let links = []

                let data = result.data
                if (data.length > 0) {
                    this.graphModel.push( { type: "MID", bps: JSON.parse(JSON.stringify((data))) })

                    data.forEach(bp => {
                        let parent = bp?.bp?.parent

                        bp.bp.parent = null

                        parent.layerIndex = this.middleBPLayer.length + 1
                        parent.children = []

                        parent.children.push(bp)
                        parents.push(parent)
                        links.push({bp: {id: bp?.bp?.id, layerLink: `${bp?.bp?.id}-${parent.layerIndex}`}})
                    })

                    this.middleBPLayer.push(parents)
                }
                block.children[0].links = links
            })
    }

    _setManualSelected() {
        // логика для сохранения только одного конечного БП:
        //
        // const lastBlocks = this.middleBPLayer.map(e => {
        //     return {
        //         bp: e.filter(e => e.isLast)[0]
        //     }
        // }).filter(e => e['bp']).flatMap(e => {
        //     e.bp.children.forEach(e => e.links = [])

        //     return e.bp.children
        // })

        let lastBlocks = this.middleBPLayer
            .flatMap(layer => layer)
            .filter(group => group.isLast)
            .flatMap(group => group.children)
        lastBlocks.forEach(e => e.links = [])

        if (lastBlocks.length > 0 && !this.graphModel.some(v=> v.type === 'END'))
            this.graphModel.push({
                type: "END",
                bps: lastBlocks
            })
    }

    _updateIfAvailable(start, end) {
        if (start.length === 0) {
            return UPDATE_STATUS.START_ERROR
        }

        this.chain.data.start = start
        this.chain.data.end = end

        this._resetGraph()

        return UPDATE_STATUS.SUCCESS
    }
}
