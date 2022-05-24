import storeService from "../services/store_service"
import Vue from "vue"

export const CHAIN_CREATE_ID = -1


export default class Chain {
    passportId = null
    midMeaning = 'ONLY' // default
    data = {
        start: [],
        mid: [],
        end: []
    }
    groups = []
    _vue = new Vue()

    constructor(passportId = CHAIN_CREATE_ID) {
        this.passportId = passportId
        storeService.storeChain(this)
    }

    saveToStore() {
        storeService.storeChain(this)
    }

    isFullFilled() {
        return this.data.start.length && this.data.end.length
    }

    extend(mode, bps) {
        if (!this.data[mode] || !Array.isArray(bps)) return
        bps.forEach((v)=> {
            if(this.data[mode].some(el => el.id === v.id)){ return }
            this.data[mode].push(v)
        })
        // this.data[mode] = [...this.data[mode], ...bps]
        this._setChainGroups()
    }
    // changeMidType(type){
    //     this.midMeaning = type
    // }

    // checkMidType(){
    //     const editedChain = BP_CROSS_CHAIN_STATE.state.isChainEdited
    //     if (this.passportId <= 0 && !editedChain){
    //
    //         this.changeMidType('ALL')
    //
    //     } else if(this.passportId <= 0 && editedChain === 'mid'){
    //         this.changeMidType('ONLY')
    //
    //     } else if(this.passportId > 0 && (!editedChain || editedChain === 'mid')){
    //         this.changeMidType('ONLY')
    //
    //     }
    //
    //
    // }

    set(mode, bps) {
        if (!this.data[mode] || !Array.isArray(bps)) return
        this.data[mode] = bps
        this._setChainGroups()
    }

    resetChainByGroup(id, mode) {
        const group = this.groups.find(({bp}) => bp.id === id)
        if (!group || !group[mode]) return
        this.data[mode] = this.data[mode].filter(bp => !group[mode].includes(bp.id))
        group[mode] = []
    }

    resetChain(id, mode) {
        if (!this.data[mode]) return
        this.data[mode] = this.data[mode].filter(bp => bp.id !== id)
        this._filterGroupsByChainSet(this.data[mode].map(i => i.id), mode)
    }

    setGroupFromBpSelector(childBp, sourceList, mode) {
        const add = (parent) => {
            let index = this.groups.findIndex(i => i.bp.id === parent.id)
            index !== -1
                ? this.groups[index][mode].push(childBp.id)
                : this.groups.push({bp: parent, [mode]: [childBp.id]})
        }
        const iterate = (list) => {
            if (!Array.isArray(list)) return
            for(let parent of list) {
                if (!parent) continue
                const children = parent.list || parent.children
                if (children?.find(i => i.id === childBp.id)) {
                    add(parent)
                    break
                }
                iterate(children)
            }
        }
        iterate(sourceList)
    }

    _setChainGroups() {
        this._setGroupFromChainSet(this.data.start, 'start')
        this._setGroupFromChainSet(this.data.mid, 'mid')
        this._setGroupFromChainSet(this.data.end, 'end')

        this._filterGroupsByChainSet(this.data.start.map(i => i.id), 'start')
        this._filterGroupsByChainSet(this.data.mid.map(i => i.id), 'mid')
        this._filterGroupsByChainSet(this.data.end.map(i => i.id), 'end')

        return this.groups
    }

    _setGroupFromChainSet(chainSet, mode) {
        chainSet.forEach(c => {
            let parent
            if (!c.parent) {
                parent = this.groups.find(g => g[mode]?.includes(c.id))
                parent && (c.parent = parent.bp)
            } else {
                parent = this.groups.find(g => g.bp.id === c.parent.id)
                parent ? parent[mode].push(c.id) : this.groups.push({bp: c.parent, [mode]: [c.id]})
            }
            Array.isArray(c.children) && delete c.children
            Array.isArray(c.parent?.children) && delete c.parent.children
            c.parent && !c.parent.id && delete c.parent
        })
    }

    _filterGroupsByChainSet(chainSet, mode) {
        this.groups.forEach(group => {
            group[mode] = !chainSet.length ? [] : (group[mode]?.filter(bpId => chainSet.includes(bpId)) || [])
            group[mode].length && (group[mode] = this._vue.$utils.uniq(group[mode]))
        })
    }

    clearEndOfChain(){
        this.data.end = []
        this.data.mid = []
        const endGroup = this.groups.findIndex((v) => {
            return v.end.length !== 0
        })
        if(endGroup != -1) {
            this.groups.splice(endGroup, 1)
        }
    }
}
