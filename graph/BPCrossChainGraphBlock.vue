<template>
    <div
        class="bp-cross-chain-graph-block"
        :style="{ backgroundColor, cursor }"
        @click="changeSelected"
    >
        <div class="bp-cross-chain-graph-block-header">
            <div class="bp-cross-chain-graph-block-title" >
                <div>
                    <p :style="{ color: titleColor }">[{{column.code}}] {{column.name}}</p>
                    <p :style="{ color: subTitleColor }">{{column.owner.name}}</p>
                </div>
            </div>
            <div class="bp_image_wrap">
                <div
                    v-if="!accented && isManualMode"
                    class="bp_image"
                    v-tippy="{ theme: 'light'}"
                    :content="isSelectedAsLast ? 'Вернуть БП в промежуточные' : 'Выбрать как конечный БП'"
                    @click.stop="selectLast"
                >
                    <img
                        v-if="canSelectAsLastBlock && !isSelectedAsLast && blockObj.isSelected()"
                        src="~@/assets/images/set-end-bp-white.svg"
                        width="24"
                        height="24"
                    >
                    <img
                        v-else-if="canSelectAsLastBlock && !isSelectedAsLast"
                        src="~@/assets/images/set-end-bp.svg"
                        width="24"
                        height="24"
                    >
                    <img
                        v-else-if="canSelectAsLastBlock && isSelectedAsLast"
                        src="~@/assets/images/unset-end-bp.svg"
                        width="24"
                        height="24"
                    >
                </div>
            </div>

            <div v-if="canRemove" @click.stop="removeBlock" class="--del"> × </div>
        </div>
        <BP
            v-for="(row, index) in column.children"
            :key="index"
            :id="`bp-cross-chain-graph-bpblock-${row.bp.id}`"
            :column="row"
            :canRemove="accented"
            :layerIndex="column.layerIndex"
            :isFirstBlock="isFirstBlock"
            :isLastMiddleLayer="isLastMiddleLayer"
            :graph="graph"
            @mouseenter.native="$emit('hover-bp', {id: row.bp.id})"
            @mouseleave.native="$emit('hover-bp', {id: row.bp.id, isHovered: true})"
        />
    </div>
</template>

<script>

import BP from './BPCrossChainGraphBPBlock.vue'
import factories from "../services/factories";
import ManualGraph from "../entities/graph_manual";

export default {
    name: "BPCrossChainGraphBlock",
    components: { BP },
    props: {
        column: Object,
        accented: Boolean,
        graph: Object,
        layerIndex: Number,
        isLastMiddleLayer: Boolean
    },
    inject: {
      onDeleteBlock: {
          default: null
      }
    },
    data() {
        return {
          blockObj: {},
        }
    },
    created() {
      this.blockObj = factories.createBlock(this.column, this.layerIndex, this.graph)
    },

    computed: {
        canRemove() {
            return this.accented
        },
        isSelectedAsLast() {
            return this.accented || this.blockObj?.data.isLast
        },
        backgroundColor() {
            if (this.accented) { return "#66ADDE" }
            if (this.blockObj?.data?.isLast) { return "#207DD3" }
            if (this.blockObj?.isDoubleBlock()) { return "var(--gray-12-color)" }

            return this.blockObj?.isSelected() ? "var(--brand-green-color)" : "var(--blue-10-color)"
        },
        titleColor() {
            return this.isSelectedAsLast || this.blockObj?.isSelected() && !this.blockObj?.isDoubleBlock() ? "white" : "var(--gray-65-color)"
        },
        subTitleColor() {
            return this.isSelectedAsLast || this.blockObj?.isSelected() && !this.blockObj?.isDoubleBlock() ? "white" : "black"
        },
        cursor() {
            return this.isSelectedAsLast || !this.blockObj?.isAvailable() || this.blockObj?.isDoubleBlock()   ? "" : "pointer"
        },
        canSelectAsLastBlock() {
            return this.blockObj?.canSelectAsLastBlock() && !this.blockObj?.isDoubleBlock()
        },
        isManualMode() {
            return this.graph instanceof ManualGraph
        },
        isFirstBlock() {
            return this.graph?.path?.list[0]?.[0]?.id === this.column?.id
        }
    },
    methods: {
        selectLast() {
            this.blockObj.selectLast()
        },
        changeSelected() {
            if(this.blockObj?.isDoubleBlock()){ return }

            if(!this.accented){
                this.blockObj.changeSelected()
                return
            }

            if(this.isFirstBlock) {
                this.blockObj.resetPath()
            }
        },
        removeBlock() {
            this.onDeleteBlock(this.column)
        }
    },

}
</script>

<style lang="sass" scoped>

.bp-cross-chain-graph-block-header
    position: relative
    display: flex
    justify-content: space-between

    .--del
        position: absolute
        top: 0px
        right: 0px
        font-size: 20px
        cursor: pointer
        color: white

.bp-cross-chain-graph-block-title
    justify-content: space-between
    display: flex
.bp_image_wrap
    width: 24px
    height: 24px
    position: absolute
    right: 0

.bp_image
    cursor: pointer
    position: relative
    display: inline-block
    opacity: 0

.bp-cross-chain-graph-block:hover
    .bp_image
        opacity: 1

.bp-cross-chain-graph-block
    z-index: 3

    display: flex
    flex-direction: column
    gap: 10px

    padding: 14px
    width: 248px
    height: 100%

    p
        margin: 0px
        color: white
        padding-right: 16px
</style>