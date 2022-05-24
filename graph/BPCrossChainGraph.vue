<template>
    <div>
        <Header
            :isCompleted="isPathCompleted"
            :canSave="isNewGraph"
            @close="close"
            @save="save"
            @next="next"
        />
        <div v-if="showGraph" class="bp-cross-chain-graph-content">
            <template v-for="(point, index) in points">
                <svg
                    class="bp-cross-chain-graph-svg"
                    :key="index+point.x1"
                    shape-rendering="geometricPrecision"
                    :ref="point.pointBpStart+'-'+point.pointBpEnd"
                >
                    <defs>
                        <marker :id="`arrowhead${index}`" class="marker" markerWidth="10" markerHeight="7" refX="-10" refY="3.5" orient="0deg">
                            <polygon class="polygon" points="0 0, 10 3.5, 0 7" fill="black"/>
                        </marker>
                    </defs>

                    <g
                        class="svg-menu__path__selection"
                        cursor="pointer"
                        pointer-events="all"
                    >
                        <line
                            class="bp-cross-chain-graph-line"
                            :marker-end="`url(#arrowhead${index})`"
                            :x1="point.x1"
                            :x2="point.x2"
                            :y1="point.y1"
                            :y2="point.y2"
                            @mouseenter="hoverGraphLine"
                            @mouseleave="hoverGraphLine"
                        />
                        <line
                            pointer-events="none"
                            class="bp-cross-chain-graph-line"
                            :x1="point.x2"
                            :x2="point.x2 + 10"
                            :y1="point.y2"
                            :y2="point.y2"
                        />
                    </g>
                </svg>
            </template>
            <div class="bp-cross-chain-graph-steps">
                <Step
                    v-if="isStartBPLayer"
                    ref="start"
                    title="Начальные процессы СЦ"
                    :graph="graph"
                    :steps="graph.startBPLayer"
                    :accented="true"
                    :isEditing="true"
                    :isStartLayer="true"
                    :onEdit="onEditStart"
                />
                <Step
                    v-if="isMiddleBPLayer"
                    ref="middle"
                    title="Промежуточные процессы"
                    :graph="graph"
                    :steps="graph.middleBPLayer"
                    :accented="false"
                    :isEditing="!isManualMode"
                    :onEdit="onMidStart"
                />
                <Step
                    v-if="isEndBPLayer"
                    ref="end"
                    title="Конечные процессы СЦ"
                    :graph="graph"
                    :steps="graph.endBPLayer"
                    :accented="true"
                    :isEditing="true"
                    :onEdit="onEndStart"
                />
            </div>
        </div>
        <ConfirmationModal name="cross-chain-save">
            <CustomInput
                v-model="bpCrossChainName"
                placeholder="Название сквозной цепочки"
            />
            <h4 class="cross-chain-save-error" v-show="isErrorName">Заполните название сквозной цепочки</h4>
        </ConfirmationModal>
        <RemoveGraphModal/>
        <StateAlert/>
        <ResetAlert/>
    </div>
</template>

<script>
import Header from './BPCrossChainGraphHeader.vue'
import Step from './BPCrossChainGraphStep.vue'
import RemoveGraphModal from './RemoveGraphModal.vue'
import ConfirmationModal from "@/views/shared/ConfirmationModal";
import factories from "../services/factories";
import ManualGraph from "../entities/graph_manual";
import StateAlert from "./alert/BPCrossChainGraphStateAlert.vue";
import ResetAlert from "./alert/BPCrossChainGraphResetAlert.vue";
import { UPDATE_STATUS } from "../entities/graph"
import {mapState} from "vuex";
import {BP_CROSS_CHAIN_STATE_NAME} from "../bp_cross_chain.state";

export default {
    name: "BPCrossChainGraph",
    components: {Header, Step, ConfirmationModal, RemoveGraphModal, StateAlert, ResetAlert},
    props: {
        isNewGraph: Boolean,
        id: Number,
    },
    provide() {
        return {
            onBPBlockCreated: this.positionedGraph,
            onDeleteBlock: this.deleteBlock,
            onDeleteBPBlock: this.deleteBPBlock,
        }
    },
    data() {
        return {
            graph: null,
            points: [],
            bpBlockDivs: {},
            bpCrossChainName: "",
            isManualMode: false,
            isErrorName: false,
            isGraphEdited: false,
            backupPathList: []
        }
    },
    watch:{
        'graph.path.list'(pathList){
            this.$nextTick(() => {
                this.inHighlightPathLine()
                this.highlightLines(pathList)
            })
        },
        'graph.middleBPLayer': {
            deep: true,
            handler(middleBPLayer) {
                if (!middleBPLayer?.length) return

                this.highlightLines()

                const lastBPs = middleBPLayer.at(-1).filter(bp => bp.isLast);
                let prevBPs = [];

                if (lastBPs?.length && middleBPLayer.length === 1) {
                    prevBPs = this.graph.startBPLayer[0]
                }

                if (lastBPs?.length && middleBPLayer.length > 1) {
                    prevBPs = middleBPLayer.at(-2)
                }

                prevBPs
                    .flatMap(bp => bp.children)
                    .forEach(child => (
                        lastBPs.forEach(l =>
                            this.highlightPathLine(child.layerLink + '-' + l?.children[0].layerLink))
                        )
                    )
            }
        },
        isPathCompleted: {
            immediate: true,
            handler(val, oldVal) {
                if(val !== oldVal && oldVal !== undefined ) {
                    this.isGraphEdited = true
                }

                if (val && this.graph.endBPLayer.length) {
                    let [prevBPs] = this.graph.path.list.at(-1)

                    this.$nextTick(this.highlightLines)

                    prevBPs.children.forEach(child => (
                        this.graph.endBPLayer[0].forEach(l =>
                            setTimeout(() => {
                                this.highlightPathLine(child.layerLink + '-' + l?.children[0].layerLink)
                            }, 0)
                        )
                    ))
                }
            },
        }
    },
    beforeDestroy() {
        this.$store.commit(`${BP_CROSS_CHAIN_STATE_NAME}/chainEdited`)
    },
    async created() {
        const buttons = [
            {
                text: 'Изменить параметры',
                on: { click: () => {
                        factories.getOrCreateChain(this.id)
                        this.$router.push({ name: 'BPCrossChainModelOptions', params:{id: this.id}})
                    }}
            }
        ]
        if(!this.isNewGraph){
            buttons.unshift({
                text: `Вернуться`,
                bind: {class: 'button'},
                on: { click: () => this.$router.back() }
            })
        }
        this.$rs.useHandler({
            repo: 'bp/e2e',
            method: 'buildModelOptions',
            onCatch: (e) => {
                if(e.response.data.error === "Forbidden") {
                    this.$router.replace({ name: 'Forbidden' })
                } else if(!this.chain?.data?.start?.length){
                    this.$modal.show('reset_bp_chain', {
                        onOk: () => {
                            this.$router.push({name: 'BPCrossChainBPSelector', params: {id: this.id, mode: 'start'}})
                        },
                        onCancel: () => {
                            this.$router.push({name: 'BPCrossChainModelOptions', params: {id: this.id}})

                        }
                    })
                } else {
                    this.$confirm({
                        type: 'danger',
                        title: 'Внимание!',
                        text: e.response.data.message || e.message,
                        buttons
                    })
                }
            }
        })
        await this.loadGraph()
        if(this.isChainEdited){
            if(this.graph.chain?.data?.mid?.length !== this.graph.middleBPLayer?.length){
                const arr = this.graph.middleBPLayer.flatMap(v=> v).map(el=> el.children[0].bp)
                this.graph.chain.data.mid = arr
            }
            this.graph.path.resetPath()
        }
    },
    computed: {
        ...mapState(BP_CROSS_CHAIN_STATE_NAME, {
            isChainEdited: state => state.isChainEdited,
            chain: state => state.chain,
        }),
        showGraph() {
            return this.graph?.built
        },
        isStartBPLayer() {
            return this.graph?.startBPLayer.length > 0
        },
        isMiddleBPLayer() {
            return this.graph?.middleBPLayer.length > 0
        },
        isEndBPLayer() {
            return this.graph?.endBPLayer.length > 0
        },
        isPathCompleted() {
            return this.graph?.path?.isCompleted()
        }
    },
    methods: {
        async deleteBlock(block) {
            const status = await this.graph.deleteBlock(block.id)

            this.handleUpdateStatus(status, block.id)
        },
        async deleteBPBlock(block) {
            const status = await this.graph.deleteBPBlock(block.bp.id)

            this.handleUpdateStatus(status)
        },
        handleUpdateStatus(status, blockId) {
            if (status === UPDATE_STATUS.SUCCESS) {
                this.loadGraph()
            } else if (status === UPDATE_STATUS.START_ERROR) {
                this.$modal.show('reset_bp_chain', {
                    onOk: () => {
                        this.graph.chain.saveToStore()
                        this.$router.push({name: 'BPCrossChainBPSelector', params: {id: this.id, mode: 'start'}})
                    }
                })
            } else {
                this.$modal.show('state_bp_chain', {
                    onManual: () => {
                        this.graph.deleteBlock(blockId, true)
                        this.loadGraph()
                    },
                    onSettings: () => {
                        this.graph.chain.saveToStore()
                        this.$router.push({name: 'BPCrossChainBPSelector', params: {id: this.id, mode: 'end'}})
                    }
                })
            }
        },
        positionedGraph(val) {
            this.bpBlockDivs[val.bp.layerLink] = val
            this.updatePoints()
        },
        updatePoints() {
            var points = []
            Object.entries(this.bpBlockDivs).forEach(element1 => {
                let outCount = element1[1].bp?.links?.length

                element1[1]?.bp?.links?.sort((a,b)=> {
                    const start =this.bpBlockDivs[a.bp?.layerLink]?.offset?.top + this.bpBlockDivs[a.bp.layerLink]?.offset?.height / 2
                    const end =this.bpBlockDivs[b.bp?.layerLink]?.offset?.top + this.bpBlockDivs[b.bp.layerLink]?.offset?.height / 2
                    if( start > end){
                        return 1
                    }
                    return -1
                })
                element1[1].bp.links?.forEach((element, i) => {

                    let element2 = this.bpBlockDivs[element.bp.layerLink]
                    if (element2) {
                        if (element1[1].bp !== element2.bp && element1[1].offset.left !== element2.offset.left && element1[1].offset.left < element2.offset.left) {
                            points.push({
                                x1: element1[1].offset.left + element1[1].offset.width + 14,
                                y1: element1[1].offset.top + element1[1].offset.height / 4 + (i+1) * element1[1].offset.height / 2 / outCount,
                                x2: element2.offset.left - 34,
                                y2: element2.offset.top + element2.offset.height / 2,
                                pointBpStart: element1[1].bp.layerLink, // записываем id БП от которого строятся линии
                                pointBpEnd: element2.bp.layerLink // записываем id БП до которого строятся линии
                            })
                        }
                    }
                })
            })

            this.points = points;
        },
        async loadGraph() {
            this.graph = null
            this.graph = await factories.createGraph(
                this.id,
                (availableBlocks) => {
                    this.onManualModeLayerUpdated(availableBlocks)
                }
            )

            this.bpBlockDivs = {}
            this.isManualMode = (this.graph instanceof ManualGraph)

            this.$nextTick(() => this.$emit('setup', this))
        },
        onManualModeLayerUpdated(availableBlocks) {
            let bpBlockDivs = this.bpBlockDivs
            bpBlockDivs = Object.keys(this.bpBlockDivs).reduce(function (filtered, key) {
                if (availableBlocks.includes(key) && bpBlockDivs && bpBlockDivs[key]) {
                    filtered[key] = bpBlockDivs[key]
                }
                return filtered;
            }, {});
            this.bpBlockDivs = bpBlockDivs
            this.updatePoints()
        },
        onEditStart() {
            this.$router.push({name: 'BPCrossChainBPSelector', params: {id: this.id, mode: 'start'}})
        },
        onMidStart() {
            this.$router.push({name: 'BPCrossChainBPSelector', params: {id: this.id, mode: 'mid', bpFilter: this.graph.middleBPLayerBPs}})
        },
        onEndStart() {
            this.$router.push({name: 'BPCrossChainBPSelector', params: {id: this.id, mode: 'end'}})
        },
        save() {
            if(!this.isPathCompleted && !this.graph?.endBPLayer?.length) {
                this.$confirm({
                    type: 'danger',
                    text: 'Сквозная цепочка не была построена и не будет сохранена, т.к. не выбран конечный БП',
                    buttons: 'Вернуться'
                })
                return
            }
            if(!this.isNewGraph) {
                this.graph.complete(() => {
                    this.$store.commit(`${BP_CROSS_CHAIN_STATE_NAME}/chainEdited`)
                    this.$nextTick(() => this.highlightLines(this.graph.path.list))
                    this.isGraphEdited = false
                })
                return
            } else {
                this.$confirm('cross-chain-save', {
                    title: 'Введите название сквозной цепочки',
                    buttons: [{
                        text: 'Сохранить',
                        bind: {class: 'button button_font-weight_bold button_state_save'},
                        on: {
                            click: () => {
                                if(!this.bpCrossChainName) {
                                    this.isErrorName = true
                                } else {
                                    this.isErrorName = false
                                    this.graph.save(this.bpCrossChainName, (id) => {
                                        this.$store.commit(`${BP_CROSS_CHAIN_STATE_NAME}/chainEdited`)
                                        this.isGraphEdited = false
                                        this.$router.replace({
                                            name: 'BPCrossChainPassportEdit',
                                            params: {id: id}
                                        })
                                    })
                                }
                            }
                        }
                    }, {
                        text: 'Отменить',
                        on: {
                            click: () => {
                                this.bpCrossChainName = ''
                                this.$modal.hide('cross-chain-save')
                            }
                        }
                    }]
                })
            }

        },
        next() {
            this.graph.complete(id => {
                this.isGraphEdited = false
                this.$router.replace({
                    name: 'BPCrossChainPassportEdit',
                    params: {id: id}
                })
            })
        },
        close() {
            const back = () => {
                if(this.$route.params.id && this.$route.params.id != -1){
                    this.$router.replace({
                        name: 'BPCrossChainPassportEdit',
                        params: {id: this.$route.params.id}
                    })
                    return
                }
                this.$router.back()
            }


            if(this.isGraphEdited || this.isChainEdited){
                this.$modal.show('remove_graph', {
                    onRemove: () => {
                        this.$store.commit(`${BP_CROSS_CHAIN_STATE_NAME}/chainEdited`)
                        this.graph.chain.clearEndOfChain()
                        back()
                    },
                })
            } else {
                back()
            }

        },
        highlightLines(pathList){
            if (!pathList) {
                pathList = this.graph?.path?.list || [];
            }

            this.inHighlightPathLine();

            let prevBlocksLinks = [];

            pathList?.forEach((currentValue, index) => {
                if (index) {
                    prevBlocksLinks = pathList[index-1].flatMap(p => p.children.map(c => c.layerLink));
                }

                if (currentValue?.length) {
                    currentValue?.flatMap(p => p.children).forEach( child => {
                        prevBlocksLinks.forEach(l => this.highlightPathLine(l + '-' + child?.layerLink))
                    })
                }
            })
        },
        inHighlightPathLine(){
            const highLightedLines = document.querySelectorAll('.active-path-line')

            highLightedLines?.forEach(line => line.classList.remove('active-path-line'))
        },
        highlightPathLine(target){
            const svg = this.$refs[target]

            svg?.length && svg.forEach(line => line.classList.add('active-path-line'))
        },
        hoverGraphLine(event){
            const isHover = event.type === 'mouseenter';
            const svg = event.target.closest('svg')
            const classAction = isHover ? 'add' : 'remove';
            const marker = svg.querySelector('.marker')

            svg.classList[classAction]('hover')

            marker?.setAttribute('markerWidth', isHover ? 6 : 10)
            marker?.setAttribute('markerHeight', isHover ? 5 : 7)
            marker?.setAttribute('refX', isHover ? '-4' : '-10')
            marker?.setAttribute('refY', isHover ? '2.5' : '3.5')
            marker?.querySelector('polygon').setAttribute('points', isHover ? '0 0, 7 2.5, 0 5' : '0 0, 10 3.5, 0 7')
        },
    }
}
</script>

<style lang="sass" scoped>
.bp-cross-chain-graph-steps
    display: flex
    gap: 70px

.bp-cross-chain-graph-content
    width: 100%
    position: relative
    overflow: scroll
    height: 75vh

.bp-cross-chain-graph-svg
    overflow: visible
    z-index: 2
    pointer-events: none
    position: absolute
    left: 0
    top: 0
    width: 100%
    height: 100%
    .polygon
        fill: #004C97 !important

    &.hover
        z-index: 10

    .svg-menu__path__selection:hover
        line
            stroke-width: 2px

svg.active-path-line
    z-index: 3
    line
        stroke: #00ABAB !important
    .polygon
        fill: #00ABAB !important

.bp-cross-chain-graph-line
    stroke: #004C97

.cross-chain-save-error
    color: red
</style>
