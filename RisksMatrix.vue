<template>
    <div
        class="matrix"
        :class="expand ? 'matrix_state_active' : ''"
    >
        <div class="matrix__title">
            <div class="list-bp__left-side matrix__left-side" @click="clickExpandMatrix">
                <ExpandArrow :expand="expand" class="card-person__arrow" />
                <h5 class="list-bp__left-side-title">{{ title }}</h5>
                <span class="list-bp__left-side-subtitle">{{ name }}</span>
            </div>

            <template v-if="expand">
                <template v-if="hasAddButton">
                    <div class="matrix__left-side">
                        <div v-show="viewMatrixScrollBtn" class="list-bp__right-side matrix__right-side matrix__arrows">
                            <button class="btn-arrow btn-arrow-left" @click="matrixScrol(-1)">
                                <!-- <img src="~@/assets/img/arrow-left.svg"> -->
                            </button>
                            <button class="btn-arrow btn-arrow-right" @click="matrixScrol(1)">
                                <!-- <img src="~@/assets/img/arrow-right.svg"> -->
                            </button>
                        </div>
                        <div v-show="expand" class="list-bp__right-side matrix__right-side">
                            <slot name="addButton"></slot>
                        </div>
                    </div>
                </template>

                <template v-else>
                    <div v-show="viewMatrixScrollBtn" class="list-bp__right-side matrix__right-side matrix__arrows-alone">
                        <button class="btn-arrow btn-arrow-left" @click="matrixScrol(-1)">
                            <!-- <img src="~@/assets/img/arrow-left.svg"> -->
                        </button>
                        <button class="btn-arrow btn-arrow-right" @click="matrixScrol(1)">
                            <!-- <img src="~@/assets/img/arrow-right.svg"> -->
                        </button>
                    </div>
                </template>
            </template>
            
        </div>

        <!-- <div ref="matrix" v-show="expand" class="matrix__table-wrapper">
            <div class="matrix__table-ready">

            </div>
        </div> -->

        <div
            ref="matrix"
            v-show="expand"
            class="matrix__table-wrapper"
            style="overflow-x: auto"
            :class="{ 'matrix-overlap': overlap }"
            @click="setOverlap"
            v-click-outside="setOverlap"
        >
            <div ref="table" class="matrix__table">
                <slot></slot>
            </div>
        </div>
    </div>
</template>

<script>
const MATRIX_SCROLL_STEP = 300 // px
const MATRIX_SCROLL_SPEED = 3 // px per 1 millisecond
const CALC_PARAMS_INTERVAL = 1000 // ms

export default {
    props: {
        title: String,
        name: String,
        expanded: Boolean,
        hasAddButton: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            expand: false,
            scrollingTimer: null,
            viewMatrixScrollBtn: false,
            timer: null,
            overlap: false
        }
    },
    created () {
        this.expand = this.expanded
    },
    mounted () {
        this.$nextTick(() => {
            this.calcParams()
            window.addEventListener("resize", this.setViewScrollBtns)
        })
        this.timer = setInterval(() => {
            this.calcParams()
        }, CALC_PARAMS_INTERVAL)
    },
    destroyed() {
        clearInterval(this.timer)
        window.removeEventListener("resize", this.setViewScrollBtns)
    },
    methods: {
        setOverlap () {
            if (this.$el.querySelector('.multiselect--active')) {
                this.overlap = true
            } else {
                this.overlap = false
            }
        },
        clickExpandMatrix () {
            this.expand = !this.expand
        },
        setColumnsHeight () {
            if (!this.$refs.table) { return }

            let maxHeightList = []
            for (let table of this.$refs.table.querySelectorAll('table')) {
                for (let [i, row] of table.querySelectorAll('tr').entries()) {
                    if (i > maxHeightList.length - 1) {
                        maxHeightList.push(row.clientHeight)
                        continue
                    }
                    if (maxHeightList[i] < row.clientHeight) {
                        maxHeightList[i] = row.clientHeight
                    }
                }
            }
            for (let table of this.$refs.table.querySelectorAll('table')) {
                for (let [i, row] of table.querySelectorAll('tr').entries()) {
                    row.style.height = `${maxHeightList[i]}px`
                }
            }
        },
        setViewScrollBtns () {
            this.$nextTick(() => {
                if (!this.$refs.matrix) { return }
                this.viewMatrixScrollBtn = this.$refs.matrix.scrollWidth > this.$refs.matrix.clientWidth
            })
        },
        matrixScrol (direct) {
            clearInterval(this.scrollingTimer)
            let currentShift = 0
            this.scrollingTimer = setInterval(() => {
                this.$refs.matrix.scrollLeft += direct*MATRIX_SCROLL_SPEED
                currentShift += MATRIX_SCROLL_SPEED
                if (currentShift >= MATRIX_SCROLL_STEP) {
                    clearInterval(this.scrollingTimer)
                }
            }, 1)
        },
        calcParams () {
            if (!this.expand) { return }
            this.setViewScrollBtns()
            this.setColumnsHeight()
        }
    }
}
</script>

<style lang="sass">
.list-bp__left-side 
    align-items: center
    &-title
        width: 100px
        font-size: 15px
        margin: 0


</style>
