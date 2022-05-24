<template>
    <div class="bp-cross-chain-graph-path">
        <div v-for="(layer, layerIndex) in path" :key="layerIndex" class="bp-cross-chain-graph-path-layers">
            <div v-for="(element, index) in layer" :key="index" class="bp-cross-chain-graph-path-container">
                <div class="bp-cross-chain-graph-block">
                    <div class="bp-cross-chain-graph-block-header">
                        <div class="bp-cross-chain-graph-block-title" >
                            <div>
                                <p
                                    class="bp-cross-chain-graph-block__title"
                                    :style="{ color: titleColor(element) }"
                                    >
                                    [{{element.bp.code}}] {{element.bp.name}}
                                </p>
                                <p
                                    class="bp-cross-chain-graph-block__author"
                                    :style="{ color: titleColor(element) }"
                                >
                                    {{element.bp.owner.name}}
                                </p>
                            {{element.deleted}}
                            </div>
                        </div>
                        <div v-if="element.deleted" class="bp-cross-chain-graph-deleted-bubble">
                            <p class="bp-cross-chain-graph-deleted-bubble-title">БП удален из системы</p>
                            <div class="arrow-down"/>
                        </div>
                    </div>
                    <div :style="{ paddingTop: '16px'}">
                        <div v-for="(row, index) in element.children"
                            :key="index"
                            :id="`bp-cross-chain-graph-bpblock-${row.bp.id}`">
                            <BP
                            :column="row"
                            />
                            <svg v-if="element.children.length > 1 && index != element.children.length - 1"
                                 class="bp-cross-chain-graph-path-svg"
                                :style="{ opacity: layerIndex != 0 && layerIndex != path.length - 1 ? 1 : 0 }"
                            >
                                <defs>
                                    <marker id="arrowheads" markerWidth="10" markerHeight="7"
                                    refX="0" refY="3.5" orient="90deg">
                                        <polygon points="0 0, 10 3.5, 0 7" :fill="row.bp.deleted ? `red`: `black` " />
                                    </marker>
                                </defs>
                                    <line
                                        @click="$emit('click-on-line',{startBp: row.bp.id, endBp: element.children[index+1] && element.children[index+1].bp.id})"
                                        class="bp-cross-chain-graph-line"
                                        :style="{ stroke: row.bp.deleted ? `red`: `black` }"
                                        marker-end="url(#arrowheads)"
                                        :x1="'50%'"
                                        :x2="'50%'"
                                        :y1="0"
                                        :y2="8"
                                    />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>

import BP from '../graph/BPCrossChainGraphBPBlock.vue'

export default {
    name: "BPCrossChainPassportPath",
    components: {BP},
    props: {
        path: Array
    },
    provide() {
        return {
            onDeleteBPBlock: this.deleteBPBlock,
        }
    },
    methods: {
        titleColor(element) {
            if (element.bp.deleted) {
                return 'red'
            }

            return "var(--gray-65-color)"
        },
        subTitleColor(element) {
            if (element.bp.deleted) {
                return 'red'
            }

            return "black"
        },
        deleteBPBlock() { }
    },
    mounted() {
        this.$nextTick(() => this.$emit('setup', this))
    }
}
</script>

<style lang="sass" scoped>

.bp-cross-chain-graph-path-svg
    z-index: 2
    width: 100%
    height: 16px
    overflow: visible
.bp-cross-chain-graph-path-svg line.bp-cross-chain-graph-line
    cursor: pointer

.bp-cross-chain-graph-path-layers
    height: 100%
    display: flex
    flex-direction: column
    gap: 32px

.bp-cross-chain-graph-path-container
    height: 100%

.bp-cross-chain-graph-path
    display: flex
    gap: 48px

.bp-cross-chain-graph-block-header
    position: relative
    display: flex
    justify-content: space-between
    width: 100%

.bp-cross-chain-graph-block-title
    justify-content: space-between
    display: flex

.bp-cross-chain-graph-block
    background-color: var(--blue-10-color)
    display: flex
    flex-direction: column

    padding: 14px
    width: 248px
    height: 100%

    p
        margin: 0px
        color: white

.bp-cross-chain-graph-deleted-bubble
    align-items: center
    display: flex
    height: 34px
    width: 174px
    position: absolute
    z-index: 1
    border-radius: 4px
    top: -50px
    left: 40px
    background: #207DD3


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

.bp-cross-chain-graph-block:hover
    .bp-cross-chain-graph-deleted-bubble
        opacity: 1

.bp-cross-chain-graph-block-title
    font-size: 13px

.bp-cross-chain-graph-block__author
    font-size: 12px
</style>
