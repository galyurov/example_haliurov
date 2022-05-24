<template>
  <modal
    class="modal"
    name="remove_bp_chain"
    height="auto"
    width="35%"
    @before-open="beforeOpen"
  >
    <div class="modal__content">
      <svg
        class="modal__icon"
        width="80"
        height="80"
        aria-hidden="true"
        focusable="false"
      >
        <use href="@/assets/images/sprites.svg#trash-modal"></use>
      </svg>
      <h2 class="modal__title title">
        Вы точно хотите удалить сквозную цепочку?
      </h2>
      <p class="modal__subtitle">
        Данные нельзя будет восстановить после удаления
      </p>
      <button
        class="button_s button button_font-weight_bold button_state_cancel"
        type="button"
        @click="remove"
      >
        Удалить
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
            onRemove: null
        }
    },
    methods: {
        beforeOpen ({ params: data }) {
            this.$resetData()
            this.setData(data)
        },
        setData ({ onRemove }) {
            this.onRemove = onRemove
        },
        remove () {
            this.onRemove()
            this.$modal.hide('remove_bp_chain')
        },
        cancel () {
            this.$modal.hide('remove_bp_chain')
        }
    }
}
</script>

<style lang="sass" scoped>
  @import "@/assets/sass/components/modal-remove"
</style>

<style lang="sass" scoped>
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
