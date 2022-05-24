r<template>
  <modal
    class="modal"
    name="reset_bp_chain"
    height="auto"
    width="35%"
    @before-open="beforeOpen"
  >
      <div class="modal__content">
          <img class="icon_style" src="@/assets/images/error.svg"/>
          <h2 class="modal__title title">
            Для построения модели СЦ необходимо выбрать начальные БП
          </h2>
          <p class="modal__subtitle">
            Необходимо выбрать стартовые БП
          </p>
          <button
            class="button_s button"
            type="button"
            @click="ok"
          >
            Ок
          </button>
          <button
              class="button_s button"
              type="button"
              @click="cancel"
          >
            Отмена
          </button>
      </div>
  </modal>
</template>

<script>

export default {
    data () {
        return {
            onOk: null,
            onCancel: null
        }
    },
    methods: {
        beforeOpen ({ params: data }) {
            this.$resetData()
            this.setData(data)
        },
        setData ({ onOk, onCancel }) {
            this.onOk = onOk
            this.onCancel = onCancel
        },
        ok () {
            this.onOk()
            this.close()
        },
        cancel () {
            this.onCancel && this.onCancel()
            this.close()
        },
        close() {
            this.$modal.hide('reset_bp_chain')
        }
    }
}
</script>

<style lang="sass" scoped>
  @import "@/assets/sass/components/modal-remove"
</style>

<style lang="sass" scoped>
  .icon_style
    margin-bottom: 32px

  .button_s
    margin-bottom: 16px
    width: 261px
    height: 40px

  .modal__content
    display: flex
    flex-direction: column
    align-items: center
    padding-top: 40px
    padding-right: 52px
    padding-bottom: 58px
    padding-left: 52px

  .modal__icon
    margin-bottom: 24px

  .modal__title,
  .modal__subtitle
    margin-top: 0
    margin-bottom: 0

    color: var(--dark-gray-color)

  .modal__title
    margin-bottom: 10px

    font-weight: 800
    font-size: 24px

  .modal__subtitle
    margin-bottom: 36px
    width: 226px;

    font-weight: 600
    text-align: center

  .modal__button
    width: 217px
    height: 40px
    margin-bottom: 15px

    &:last-child
      margin-bottom: 0
</style>
