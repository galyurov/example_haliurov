<template>
<div class="bp-cross-chain-graph-bpblock-container" :class="!this.deleted ? '' : 'bordered'" style="position: relative">
    <div class="bp-cross-chain-graph-bpblock" :style="{ color: textColor }" :ref="column.bp.id">
        <p>[{{column.bp.code}}]</p>
        <p>{{column.bp.name}}</p>
    </div>
    <div v-if="deleted" class="bp-cross-chain-graph-bpblock-bubble">
        <p class="bp-cross-chain-graph-bpblock-bubble-title">БП удален из системы</p>
        <div class="arrow-down"/>
    </div>
    <div @click.stop="removeBP" v-if="canRemove" class="--del"> × </div>
</div>
</template>

<script>

export default {
    name: "BPCrossChainGraphBPBlock",
    props: {
        column: Object,
        layerIndex: Number,
        isFirstBlock: Boolean,
        isLastMiddleLayer: Boolean,
        canRemove: Boolean,
        graph: Object
    },
    inject: {
        onBPBlockCreated:"onBPBlockCreated",
        onDeleteBPBlock:{
            from: "onDeleteBPBlock",
            default: null
        }
    },
    mounted() {
        this.$nextTick(()=>{
            if(this.column.links?.length){
                this.column.links?.forEach(v=> {
                    v.bp.layerLink = `${v.bp.id}-${this.isFirstBlock ? this.findNextLinkBp(v.bp.id) : this.isLastMiddleLayer ? 1 : this.findNextLinkBp(v.bp.id)}`
                })
            }
            const bp = {
                bp: this.column,
                offset:  {
                    left: this.$el.offsetLeft,
                    width: this.$el.offsetWidth,
                    top: this.$el.offsetTop,
                    height: this.$el.offsetHeight
                },
                parentOffset: {
                    top: this.$refs[this.column.bp.id].offsetParent.offsetTop,
                    left: this.$refs[this.column.bp.id].offsetParent.offsetLeft
                }
            }
            bp.bp.layerLink = `${this.column.bp.id}-${this.layerIndex}`
            this.onBPBlockCreated(bp);
        });
    },
    computed: {
        pointerEvents() {
            return this.deleted ? '' : 'none'
        },
        deleted() {
            return this.column.bp.deleted ?? false
        },
        textColor() {
            return this.column.bp.deleted ? 'red' : ''
        }
    },
    methods: {
        removeBP() {
            this.onDeleteBPBlock(this.column)
        },
        findNextLinkBp(id){
            const layer = this.graph?.middleBPLayer?.findIndex(val=> {
                return val.some(el => el?.children?.some(child=> child?.bp?.id === id))
            })
            return layer >= 0 ? layer +1 : 1
        }
    }
}
</script>

<style lang="sass" scoped>
.bp-cross-chain-graph-bpblock
    pointer-events: none
    display: flex
    flex-direction: column
    gap: 3px

    padding: 14px
    background-color: white

    p
        margin: 0px

.bp-cross-chain-graph-bpblock-bubble
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

.bp-cross-chain-graph-bpblock-container
    width: 100%

    .--del
        position: absolute
        top: 2px
        right: 9px
        font-size: 20px
        cursor: pointer

.bordered
    border: 1px solid white

.bordered:hover
    border: 1px solid red

    .bp-cross-chain-graph-bpblock-bubble
        opacity: 1

</style>
