import Vue from "vue"
import utils from "@/utils";

export default class Path {
    list = []
    graph = null
    _vue = new Vue()

    constructor(list, graph) {
        this.list = list
        this.graph = graph
    }

    isCompleted() {
        if (this.graph.middleBPLayer.some(e => e.flatMap(e => e).some(e => e.isLast))) {
            return true
        }

        const blockChildLinks = this.list.at(-1)[0].children.flatMap(e => e.links).map(e => e?.bp.layerLink).filter(i => i)
        const lastBlockChild = this.graph.endBPLayer.flatMap(e => e).flatMap(e => e.children).flatMap(e => e?.layerLink).filter(i => i)
        if (this.list.at(-1) && blockChildLinks.length && lastBlockChild.length) {
            return blockChildLinks.some(r=> lastBlockChild.indexOf(r) >= 0)
        }

        return false
    }

    push(block) {
        this.list.push(block)
    }

    async updatePath(block, isSelected) {
        const backUpList = utils.deepCopy(this.list)

        if(block.layerIndex > 0){
            const firstListBps = this.list.shift()
            this.list = [firstListBps, ...this.list.filter(l => l.some(b => b.layerIndex < block.layerIndex))]
        }

        await this.graph.updateLayers(block)

        if(!isSelected){
            this.list.push([block])
        } else if(block.layerIndex > 1 ){
            if(!backUpList[block.layerIndex]){
                this.list.splice(-1)
            }
        }
    }

    resetPath(){
        this.list.splice(1)
    }

    getFlatBp() {
        return this.list.flatMap(e => e)
            .flatMap(e => e?.children)
            .filter( e => e)
    }

    getFlatBpList() {
        return this.list.flatMap(e => e)
            .flatMap(e => e?.children)
            .map(e => e?.bp.id)
    }

    getFlatChildLinks() {
        return this.list.flatMap(e => e)
            .flatMap(e => e?.children)
            .flatMap(e => e?.links)
            .map(e => e?.bp.id)
    }
}
