<template>
    <div v-if="layer.length > 0" class="bp-cross-chain-graph-layer-block">
        <Block
            v-for="(row, index) in layer"
            :key="`bp-cross-chain-graph-layer-${index}`"
            :column="row"
            :graph="graph"
            :accented="accented"
            :layerIndex="layerIndex"
            :isLastMiddleLayer="isLastLayer"
            @hover-bp="(val) => $emit('hover-bp', val)"
        />
    </div>
</template>

<script>

import Block from './BPCrossChainGraphBlock.vue'

export default {
    name: "BPCrossChainGraphLayer",
    components: {Block},
    props: {
        graph: Object,
        index: Number,
        layer: Array,
        accented: Boolean,
        layerIndex: Number,
        isLastLayer: Boolean
    }
}
</script>

<style lang="sass" scoped>
.bp-cross-chain-graph-layer
    &-block
        height: 100%
        display: flex
        flex-direction: column
        gap: 40px
        min-width: 260px

</style>