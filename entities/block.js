import Vue from "vue"

export class Block {
    data = {}
    layerIndex = 0
    _vue = new Vue()

    constructor(data, layerIndex) {
        this.data = data
        this.layerIndex = layerIndex
    }

    isDeleted () {
        return true
    }

    isSelected () {}

    isDoubleBlock() {}

    isAvailable () {}

    changeSelected () {}

    isLastBlock () {
        return this.data.isLast ?? false
    }
}


export class BlockAccented extends Block {
    path = null

    constructor(data, layerIndex, graph) {
        super(data, layerIndex)
        this.graph = graph
        this.path = graph.path
    }

    isSelected () {
        return this.path.getFlatBpList()?.some((v)=> v === this.data?.children[0]?.bp?.id)
    }

    isDeleted () {
        return true
    }

    isDoubleBlock () {
        const pathBpList = this.path.getFlatBp()
        return pathBpList.some(v=> v.layerLink !== this.data.children[0]?.layerLink && v.bp.id === this.data.children[0]?.bp?.id)
    }

    isAvailable () {
        let lastBlockChildLinks = this.path.getFlatChildLinks()
        let blockChild = this.data.children.map(e => e.bp.id)

        return lastBlockChildLinks.some(r=> blockChild.indexOf(r) >= 0)
    }

    changeSelected() {
        if (this.isAvailable()) {
            this.path.updatePath(this.data, this.isSelected())
        }
    }

    resetPath (){
        this.path.resetPath()
    }
}


export class BlockAccentedManual extends BlockAccented {
    isDoubleBlock () {
        return super.isDoubleBlock()
    }

    isAvailable () {
        return super.isAvailable()
            && (this.graph.getLastBlockLayerIndex() !== this.data.layerIndex || !this.graph?.endBPLayer?.length)
    }

    canSelectAsLastBlock () {
        return this.isAvailable() && this.layerIndex === this.graph.getLayersCount() - 1
    }

    selectLast () {
        if(this.data.isLast){
            this.unSelectLastBp(this.data)
        } else {
            this.graph.chain?.data?.end.push(this.data.children[0].bp)
        }
        this._vue.$set(this.data, 'isLast', !this.data.isLast)
    }

    unSelectLastBp (bp) {
        const index = this.graph.chain?.data?.end.findIndex(v=> v.id === bp.children[0].bp.id)
        if(index !== -1){
            this.graph.chain?.data?.end.splice(index,1)
        }
    }

    changeSelected () {
        if (this.isAvailable()) {
            if (this.graph.hasLastBlocks()) {
                this._vue.$confirm({
                    type: 'danger',
                    title: 'Вы уже выбрали конечный БП',
                    text: 'Отменить выбор и продолжить построение цепочки?',
                    onConfirm: ()=> {
                        this.graph?.getAllBlocks()?.forEach( (bp) => {
                            if(!bp.isLast){ return }

                            this.unSelectLastBp(bp)
                            bp.isLast = false
                        })
                        this.path.updatePath(this.data)
                    }
                })
            } else {
                this.path.updatePath(this.data)
            }
        }
    }
}
