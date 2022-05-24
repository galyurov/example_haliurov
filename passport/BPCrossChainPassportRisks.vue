<template>
    <div>
      <h4 class="bp-cross-chain-risks__title">Риски и контрольные процедуры</h4>

      <RisksMatrix
            v-for="risk in risks"
            :key="risk.bp.id"
            :title="risk.bp.code"
            :name="risk.bp.name"
        >
          <table class="table">
            <thead class="table__header">
              <tr class="table__row">
                <th class="table__heading">Степень риска</th>
                <th class="table__heading">Риск</th>
                <th class="table__heading">Описание</th>
                <th class="table__heading">Контрольные  процедуры</th>
              </tr>
            </thead>

            <tbody class="table__body">
                <tr v-for="risk in risk.risks" :key="risk.id">
                  <td class="table__cell"><span :style="{backgroundColor: risk.riskDegree.color}"></span></td>
                  <td class="table__cell">{{risk.risk}}</td>
                  <td class="table__cell">{{risk.description}}</td>
                  <td
                      class="table__cell"
                      v-html="($utils.findDeep(risk, 'controlProcedures', [])).map(i => i.name).join('<br>')"
                  ></td>
                </tr>
            </tbody>
          </table>
        </RisksMatrix>
    </div>
</template>

<script>
import RisksMatrix from '../RisksMatrix.vue'

export default {
  name: "BPCrossChainPassportRisks",
  props: {
    risks: Array
  },
  components: { RisksMatrix },
  created() { }
}
</script>

<style lang="sass" scoped>
.bp-cross-chain-risks

  &__title
    margin: 0
    margin-bottom: 54px
    font-size: 20px

.table
  width: 100%
  border-collapse: collapse

.table td, table th
  border: 1px solid #EDEFF5

.table__heading
    &:first-child
        width: 70px !important
        padding: 10px

    width: 405px !important
    height: 47px
    padding: 10px 16px
    text-align: center
    vertical-align: top
    background-color: #BEE0F5
    word-break: normal

.table tr
  transform: none !important

.table__cell
  padding: 10px 16px
  position: relative
  text-align: left
  vertical-align: top

  span
    position: absolute
    width: 20px
    height: 20px
    border-radius: 50%
    background-color: green

.matrix
  --space: 22px

  display: flex
  flex-direction: column
  align-items: flex-start
  row-gap: var(--space)
  padding-top: var(--space)
  padding-bottom: var(--space)

  border-bottom: 1px solid var(--gray-96-color)

  > *
    align-self: flex-start

  &:hover
    cursor: pointer

  &:first-of-type
    padding-top: 0

.matrix_state_active
  padding-bottom: 0

  border-bottom: none
</style>
