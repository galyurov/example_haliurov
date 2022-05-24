e
<template>
  <modal
    class="modal"
    name="remove_graph"
    height="500px"
    width="35%"
    @before-open="beforeOpen"
  >
    <div class="modal__content modal_remove">      
        <img class="icon_style" src="@/assets/images/error.svg"/>
      <h2 class="modal__title title">
        Закрыть форму создания сквозной цепочки?        
      </h2>
      <p
        class="modal__description"
      >
        Все внесенные данные будут удалены 
      </p>
      <button
        class="button button_size_long button_s"
        type="button"
        @click="remove"
      >
        Закрыть
      </button>
      <button
        class="button button_size_long button_s"
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
            onRemove: null,
            onCancel: null
        }
    },
    methods: {
        beforeOpen ({ params: data }) {
            this.$resetData()
            this.setData(data)
        },
        setData ({ onRemove, onCancel }) {
            this.onRemove = onRemove
            this.onCancel = onCancel
        },
        remove () {
            this.onRemove && this.onRemove()
            this.$modal.hide('remove_graph')
        },
        cancel () {
            this.onCancel && this.onCancel()
            this.$modal.hide('remove_graph')
        }
    }
}
</script>

<style lang="sass" scoped>
  @import "@/assets/sass/components/modal-remove"
</style>

<style lang="sass" scoped>
.modal_remove
    gap: 16px

.button_s
    width: 261px
    height: 40px
.icon_style
    padding-bottom: 26px
</style>