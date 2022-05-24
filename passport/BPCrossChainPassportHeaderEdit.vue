<template>
  <div class="bp-cross-chain-passport-edit">
     <BreadCrumbs class="breadcrumbs">
                <router-link
                    class="breadcrumb__link"
                    :to="{ name: 'BPCrossChainMap' }"
                >
                    Сквозные цепочки /
                </router-link>
    </BreadCrumbs>
      <div  class="bp-cross-chain-passport-edit-head">
        <div class="list-bp__left-side list-bp__col">
            <div>
              <h4>{{passport.data.name}}</h4>
              <p>Заполните данные о цепочке</p>
            </div>            
        </div>
          <div class="bp-cross-chain-passport-edit__wrapper">
            <span>Статус паспорта</span>
            <CustomSelector
                v-model="bpchStatus"
                :options="options"
                :placeholder="'Статус'"
                :multiple="false"
                :close-on-select="true"
                class="bp-cross-chain-head__input"
            />
            <button
              class="button button_type_icon-square button_state_cancel"
              v-tippy="{ theme: 'red'}"
              content="Удалить"
              @click="onRemove"
            >
              <svg width="32" height="32" viewBox="0 0 32 32">
                <use href="@/assets/images/sprites.svg#basket-white"></use>
              </svg>
            </button>
            <button
              class="button button_type_icon-square button_state_save"
              :disabled="!passport.data.name"
              v-tippy="{ theme: 'green'}"
              content="Сохранить"
              @click="onSave"
            >
              <svg width="21" height="21" viewBox="0 0 21 21">
                <use href="@/assets/images/sprites.svg#responsible-save"></use>
              </svg>
            </button>
            <button
              class="button button_type_icon-square button_state_cancel"
              v-tippy="{ theme: 'red'}"
              content="Закрыть"
              @click="onEdit"
            >
              <svg width="14" height="14" viewBox="0 0 14 14">
                <use href="@/assets/images/sprites.svg#modal-close"></use>
              </svg>
            </button>
          </div>
    </div>
</div>
</template>

<script>
import infoService from '../../bp_shared/services'

var STATUSES  = {
    PROJECT : 'Проект',
    APPROVAL : 'На утверждении',
    APPROVED : 'Утверждён'
};

export default {
  name: "BPCrossChainPassportHeaderEdit",
  props: {
    isEditing: Boolean,
    passport: Object,
    onEdit: Function,
    onSave: Function,
    onRemove: Function
  },
  data () {
    return {
      infoService: infoService,
      orgs: [],
      subdivisions: [],
      expand: this.expanded,
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
};
</script>

<style lang="sass" scoped>

.bp-cross-chain-passport-edit
    .breadcrumbs
        margin: -30px 0 22px 0

.bp-cross-chain-passport-edit-body
  margin-top: 230px

.card-view__name
  width: 100%

.card-container
  display: grid
  margin-top: 60px
  grid-template-columns: 60% 30%
  .card-view__goal
    width: 85%
    min-height: 100px

  .card-view__owner
    margin-top: -25px

.card-view__kpi
  width: 100%
  margin-bottom: 40px

.menu-buttons
  display: flex
  align-items: center
  span
    margin-right: 20px
  button
    margin-left: 16px


.flex-container
  display: flex
  justify-content: space-between
  align-items: flex-start
  width: 100%
  column-gap: 10px

.bp-cross-chain-passport-edit-head
    display: flex
    align-items: flex-start
    column-gap: 15px
    justify-content: space-between

    span
        width: auto
        margin-right: 15px
        font-size: 13px
        color: #87878E
        text-align: right

    > div:first-child
        width: 90%
            
        h2
            margin: 0
        p
            color: var(--blue-color)
    button
        &:not(:last-of-type)
          margin-right: 20px

.bp-cross-chain-head__input
  width: 210px

.bp-cross-chain-passport-edit__wrapper
  display: flex
  flex-wrap: wrap
  row-gap: 20px
  align-items: center
  justify-content: flex-end

.list-bp__left-side
  min-width: 0
  width: 100% !important
  flex-grow: 1
  max-width: 277px

  h4
    padding-bottom: 0px

  @media (min-width: 1380px)
    max-width: 378px

  @media (min-width: 1480px)
    max-width: 460px

  @media (min-width: 1580px)
    max-width: 550px

  @media (min-width: 1680px)
    max-width: 650px
  
  @media (min-width: 1780px)
    max-width: 740px

  @media (min-width: 1880px)
    max-width: 830px
</style>
