<template>
    <div class="bp-cross-chain-map-container">
        <div @click="openPassport" class="bp-cross-chain-map-title">
            <div class="bp-cross-chain-map-title-owner">
            <h3 class="bp-cross-chain-map-title-owner__name" v-html="getHilghlightString(bps.name)"><span></span></h3>
            <h4 v-if="bps.owner" class="bp-cross-chain-map-owner" v-html="getHilghlightString(bps.owner)"><span></span></h4>
            </div>
            <h4 v-if="bps.status" class="bp-cross-chain-map-status" v-html="getHilghlightString(STATUSES[bps.status])"><span></span></h4>
        </div>
        <div class="bp-cross-chain-map-blocks-container">
            <div v-if="points && points.length > 0">
                <div v-for="(row, rowIndex) in points" :key="rowIndex">
                    <div v-for="(point, pointIndex) in row" :key="pointIndex">
                    <svg class="bp-cross-chain-map-block-svg">
                        <defs>
                            <marker id="arrowheadred" markerWidth="10" markerHeight="7"
                            refX="0" refY="3.5" orient="auto">
                                <polygon points="0 0, 10 3.5, 0 7" fill="red" />
                            </marker>
                            <marker id="arrowhead" markerWidth="10" markerHeight="7"
                            refX="0" refY="3.5" orient="auto">
                                <polygon points="0 0, 10 3.5, 0 7" fill="var(--blue-307-color)" />
                            </marker>
                        </defs>
                        <line
                            class="bp-cross-chain-map-block-line"
                            :style="{ stroke: lineStyle(point) }"
                            :marker-end="`url(#${arrowId(point)})`"
                            :x1="point.x1"
                            :x2="point.x2"
                            :y1="point.y1"
                            :y2="point.y2"
                        />
                        </svg>
                    </div>
                    </div>
                </div>
            <div v-if="interBlocks && interBlocks.length > 0">
                <div v-for="(row, rowIndex) in interBlocks" :key="rowIndex">
                    <div v-for="(block, pointIndex) in row" :key="pointIndex">
                    <div
                    class="ffff"
                        :style="{
                            left: (block.x1) + 'px',
                            top: block.y1 + 'px',
                            width: (block.x2 - block.x1) + 'px',
                            height: (block.y2 - block.y1) + 'px',
                            background: 'white',
                            position: 'absolute'
                         }"
                    ></div>
                    </div>
                </div>
            </div>
        <div v-if="rows.length > 0" class="bp-cross-chain-map-blocks">
            <div
                class="bp-cross-chain-map-block-row"
                v-for="(row, rowIndex) in rows"
                :key="rowIndex"
                :style="{direction: hand(rowIndex)}"
            >
                <div
                    class="bp-cross-chain-map-block"
                    v-for="(bp, bpIndex) in row.row"
                    :key="bpIndex"
                >
                    <div
                        class="bp-cross-chain-map-block-content"
                        :class="!bp.deleted ? '' : 'bordered'"
                        :ref="`bp_cross_chain_map_block${bpIndex}${rowIndex}`"
                        v-tooltip="{
                            content: bp.name,
                            placement: 'bottom-end',
                            trigger: 'manual'
                        }"
                    >
                        <div v-if="bp.deleted" class="bp-cross-chain-graph-bpblock-bubble">
                            <h5 class="bp-cross-chain-graph-bpblock-bubble-title">БП удален из системы</h5>
                            <div class="arrow-down"/>
                        </div>
                        <p v-html="getHilghlightString(`[${bp.code}]`, bp.id)"></p>
                        <p
                            v-html="getHilghlightString(bp.name, bp.id)"
                            @mouseenter="(e) => toggleTooltip(e.target, true)"
                            @mouseleave="(e) => toggleTooltip(e.target)"
                        ></p>
                        <p class="bp-cross-chain-map-block-content__owner" v-html="getHilghlightString(bp.owner.name)"><span ></span></p>
                    </div>

                </div>
            </div>
            </div>
                 <div v-else class="bp-cross-chain-map-blocks">
            <p class="bp-cross-chain-map-blocks-no-found-text"> Модель сквозной цепочки еще не сформирована </p>
        </div>
        </div>
    </div>
</template>

<script>
const LINE_OFFSET = 32.0
const ARROW_WIDTH = 10.0

var STATUSES  = {
    PROJECT : 'Проект',
    APPROVAL : 'На утверждении',
    APPROVED : 'Утверждён'
};
export default {
    name: 'BPCrossChainMapBlock',
    props: {
        searchString: String,
        bps: {},
        bpSearched: Object
    },
    data() {
        return {
            STATUSES,
            rows: [],
            points: null,
            interBlocks: null
        }
    },
    watch:{
        searchString(){
            this.generateLines()
        }
    },
    created() {
        let rows = []
        let row = []

        let index = 0
        let bps = this.bps.bpChain?.flatMap((e, index) => {
            e.forEach(e => e.index = index)

            return e
        })

        if (bps)
            bps.forEach(bp => {
                row.push(bp);
                if (row.length % 3 === 0 || bps.length === index + 1) {
                    rows.push({
                        id: rows.length,
                        row: row.map((x) => x)
                    });
                    row = []
                }

                index += 1
            })

        this.rows = rows
    },
    mounted() {
        this.$nextTick(this.generateLines);
    },
    methods: {
        lineStyle(point) {
            if (point.bp?.deleted || point.nextElement?.deleted)
                return 'red'
        },
        arrowId(point) {
            if (point.bp?.deleted || point.nextElement?.deleted)
                return 'arrowheadred'
            return 'arrowhead'
        },
        openPassport() {
            this.$router.push({name: 'BPCrossChainPassport', params: { id:  this.bps.id}})
        },
        generateLines() {
                var points = []
                var interBlocks = []
                let flatBPs = this.rows.flatMap(e => e.row)
                this.rows.forEach((row, rowIndex) => {
                    var blockPoint = []
                    var interBlock = []
                    row.row.forEach((bp, bpIndex) => {
                        let nextElement = flatBPs[rowIndex * 3 + bpIndex + 1]

                        if (nextElement) {
                            if (nextElement.index == bp.index) {
                                // You have one parent
                                interBlock.push(this.interBlockFor(`bp_cross_chain_map_block${bpIndex}${rowIndex}`,
                                                rowIndex,
                                                bpIndex,
                                                bp,
                                                nextElement))
                            } else {
                                if (rowIndex * 3 + bpIndex != this.rows.flatMap(e=>e.row).length - 1)
                                    blockPoint.push(this.pointFor(`bp_cross_chain_map_block${bpIndex}${rowIndex}`,
                                                    rowIndex,
                                                    bpIndex,
                                                    bp,
                                                    nextElement))
                            }
                        }
                    })
                    points.push(blockPoint);
                    interBlocks.push(interBlock);
            });

            this.points = points
            this.interBlocks = interBlocks
        },
        pointFor(ref, rowIndex, bpIndex, bp, nextElement) {
            // Get element parameters in refs
            let element = this.$refs[ref][0]

            // Create line down
            if (bpIndex === 2) {
                var topDistance = 0

                let elementDown = this.$refs[`bp_cross_chain_map_block${0}${rowIndex + 1}`]
                if (elementDown) {
                    topDistance =  (element.offsetTop + element.offsetHeight) - elementDown[0].offsetTop
                }

                return {
                    bp: bp,
                    nextElement: nextElement,
                    x1: element.offsetLeft + element.offsetWidth / 2,
                    y1: element.offsetTop + element.offsetHeight,
                    x2: element.offsetLeft + element.offsetWidth / 2,
                    y2: element.offsetTop + element.offsetHeight - topDistance - ARROW_WIDTH,
                }
            }

            // Create line for element
            if (rowIndex % 2 === 0) {
                return {
                    bp: bp,
                    nextElement: nextElement,
                    x1: element.offsetLeft + element.offsetWidth,
                    y1: element.offsetTop + element.offsetHeight / 2,
                    x2: element.offsetLeft + element.offsetWidth + LINE_OFFSET - ARROW_WIDTH,
                    y2: element.offsetTop + element.offsetHeight / 2
                }
            } else {
                return {
                    bp: bp,
                    nextElement: nextElement,
                    x1: element.offsetLeft,
                    y1: element.offsetTop + element.offsetHeight / 2,
                    x2: element.offsetLeft - LINE_OFFSET + ARROW_WIDTH,
                    y2: element.offsetTop + element.offsetHeight / 2
                }
            }
        },
        interBlockFor(ref, rowIndex, bpIndex, bp, nextElement) {
            // Get element parameters in refs
            let element = this.$refs[ref][0]

            // Create interBlock down
            if (bpIndex === 2) {
                return {
                    bp: bp,
                    nextElement: nextElement,
                    x1: element.offsetLeft,
                    y1: element.offsetTop + element.offsetHeight,
                    x2: element.offsetLeft + element.offsetWidth,
                    y2: element.offsetTop + element.offsetHeight + LINE_OFFSET
                }
            } else if( bpIndex !== 2 && rowIndex % 2)  {
                return {
                    bp: bp,
                    nextElement: nextElement,
                    x1: element.offsetLeft - LINE_OFFSET,
                    y1: element.offsetTop,
                    x2: element.offsetLeft,
                    y2: element.offsetTop + element.offsetHeight
                }
            } else if (bpIndex !== 2 && !rowIndex % 2) {
                return {
                    bp: bp,
                    nextElement: nextElement,
                    x1: element.offsetLeft + element.offsetWidth,
                    y1: element.offsetTop,
                    x2: element.offsetLeft + element.offsetWidth + LINE_OFFSET,
                    y2: element.offsetTop + element.offsetHeight
                }
            } else {
                return {
                    bp: bp,
                    nextElement: nextElement,
                    x1: element.offsetLeft,
                    y1: element.offsetTop + element.offsetHeight,
                    x2: element.offsetLeft + ARROW_WIDTH,
                    y2: element.offsetTop + element.offsetHeight / 2
                }
            }
        },
        hand(row) {
            if (row % 2 !== 0) {
                return "rtl"
            } else {
                return "ltr"
            }
        },
        getHilghlightString(str, bpId) {
            let re = new RegExp(this.searchString , "i");
            if(bpId && this.bpSearched?.parents?.at(-1)?.id === bpId){
                re = new RegExp(str.replace('[','').replace(']','') , "i");
            }
            return str.replace(re, (str) => `<span class="hl">${str}</span>`);
        },
        toggleTooltip(el, visible) {
            if(el.scrollHeight > el.clientHeight && visible) {
                el.parentElement._tooltip.show()
            } else {
                el.parentElement._tooltip.hide()
            }
        }
    }
}
</script>

<style lang="sass" scoped>
.bordered
    border: 1px solid red

    p
        color: red
    span
        color: red

.bp-cross-chain-graph-bpblock-bubble
    align-items: center
    display: flex
    height: 34px
    width: 174px
    position: absolute
    z-index: 1
    border-radius: 4px
    top: calc(-50% + 10px)
    left: calc(50% - 80px)
    background: #207DD3
    opacity: 0

    .arrow-down
        position: absolute
        bottom: -12px
        left: calc(50% - 10px)
        width: 0
        height: 0
        border-left: 10px solid transparent
        border-right: 10px solid transparent
        border-top: 12px solid #207DD3

    &-title
        font-size: 13px
        line-height: 18px
        text-align: center
        padding: 16px
        color: white

.bp-cross-chain-map
    &-title
        justify-content: space-between
        display: flex
        gap: 16px
        align-items: center
        cursor: pointer
    &-title-owner
        display: flex
        align-items: center
        gap: 16px
    &-owner
        color: var(--gray-65-color)
    &-status
        margin-top: 0
        margin-bottom: 0
        color: var(--gray-65-color)

    &-block-row
        display: grid
        grid-template-columns: repeat(3,1fr)
        grid-auto-flow: dense
        padding: 16px
        gap: 32px

    &-blocks-container
        position: relative

    &-blocks
        background-color: var(--blue-10-color)
        display: flex
        flex-direction: column

    &-block
        align-items: center
        width: 100%
        height: 100%
        direction: ltr
        display: flex

    &-block:hover
        .bp-cross-chain-graph-bpblock-bubble
            opacity: 1.0

    &-block-content
        display: flex
        flex-direction: column
        width: 100%
        height: 114px
        position: relative
        background-color: white
        padding: 14px
        gap: 8px

        p
            margin: 0px
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;

    &-block-svg
        width: 100%
        height: 100%
        position: absolute
        top: 0px
        left: 0px

    &-block-line
        stroke: var(--blue-307-color)

    &-blocks-no-found-text
        margin: 28px auto
        color: var(--dark-gray-60-color)


.bp-cross-chain-map-title-owner__name
    margin-top: 0
    margin-bottom: 0

.bp-cross-chain-map-container
    --space: 40px

    display: flex
    flex-direction: column
    row-gap: 12px
    margin-bottom: var(--space)

    &:last-child
        --space: 0

.bp-cross-chain-map-owner
    margin-top: 0
    margin-bottom: 0

.bp-cross-chain-map-block-content__owner
    color: rgba(60, 60, 67, 0.6)
</style>
