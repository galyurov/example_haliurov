<template>
    <div class="bp-cross-chain-graph">
        <BreadCrumbs class="breadcrumbs">
                <li class="breadcrumb__item">
                    <router-link
                        class="breadcrumb__link"
                        :to="{ name: 'BPCrossChainMap' }"
                    >
                        Сквозные цепочки /
                    </router-link>
                </li>
        </BreadCrumbs>
        <div  class="bp-cross-chain-graph-head">
            <div>
                <h2>Модель сквозной цепочки</h2>
                <p>Выберите БП входящие в состав цепочки или воспользуйтесь фильтром для уточнения БП, которые будут принимать участие в СЦ</p>
            </div>
            <div class="bp-cross-chain-graph-head-buttons">
                <button
                    class="button button_type_icon-square button_state_cancel"
                    v-tippy="{ theme: 'red'}"
                    content="Закрыть"
                    @click="$emit('close')"
                >
                    <svg width="14" height="14" viewBox="0 0 14 14">
                        <use href="@/assets/images/sprites.svg#modal-close"></use>
                    </svg>
                </button>
                <button
                    class="button button_type_icon-square button_state_save"
                    v-tippy="{ theme: 'green'}"
                    content="Сохранить"
                    @click="$emit('save')"
                >
                    <svg width="21" height="21" viewBox="0 0 21 21">
                        <use href="@/assets/images/sprites.svg#responsible-save"></use>
                    </svg>
                </button>
                <button
                    v-if="canSave"
                    :class="['button', 'button_type_icon-square', this.isCompleted ? 'button_state_active' : 'button_state_unactive']"
                    v-tippy="{ theme: this.isCompleted ? 'blue' : 'grey'}"
                    content="Далее"
                    @click="$emit('next')"
                >
                    <svg width="18" height="12" viewBox="0 0 18 12" style="transform: scaleX(-1)">
                        <use href="@/assets/images/sprites.svg#main-arrow-left"></use>
                    </svg>
                </button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "BPCrossChainGraphHeader",
    props: {
        isCompleted: Boolean,
        canSave: Boolean
    }
}
</script>

<style lang="sass">

.bp-cross-chain-graph
    .breadcrumbs
        margin: -30px 0 30px 0

    .bp-cross-chain-graph-head
        display: flex
        align-items: flex-start
        justify-content: stretch

        > div:first-child
            width: 90%

            h2
                margin: 0
            p
                color: var(--blue-color)

        &-buttons
            display: contents
            min-width: 380px

            button
                margin-right: 20px

</style>
