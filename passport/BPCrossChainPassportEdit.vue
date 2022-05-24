<template>
  <div>    
    <div class="bp-cross-chain-passport-edit-body">
      <div class="card-view__name card-view__name--mod">
        <CustomInput
            :ref="'name'"
            :validation="true"
            title="Наименование сквозной цепоки"
            placeholder="Введите наименование сквозной цепоки"
            v-model="passport.data.name"
        />
      </div>
      <div class="card-container">
        <div class="card-view__goal card-view__name--mod">
          <CustomInput
              :ref="'goals'"
              title="Цели/Результат"
              placeholder="Введите цели/результат"
              v-model="passport.data.goals"
              :wrapOnEnter="true"
          />
        </div>
        <div class="card-view__owner">
              <img v-if="passport.data.owner && passport.data.owner.photo" class="card-view__owner-img" :src="$utils.userPhoto(passport.data.owner)">
              <img
                v-else
                class="profile__image"                
                src="~@/assets/images/default-user.svg"
                width="35"
                height="35"
              >
              <div class="card-view__owner-line">
                  <div class="card-view__owner-p card-view__owner-p--mod"> Владелец бизнес-процесса</div>                  
                  <div class="card-view__select-box card-view__select-box--mod">
                      <div class="card-view__box custom-owner">
                              <CustomInput
                                  :value="passport.data.owner && $filters.cutHtml(passport.data.owner.name)"
                                  :placeholder="`Выберите Владельца`"
                                  class="card-view__input"
                                  :class="{ deleted: passport.data.owner && passport.data.owner.deleted, 'empty-option': !passport.data.owner || !passport.data.owner.name}"
                                  :show-controls="{select: true}"
                                  :controls="[{controlSelect: {bind: {style: {margin: '20px 0 0 10px'}}}}]"                                           
                                  @focus="showOwnerSelector()"
                              />
                      </div>
                      </div>                                    
              </div>
          </div>
        <!-- </div> -->
      </div>
        <div class="card-view__kpi card-view__name--mod">
          <CustomInput
              :ref="'kpi'"
              title="КПЭ СЦ"
              placeholder="Введите КПЭ СЦ"
              v-model="passport.data.kpi"
              :wrapOnEnter="true"
          />
        </div>
    </div>
    <OwnerSelectorModal/>
  </div>
</template>

<script>
import infoService from '../../bp_shared/services'
import OwnerSelectorModal from '../../shared/OwnerSelectorModal.vue'

export default {
  name: "BPCrossChainPassportEdit",
  components: {
      OwnerSelectorModal
  },
  props: {
    passport: Object
  },
  data () {
    return {
      infoService: infoService,
      orgs: [],
      subdivisions: [],
      expand: this.expanded,
      value: ""
    }
  },
  created() {
      this.value = this.passport.data.kpi    
      this.$on('input', this.input)
  },
  methods: {
    input(e) {
      console.log(e)
    },
    showOwnerSelector () {
      this.$modal.show('owner_selector', {
        onSelect: owner => this.passport.data.owner = owner,
        currentOwner: this.passport.data.owner
      })
    },    
  },
};
</script>

<style lang="sass" scoped>
.bp-cross-chain-passport-edit-body
  margin-top: 84px

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

.bp-cross-chain-head__input
  width: 210px

.card-view__kpi
  margin-top: 41px

.card-view__owner-p--mod
  visibility: hidden
</style>
