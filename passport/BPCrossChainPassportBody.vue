<template>
  <div class="bp-cross-chain-passport-body">
    <div class="bp-cross-chain-passport-info">
      <div class="bp-cross-chain-passport-info__item">
        <span class="font-gray">Цели/Результат</span>
        <p v-if="passport.data.goals" class="font-black-15r ">{{passport.data.goals}}</p>
        <p v-else>Цели не заданы</p>
      </div>
      <div class="bp-cross-chain-passport-info__item">
        <span class="font-gray">КПЭ СЦ</span>
      <div class="bp-cross-chain-passport-kp">
        <p v-if="passport.data.kpi" class="font-black-15r">{{passport.data.kpi}}</p>
        <p v-else>КПЭ не заданы</p>
      </div>        
      </div>
    </div>
    <div class="bp-cross-chain-passport-owner">
      <span class="font-gray">Владелец сквозной цепочки</span>
      <div class="bp-cross-chain-passport-owner-container">
        <img 
        v-if="passport.data.owner && passport.data.owner.photo"
        :src="passport.data.owner.photo"
        alt="img"
        width="35"
        height="35"
        />
        <img
          v-else
          class="profile__image"                
          src="~@/assets/images/default-user.svg"
          width="35"
          height="35"
        >
              <div class="bp-cross-chain-passport-owner-container-title">
                <span v-if="passport.data.owner" class="bp-cross-chain-passport-owner-container__name">{{passport.data.owner.name}}</span>
                <p v-else>-</p>
              </div>        
      </div>
  </div>
</div>
</template>

<script>

export default {
  name: "BPCrossChainPassportBody",
  props: {
    passport: Object,    
  }
}
</script>

<style lang="sass" scoped>
  
.bp-cross-chain-passport-body
  display: flex
  margin-top: 40px

.bp-cross-chain-passport-info 
  width: 55%;
  gap: 30px;
  display: grid;

  &__item
    white-space: pre-wrap
    overflow-wrap: break-word
    display: grid
    gap: 8px

    span
      margin: 0 0 8px

    p
      margin: 0
      max-width: 430px
    
    li
      max-width: 570px
      
      &::marker
        content: '— '
    -kp
      gap: 0px

.bp-cross-chain-passport-owner
  display: flex
  flex-direction: column
  gap: 8px

  &-container
    display: flex

    &-title
      padding-left: 18px
      
    span
      display: block

    img
      top: 20px
      clip-path: circle(17px at center)

    p
      margin: 0

    &__name
      margin-bottom: 5px
      font-size: 15px;
      color: #323C47;

    &__subtitle
      max-width: 350px
      font-size: 15px

.font-gray
  font-size: 13px;
  color: #BBBBC4;
</style>