<template>
<div>
    <BreadCrumbs class="breadcrumbs">
                <router-link
                    class="breadcrumb__link"
                    :to="{ name: 'BPCrossChainMap' }"
                >
                    Сквозные цепочки /
                </router-link>
    </BreadCrumbs>
    <div  class="bp-cross-chain-head">
        <div class="list-bp__left-side list-bp__col">
            <h4>{{passport.data.name}}</h4>
        </div>
        <div class="bp-cross-chain-head__wrapper">
            <span>Статус паспорта</span>
            <CustomSelector
                v-if="isCanEditing"
                v-model="bpchStatus"
                :options="options"
                :placeholder="'Статус'"
                :multiple="false"
                :close-on-select="true"
                class="bp-cross-chain-head__input bp-cross-chain-head__input--mod"
                @close="onSave"
            />
            <div v-else>
                <p> {{STATUSES[passport.data.status]}}</p>
            </div>
            <button
                class="button_font-weight_bold list-bp__btn list-bp__btn--mod create-doc__btn small-height__btn"
                @click="onPrint"
            >
                Печать паспорта СЦ
            </button>
            <button
                v-if="isCanEditing"
                class="button button_type_icon-square"
                v-tippy="{ theme: 'blue'}"
                content="Редактировать"
                @click="onEdit"
            >
                <svg width="18" height="18" aria-hidden="true" focusable="false">
                    <use href="~@/assets/images/sprites.svg#edit-bp"></use>
                </svg>
            </button>
        </div>
    </div>
</div>
</template>

<script>
var STATUSES  = {
    PROJECT : 'Проект',
    APPROVAL : 'На утверждении',
    APPROVED : 'Утверждён'
};

export default {
  name: "BPCrossChainPassportHeader",
  props: {
    isEditing: Boolean,
    passport: Object,
    onEdit: Function,
    onSave: Function,
    onPrint: Function,
    isCanEditing: Boolean
  },
  data() {
      return {
        STATUSES,
        options: [{id: "PROJECT", name: "Проект"}, {id: "APPROVAL", name: "На утверждении"}, {id: "APPROVED", name: "Утверждён"} ]       
      }
  },
  computed: {
      bpchStatus:{
            get(){
                return {id: "", name: STATUSES[this.passport.data.status]}
            },
            set(v){
                this.passport.data.status = v.id
            }
        }
  }
}
</script>

<style lang="sass">
    .breadcrumbs
        margin: -30px 0 22px 0

    .bp-cross-chain-head
        gap: 16px
        display: flex
        justify-content: stretch
        align-items: flex-start

        > div:first-child
            width: 90%

        span
            width: auto
            font-size: 13px
            color: #87878E
            white-space: nowrap

        &-buttons
            display: flex

            button
                margin-right: 15px
                padding: 0 16px 0 16px

        &__input
            min-width: 210px
            margin-right: 20px

            &--mod
                margin-right: 0

    .list-bp__btn--mod
        font-size: 15px

    .bp-cross-chain-head__wrapper
        display: flex
        align-items: center
        column-gap: 20px
</style>
