<template>
    <div :class="{'e2e-print-ready': rendered}">
        <h2 class="graph-print-header">Модель сквозной цепочки</h2>
        <div ref="viewport" class="graph-print" >
            <BPCrossChainPassport
                ref="passport"
                :id="id"
                printModel
                @setup-graph="render"
            />
        </div>
    </div>
</template>

<script>
import BPCrossChainPassport from "@/views/bp_cross_chain/passport/BPCrossChainPassport";

const LAYERS_GAP = 32

export default {
    components: { BPCrossChainPassport },
    name: 'BPCrossChainGraphPrint',
    props: {
        id: Number
    },
    data() {
        return {
            windowWidth: 1600,
            windowHeight: 1080,
            offsetPrint: 200,
            rendered: false,
        }
    },
    methods: {
        render() {

            const node = this.$refs.passport.$el,
                container = node.querySelector('.bp-cross-chain-graph-content'),
                content = node.querySelector('.bp-cross-chain-graph-path')

            container.style.overflowX = 'hidden'

            let width = 0

            content.querySelectorAll('.bp-cross-chain-graph-path-layers').forEach(el => {
                width += el.offsetWidth+LAYERS_GAP
            })

            this.scale(this.$refs.viewport, {w: width, h: content.offsetHeight})

            setTimeout(() => this.rendered = true, 100)
        },
        scale(el, {w, h}) {

            let width = w || el.offsetWidth
            let height = h || el.offsetHeight+this.offsetPrint

            let windowHeight = this.windowHeight
            let windowWidth = this.windowWidth-this.offsetPrint

            let scaleX = windowWidth / width
            let scaleY = windowHeight / height

            scaleX = Math.min(scaleX, scaleY)
            scaleY = scaleX

            let translationX = Math.round((windowWidth - (width * scaleX)) / 2)
            let translationY = Math.round((windowHeight - (height * scaleY)) / 2)

            Object.assign(this.$refs.viewport.style, {
                "position": "fixed",
                "left": "0px",
                "top": "0px",
                "-webkit-transform": "translate(" + translationX + "px, "
                    + translationY + "px) scale3d(" + scaleX + ", " + scaleY + ", 1)",
                "-webkit-transform-origin": "0 0"
            })

            const {top, left} = this.$refs.viewport.getBoundingClientRect()

            this.$refs.viewport.style.top = top > 0 ? `calc(-${top}px + 60px)` : `60px`
            this.$refs.viewport.style.left = left > 0 ? `calc(-${left}px + 40px)` : `40px`
        }
    }
}
</script>

<style scoped lang="scss">

.graph-print-header {
    margin: 20pt 0 0 30pt;
    font-size: 12pt
}

@media print {
    @page {
        size: A3 landscape;
        margin: 0;
    }
}

</style>
