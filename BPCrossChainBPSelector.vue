<template>
    <BpSelector
        ref="bpSelector"
        @setup="s => selector = s"
        :modal="modal === true"
        :data="selectorData"
        class="bp-selector"
        @select="select"
        @unselect="unselect"
        @onload="onLoad"
    >
        <div slot="header" class="bp-selector-header">
            <p class="bp-selector-prompt">
                Выберите БП 3-го уровня, которые будут {{
                    chainMode === 'start' ? 'начальными' : chainMode === 'end' ? 'конечными' : 'промежуточными'
                }} БП сквозной цепочки
            </p>
            <div class="bp-selector-item" v-for="bp in getCurrentSelected()" :key="bp.id">
                [{{ bp.code | cutHtml }}] <span @click="unselect(bp)">&times;</span>
            </div>
            <button
                v-if="getCurrentSelected().length"
                class="bp-selector-clear"
                type="button"
                @click="clearAllSelected"
            >
                <svg
                    class="fixed-table__button-icon"
                    width="18"
                    height="18"
                    focusable="false"
                >
                    <use href="@/assets/images/sprites.svg#blue-basket"></use>
                </svg>
                <span class="font-blue-13r">
                  Очистить все
                </span>
            </button>
        </div>
        <template v-slot:search>
            <button class="button submit-button" @click="onReady">Применить</button>
        </template>
    </BpSelector>
</template>

<script>
import BpSelector from "@/views/shared/BpSelector3";

import {BP_CROSS_CHAIN_SET_NAMES, BP_CROSS_CHAIN_STATE_NAME} from "./bp_cross_chain.state"
import storeService from "./services/store_service"

import {CHAIN_CREATE_ID} from "@/views/bp_cross_chain/entities/chain";

export default {
    name: "BPCrossChainBPSelector",
    components: {BpSelector},
    props: {
        mode: String,
        id: Number,
        chainId: Number,
        modal: Boolean,
        bpFilter: Array,
        data: Object,
    },
    data() {
        const chain = storeService.getChain(this.data?.id || this.id|| this.chainId || CHAIN_CREATE_ID)
        return {
            selector: null,
            chain,
            sourceList: [],
            sourceListLevels: [],
            disabled: [],
            parents: {},
            selectedBackup: null,
            bpFilterLocal: null
        }
    },
    computed: {
        selectorData() {
            let repo
            switch (this.chainMode) {
                case 'mid':
                    repo = () => this.$repo('bp/tree').crossChainFilterMid({
                        es: this.chain.data.start.map(i=>i.id),
                        ee: this.chain.data.end.map(i=>i.id),
                        lvl: 3,
                        p: true
                    })
                    break
                case 'start':
                    repo = () => this.$repo('bp/tree').crossChainFilterMid({
                        so: this.chain.data.start.map(i=>i.id),
                        lvl: 3,
                        p: true
                    })
                    break
                case 'end':
                    repo = () => this.$repo('bp/tree').crossChainFilterMid({
                        si: this.chain.data.end.map(i=>i.id),
                        lvl: 3,
                        p: true
                    })
                    break
                default:
                    repo = null
            }
            const selectorData = {
                bpLevel: 3,
                selectBpLevel: this.chainMode === 'mid' ? 0 : 3,
                selectedBP: this.selectedTotal,
                publicated: true,
                isDisableFunc: this.isDisableFunc,
                isSelectedFunc: this.isSelectedFunc,
                mode: this.mode,
                getRepo: repo
            }
            // в bpFilterLocal приходят данные из bpMiddleLayer -> соответственно если мы исключаем из графа какой-то бп,
            // то при следующем фильтре он уже не отображается в дереве
            // так как его нет в bpFilterLocal

            // this.bpFilterLocal?.length && (selectorData.isVisibleFunc = this.isVisibleFunc)
            return {...selectorData, ...(this.data || {})}
        },
        selected() {
            return this.selector?.selected?.length ? this.selector.selected : []
        },
        selectedTotal() {
            let total = []
            Object.keys(this.chain.data).forEach(mode => (mode === 'start' || mode === 'end') && ( total = [...total, ...this.chain.data[mode]]))
            return total
        },
        chainMode() {
            return this.data?.mode || this.mode
        }
    },
    beforeRouteEnter(to, from, next) {
        next(vm => {
            if (BP_CROSS_CHAIN_SET_NAMES.includes(vm.chainMode)) return
            vm.$router.replace({name: 'BPCrossChainModelOptions'})
        })
    },
    created() {
        Object.keys(this.chain.data).forEach(mode => {
            if (mode === this.chainMode) return
            mode !== 'mid' && this.chain.data[mode].length && (this.disabled = [
                ...this.disabled, ...this.chain.data[mode].map(i=>i.id)
            ])
        })
        if( this.bpFilter ) this.bpFilterLocal = this.bpFilter
    },
    methods: {
        showModal() {
            this.modal && this.$modal.show('bp_selector_3', this.selectorData)
        },
        isSelectedFunc(bp) {
            return !!(this.disabled.includes(bp.id) || this.selected.find(i=>i.id===bp.id) || this.findSelectedChildren(bp))
        },
        findSelectedChildren(bp){
            const child = bp?.children || bp[0]?.children
            return child?.length && child?.every((v) => {
                if(v?.hasChildren && v?.children){
                    return this.findSelectedChildren(v)
                }
                return this.selected?.some(sel => sel?.id === v?.id)
            })
        },
        isDisableFunc(bp) {
            return Boolean(this.disabled.includes(bp.id))
        },
        isVisibleFunc(bp) {
            if (this.bpFilterLocal.includes(bp.id)) return true
            const children = this.selector.getChildren(bp).map(i=>i.id)
            return children.length && children.some(id => this.bpFilterLocal.includes(id))
        },
        getCurrentSelected() {
            const parents = this.sourceListLevels.length ? [...this.sourceListLevels[0], ...this.sourceListLevels[1]] : []
            const selected = this.selected.filter(bp => !parents.includes(bp.id) && !this.disabled.includes(bp.id))
            return this.$utils.uniqBy(selected, 'id')
        },
        onLoad(bpList) {
            if (this.sourceList.length) return
            this.sourceList = bpList
            this.sourceListLevels = this.selector.levels
            for (let group of bpList.groups) {
                this.selector.getParents(group.list, this.parents)
                if (this.bpFilterLocal?.length) {
                    this.selector.treeWalk(group.list, bp => {
                        if (this.bpFilterLocal.includes(bp.id) && !this.selected.find(i=>i.id===bp.id))
                            this.selected.push(bp)
                    })
                }
            }
            if (this.bpFilterLocal?.length) {
                this.createChainFromBPSelector()
            } else {
                this.mode === 'mid' && this.sourceList?.groups?.flatMap(v => v.list)?.forEach(el=> this.select(el, false))
            }
            this.selectedBackup = this.$utils.deepCopy(this.selected)
        },
        onReady() {
            this.$store.commit(`${BP_CROSS_CHAIN_STATE_NAME}/chainEdited`, this.isSelectedChanged()  ? this.mode : false)
            this.createChainFromBPSelector()
            this.modal ?
                this.$modal.hide('bp_selector_3') :
                this.chainId ? this.$router.replace({name:'BPCrossChainModelOptions', params:{id: this.chainId}}) :
                    this.$router.go(-1)
        },
        createChainFromBPSelector() {
            const selected = this.filterSelected(this.selected)

            if (!selected.length) return

            const mode = this.chain.data[this.chainMode].map(bp => bp.id)

            selected.forEach(bp => {

                if (mode.includes(bp.id) && this.chain.groups.some(group => group[this.chainMode]?.find(id => id === bp.id))) return

                this.chain.setGroupFromBpSelector(bp, this.sourceList.groups, this.chainMode)
            })

            this.chain.set(this.chainMode, this.$utils.uniqBy(selected, 'id'))
        },
        filterSelected(selected) {

            if (selected.length) {

                const selectedLevel = this.sourceListLevels[2] // выбор БП 3-го уровня

                if (!selectedLevel?.length) {
                    return []
                }

                selected = selected.filter(bp => selectedLevel.includes(bp.id) && !this.disabled.includes(bp.id))
            }
            return selected
        },
        select(bp) {
            this.chain.set(this.chainMode, this.filterSelected(this.selected))

            if (bp.children?.length) {
                const children = this.selector.getChildren(bp)

                children.forEach(bp => {
                    if (this.disabled.includes(bp.id)) return
                    this.selected.find(i=>i.id===bp.id) || this.selected.push(bp)
                })
            }
        },
        unselect(bp) {
            this.selector.unselect(bp)

            const index = this.selected.findIndex(i=>i.id===bp.id)

            index >= 0 && this.selected.splice(index, 1)

            // this.chain.resetChain(bp.id, this.chainMode)

            if (bp.children?.length) {

                const children = this.selector.getChildren(bp).map(i=>i.id)

                children.forEach(id => {
                    if (this.disabled.includes(id)) return
                    const index = this.selected.findIndex(bp=>bp.id===id)
                    index >= 0 && this.selected.splice(index, 1)
                    // this.chain.resetChain(id, this.chainMode)
                })
            }

            this.chain.set(this.chainMode, this.filterSelected(this.selected))

            this.unselectParents(bp)
        },
        unselectParents(bp) {

            const parents = this.selector.getPath(this.parents, bp.id)

            // const parent = parents[parents.length-1]
            //
            // const children = this.parents[parent]
            //
            // if (children && this.selected.find(bp => children.includes(bp.id))) return

            parents.forEach(parent => {
                const index = this.selected.findIndex(bp => bp.id === parent)
                index >= 0 && this.selected.splice(index, 1)
            })

        },
        isSelectedChanged(){
            const selectedIds = this.selected?.map(v=> v.id)
            const backupsIds = this.selectedBackup?.map(v=> v.id)

            if(selectedIds?.length !== backupsIds?.length){
                return true
            } else {
                return selectedIds?.some(v=> !backupsIds?.includes(v))
            }
        },
        clearAllSelected(){
            this.bpFilterLocal = null
            this.getCurrentSelected().forEach(v=> this.unselect(v))
            this.$refs.bpSelector.search()
        }
    }
}
</script>

<style lang="sass" scoped>
.bp-selector
    /deep/ .search-wrapper
        display: flex
        align-items: flex-start
        justify-content: stretch

    .submit-button
        padding: 17px
        width: 120px
        margin-left: 40px

    &-header
        position: relative
        margin-bottom: 40px
        padding-right: 110px
        display: flex
        flex-wrap: wrap
        align-items: center
        justify-content: stretch

        /deep/ & + .modal__list .modal__list-item
            padding-bottom: 10px

    &-prompt
        display: inline-block
        color: var(--blue-color)
        margin-right: 30px

    &-item
        background-color: var(--blue-color)
        color: #fff
        margin: 5px 10px
        padding: 5px 30px 5px 15px
        font-size: 13px
        border-radius: 20px
        position: relative

        > span
            cursor: pointer
            position: absolute
            right: 9px
            top: 1px
            font-size: 1.5em

    /deep/ .modal__header
        row-gap: 0

        &-wrapper
            column-gap: 0

            .search-query.modal__search
                width: 82%
    &-clear
        padding: 0
        background-color: transparent
        border: none
        display: flex
        align-items: center
        column-gap: 10px
        cursor: pointer

        position: absolute
        right: 0
        top: 12px

</style>
