<template>
    <div class="bp-cross-chain-graph-step">
        <div class="bp-cross-chain-graph-step-head">
            <div>
                <h3>{{ title }}</h3>
                <div class="edit-action-wrap">
                  <div v-if="isEditing" @click="onEdit">
                    <p>Редактировать</p>
                  </div>
                </div>
            </div>
        </div>
        <div class="bp-cross-chain-graph-step-block">
              <Layer
                  v-for="(layer, index) in steps"
                  :key="`bp-cross-chain-graph-step-${index}`"
                  :layer="layer"
                  :graph="graph"
                  :accented="accented"
                  :layerIndex="index"
                  :isLastLayer="!isStartLayer && index+1 === steps.length"
                  @hover-bp="(val) => $emit('hover-bp', val)"
              />
        </div>
    </div>
</template>

<script>

import Layer from './BPCrossChainGraphLayer.vue'

export default {
    name: "BPCrossChainGraphStep",
    components: {Layer},
    props: {
        title: String,
        graph: Object,
        accented: Boolean,
        steps: Array,
        isEditing: Boolean,
        onEdit: Function,
        isStartLayer: Boolean
    }
}
</script>

<style lang="sass" scoped>
.bp-cross-chain-graph-step
    &-head
        flex-direction: column
        align-items: flex-start
        justify-content: stretch

        > div:first-child
            width: 90%

            h2
                margin: 0
            p
                color: var(--blue-307-color)
                cursor: pointer

    &-block
        display: flex
        gap: 50px
        min-width: 260px

.edit-action-wrap
    height: 18px
    margin: 15px 0
</style>