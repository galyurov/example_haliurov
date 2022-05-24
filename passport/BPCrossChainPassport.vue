<template>
    <div>
        <template v-if="!printModel">
            <Header
                v-if="!isEditing && passport" :isEditing="isEditing" :onEdit="changeEditing"
                :passport="editingPassport"
                :onSave="saveChanges"
                :isCanEditing="isCanEditing"
                :onPrint="print"
            />
            <HeaderEdit
                v-else-if="passport"
                :isEditing="isEditing"
                :onEdit="cancel"
                :onSave="saveChanges"
                :onRemove="removeModal"
                :passport="editingPassport"
            />
        </template>
        <div class="bp-cross-chain">
            <div v-if="!printModel" :ref="'body'">
                <PassportBody
                    v-if="!isEditing && passport"
                    :passport="passport"
                />
                <Edit
                    v-else-if="editingPassport"
                    :passport="editingPassport"
                />
            </div>
            <div class="bp-cross-chain-graph-content" :ref="'container'">
                <template v-for="(point, index) in points">
                    <svg class="bp-cross-chain-graph-svg" :key="index">
                        <defs>
                            <marker id="arrowheadred" markerWidth="10" markerHeight="7"
                                    refX="-10" refY="3.5" orient="0deg">
                                <polygon points="0 0, 10 3.5, 0 7" fill="red"/>
                            </marker>
                            <marker id="arrowhead" markerWidth="10" markerHeight="7"
                                    refX="-10" refY="3.5" orient="0deg">
                                <polygon points="0 0, 10 3.5, 0 7" fill="black"/>
                            </marker>
                        </defs>
                        <g class="svg-menu__path__selection" cursor="pointer" pointer-events="all">
                            <line
                                class="bp-cross-chain-graph-line"
                                :style="{ stroke: lineStyle(point) }"
                                :marker-end="`url(#${arrowId(point)})`"
                                :x1="point.x1"
                                :x2="point.x2"
                                :y1="point.y1"
                                :y2="point.y2"
                            />
                            <line
                                v-on:click="clickLine(point)"
                                class="bp-cross-chain-graph-line-hides"
                                :x1="point.x1"
                                :x2="point.x2"
                                :y1="point.y1"
                                :y2="point.y2"
                            />
                            <line
                                class="bp-cross-chain-graph-line"
                                :style="{ stroke: lineStyle(point) }"
                                :x1="point.x2"
                                :x2="point.x2 + 10"
                                :y1="point.y2"
                                :y2="point.y2"
                            />
                        </g>
                    </svg>
                </template>
                <div v-if="bpLayer" class="bp-cross-chain-graph-steps">
                    <Step v-show="bpLayer && bpLayer.length > 0"
                          ref="middle"
                          title="Модель сквозной цепочки"
                          :steps="bpLayer"
                          :accented="false"
                          :isEditing="isEditing"
                          :onEdit="onEditChain"
                    />
                </div>
                <div v-else-if="bpPath">
                    <template v-if="!printModel">
                        <h4 class="bp-cross-chain-graph__title">Модель сквозной цепочки</h4>
                        <div v-if="isEditing" @click="onEditChain" style="height: 44px">
                            <p class="bp-cross-chain-graph-content-edit" >Редактировать</p>
                        </div>
                    </template>
                    <GraphPath :path="bpPath" @click-on-line="findClickedLine" @setup="graph => $emit('setup-graph', graph)"/>
                </div>
            </div>
            <template v-if="!printModel">
                <div
                    v-if="toolTip"
                    v-click-outside="resetTooltip"
                    :style="{top: toolTip.top, left: toolTip.left}"
                    class="bp-cross-chain-passport-tooltip">
                    <div :ref="'tooltip'" class="bp-cross-chain-passport-tooltip-container">
                        <div>
                            <h4>Выход</h4>
                            <p v-if="toolTip.bp.outputs.length === 0"> Данные для Выход не указаны </p>
                            <p v-else v-for="(output, index) in toolTip.bp.outputs" :key="index"> {{ output }} </p>
                        </div>
                        <div>
                            <h4>Вход</h4>
                            <p v-if="toolTip.bp.inputs.length === 0"> Данные для Вход не указаны </p>
                            <p v-else v-for="(input, index) in toolTip.bp.inputs" :key="index"> {{ input }} </p>
                        </div>
                    </div>
                    <div class="arrow-down"/>
                </div>
                <Risks v-if="passport" :risks="passport.data.risks"/>
                <RemoveModal/>
                <RemovedBPModal/>
            </template>
        </div>

    </div>
</template>

<script>
import Step from '../graph/BPCrossChainGraphStep.vue'
import Header from "./BPCrossChainPassportHeader.vue";
import PassportBody from "./BPCrossChainPassportBody.vue";
import Edit from "./BPCrossChainPassportEdit.vue";
import HeaderEdit from "./BPCrossChainPassportHeaderEdit.vue";
import RemoveModal from './alert/BPCrossChainDeleteModal.vue'
import RemovedBPModal from './alert/BPCrossChainDeletedBpModal.vue'
import Risks from "./BPCrossChainPassportRisks.vue";
import storeService from "../services/store_service"
import parsers from '../services/parsers'
import factories from "../services/factories";
import GraphPath from "./BPCrossChainPassportPath.vue";

import store from '@/store'
import { ERROR_STATE_NAME } from '@/store/error'

export default {
    name: "BPCrossChainPassport",
    props: {
        id: Number,
        isForceEditing: Boolean,
        printModel: Boolean,
    },
    components: {PassportBody, Header, Step, Edit, HeaderEdit, RemoveModal, Risks, GraphPath, RemovedBPModal},
    provide() {
        return {
            onBPBlockCreated: this.positionGraph,
        }
    },
    data() {
        return {
            passport: null,
            bpLayer: null,
            bpPath: null,
            editingPassport: null,
            path: [],
            points: [],
            bpBlockDivs: {},
            isEditing: false,
            isCanEditing: false,
            toolTip: null,
            scrollOffset: 0,
        };
    },
    created() {
        this.isEditing = this.isForceEditing ?? false
        storeService.clear()
        this.getCrossChainPassport()

        this.$rs.useHandler({
            repo: 'bp/e2e',
            method: 'saveModel',
            onCatch: (errorData) => {
                this.editingPassport = this.passport.clone()

                return new Promise((resolve, reject) => {
                    store.commit(`${ERROR_STATE_NAME}/pushError`, {
                        errorData,
                        retryAction: () => resolve(true),
                        acceptAction: () => {
                            resolve(false)
                            reject(errorData)
                        }
                    })
                })       
            }
        })
    },
    mounted() {
        this.$nextTick(() => this.$refs["container"]?.addEventListener('scroll', this.handleScroll))
    },
    beforeDestroy() {
        this.$refs["container"]?.removeEventListener('scroll', this.handleScroll);
    },
    methods: {
        lineStyle(point) {
            if (point.bp?.deleted)
                return 'red'

            return 'black'
        },
        arrowId(point) {
            if (point.bp?.deleted)
                return 'arrowheadred'

            return 'arrowhead'
        },
        resetTooltip() {
            this.toolTip = null
        },
        handleScroll(event) {
            this.toolTip = null
            this.scrollOffset = event.target.scrollLeft
        },
        clickLine(point) {
            let xDistance = Math.abs(point.x2 - point.x1)
            let yDistance = Math.abs(point.y1 - point.y2)

            this.toolTip = {
                bp: point.bp,
                top: point.y1 + 'px',
                left: point.x1 - this.scrollOffset + 'px',
            }

            this.$nextTick(() => {
                let top = this.$refs['body'].offsetTop
                let left = this.$refs['body'].offsetLeft
                let height = this.$refs['body'].clientHeight
                let toolTipHeight = this.$refs['tooltip'].clientHeight
                let toolTipWidth = this.$refs['tooltip'].clientWidth

                const gap = 74
                const tooltipTriangleHeiht = 16
                this.toolTip = {
                    bp: point.bp,
                    top: gap + top + height + point.y1 - toolTipHeight - tooltipTriangleHeiht - 4 * yDistance / 5 + 'px',
                    left: left + point.x1 - toolTipWidth / 2 + xDistance / 2 + 10 - this.scrollOffset + 'px',
                }
            })
        },
        onEditChain() {

            if (Object.values(this.bpBlockDivs).some(e => e.bp.bp.deleted)) {
                this.$modal.show('removed_bp_chain', {
                    onOk: () => {
                        this.$router.push({name: 'BPCrossChainGraph', params: {id: this.passport.data.id}})
                    }
                })
            } else {
                this.$router.push({name: 'BPCrossChainGraph', params: {id: this.passport.data.id}})
            }
        },
        saveChanges() {
            this.editingPassport.updateOnAPI().then(() => {
                if(this.$route.name !== 'BPCrossChainPassport') this.$router.replace({
                  name: 'BPCrossChainPassport',
                  params: {id: this.passport.data.id}
                })
            })
        },
        changeEditing() {
          this.$router.push({
            name: 'BPCrossChainPassportEdit',
            params: {id: this.passport.data.id}
          })
        },
        cancel() {
            this.$router.push({ name: 'BPCrossChainPassport', params: {id: this.id} })
        },
        print() {
            this.$utils.openLink(`/api/report/e2e/passport?id=${this.passport.data.id}&tz=${-(new Date().getTimezoneOffset())}`)
        },
        removeModal() {
            this.$modal.show('remove_bp_chain', {
                onRemove: () => {
                    this.passport.removeOnApi().then(() => {
                        this.$router.replace({name: 'BPCrossChainMap'})
                    })
                }
            })
        },
        getCrossChainPassport() {
            factories.getPassportFromAPI(this.id).then((passport) => {
                this.passport = passport
                this.editingPassport = this.passport.clone()
                this.isCanEditing = this.passport.data.access.modify

                if (this.passport.data.bpChain) {
                    this.bpPath = this.passport.data.bpChain
                } else if (this.passport.data.model && this.passport.data.model.length > 0) {
                    this.bpLayer = parsers.parseGraph(this.passport.data.model).flatMap(e => e)
                } else {
                    this.bpLayer = parsers.parseGraph([
                        {
                            type: 'START', bps: this.passport.data.params['START'].map(e => ({bp: e}))
                        },
                        {
                            type: 'MID', bps: this.passport.data.params['MID'].map(e => ({bp: e}))
                        },
                        {
                            type: 'END', bps: this.passport.data.params['END'].map(e => ({bp: e}))
                        },
                    ]).flatMap(e => e)
                }

                // обязательно очищаем хранилище от параметров
                storeService.clear()
            })
        },
        positionGraph(val) {
            this.bpBlockDivs[val.bp.bp.id] = val

            this.updatePoint()
        },
        updatePoint() {
            var points = []
            Object.entries(this.bpBlockDivs).forEach(element1 => {
                element1[1].bp.links?.forEach(element => {
                    let element2 = this.bpBlockDivs[element.bp.id]
                    if (element2) {
                        if (element1[1].bp !== element2.bp && element1[1].offset.left !== element2.offset.left && element1[1].offset.left < element2.offset.left) {

                            points.push({
                                bp: element,
                                parent: element2.parentOffset,
                                x1: element1[1].offset.left + element1[1].offset.width + 14,
                                y1: element1[1].offset.top + element1[1].offset.height / 2,
                                x2: element2.offset.left - 34,
                                y2: element2.offset.top + element2.offset.height / 2
                            })
                        }
                    }
                });
            });


            this.points = points;
        },
        findClickedLine(line){
          let startBp = this.bpBlockDivs[line.startBp]
          let endBp = this.bpBlockDivs[line.endBp]
          this.clickLine({
            bp: startBp.bp.links[0],
            parent: startBp.parentOffset,
            x1: endBp.offset.left + (endBp.offset.width / 2),
            y1: endBp.offset.top,
            x2: startBp.offset.left + (startBp.offset.width / 2),
            y2: startBp.offset.top + startBp.offset.height
          })

        }
    },
};
</script>

<style lang="sass">
.bp-cross-chain
    display: flex
    flex-direction: column
    gap: 74px

.bp-cross-chain-graph__title
    margin: 0
    margin-bottom: 16px
    font-size: 20px

.bp-cross-chain-graph-steps
    display: flex
    gap: 70px

.bp-cross-chain-graph-content
    width: 100%
    position: relative
    overflow-y: hidden
    overflow-x: scroll

    &-edit
        color: var(--blue-307-color)
        cursor: pointer
        margin: 0px

.bp-cross-chain-graph-svg
    overflow: visible
    z-index: 2
    pointer-events: none
    position: absolute
    left: 0px
    top: 0px
    width: 100%
    height: 100%

.bp-cross-chain-graph-line
    stroke: black

.bp-cross-chain-graph-steps-edit
    font-family: ProximaNova
    font-size: 15px
    line-height: 20px

.bp-cross-chain-graph-line-hides
    stroke: #ffffff00
    stroke-width: 10px

.bp-cross-chain-passport-tooltip
    align-items: top
    display: flex
    position: absolute
    z-index: 5
    border-radius: 4px
    background: white
    filter: drop-shadow(0px 12px 21px rgba(0, 6, 12, 0.12))

    .arrow-down
        position: absolute
        bottom: -12px
        left: calc(50% - 10px)
        width: 0
        height: 0
        border-left: 10px solid transparent
        border-right: 10px solid transparent
        border-top: 12px solid white

.bp-cross-chain-passport-tooltip-container
    display: flex
    flex-direction: column
    padding: 8px 24px 31px 24px
    overflow: auto
    width: 100%
    gap: 24px
    max-width: 400px

    h4
        margin: 2px
        margin-bottom: 6px

    p
        margin: 2px
</style>
