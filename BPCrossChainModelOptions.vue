<template>
    <div class="bp-cross-chain-model">
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
        <div class="bp-cross-chain-model-head">
            <div>
                <h2 class="bp-cross-chain-model-head__title">Параметры модели сквозной цепочки</h2>
                <p>Выберите начальные и конечные процессы сквозной цепочки, чтобы построить граф между ними </p>
            </div>
            <div class="bp-cross-chain-model-head-buttons">
                <button
                    class="button button_type_icon-square button_state_cancel"
                    v-tippy="{ theme: 'red'}"
                    content="Закрыть"
                    @click="abort"
                >
                    <svg width="14" height="14" viewBox="0 0 14 14">
                        <use href="@/assets/images/sprites.svg#modal-close"></use>
                    </svg>
                </button>
                <button
                    class="button button_type_icon-square"
                    :class="isFullFilled ? 'button_state_save' : 'button_theme_disabled'"
                    v-tippy="{ theme: isFullFilled ? 'green' : 'grey'}"
                    content="Сохранить"
                    @click="save"
                >
                    <svg width="21" height="21" viewBox="0 0 21 21">
                        <use href="@/assets/images/sprites.svg#responsible-save"></use>
                    </svg>
                </button>
                <button
                    class="bp-cross-chain-model-head-buttons__button button"
                    :class="isStartFilled ? 'button_state_active' : 'button_state_disabled'"
                    @click="build"
                >
                    Построить СЦ
                </button>
            </div>
        </div>
        <div class="bp-cross-chain-model-options">
            <div>
                <h3 class="bp-cross-chain-model-options__title">Начальные процессы СЦ</h3>
                <div class="--option"
                     @click="$router.push({name: 'BPCrossChainBPSelector', params: { mode: 'start', chainId }})">
                    Выбрать начальные процессы
                </div>
                <div class="bp-cross-chain-model-options-bps">
                    <template v-for="group in chainGroups.filter(g => g.start && g.start.length)">
                        <div :key="group.bp.id" class="--item">
                            <div class="--del" @click="chain.resetChainByGroup(group.bp.id, 'start')">
                                &times;
                            </div>
                            <div class="--head">
                                [{{ group.bp.code | cutHtml }}] {{ group.bp.name | cutHtml }}
                            </div>
                            <div class="--owner">
                                {{ group | deep('bp.owner.name') | cutHtml }}
                            </div>
                            <template v-for="id in group.start">
                                <template v-for="bp in [chainStart.find(i => i.id === id)]">
                                    <div :key="bp.id" class="--sub">
                                        <div class="--del" @click.stop="chain.resetChain(bp.id, 'start')">
                                            &times;
                                        </div>
                                        <div>[{{ bp.code | cutHtml }}]</div>
                                        {{ bp.name | cutHtml }}
                                    </div>
                                </template>
                            </template>
                        </div>
                    </template>
                </div>
            </div>
            <div>
                <h3 class="bp-cross-chain-model-options__title">Конечные процессы СЦ</h3>
                <div class="--option" @click="$router.push({name: 'BPCrossChainBPSelector', params: { mode: 'end', chainId }})">
                    Выбрать конечные процессы
                </div>
                <div class="bp-cross-chain-model-options-bps">
                    <template v-for="group in chainGroups.filter(g => g.end && g.end.length)">
                        <div :key="group.bp.id" class="--item">
                            <div class="--del" @click="chain.resetChainByGroup(group.bp.id, 'end')">
                                &times;
                            </div>
                            <div class="--head">
                                [{{ group.bp.code | cutHtml }}] {{ group.bp.name | cutHtml }}
                            </div>
                            <div class="--owner">
                                {{ group | deep('bp.owner.name') | cutHtml }}
                            </div>
                            <template v-for="id in group.end">
                                <template v-for="bp in [chainEnd.find(i => i.id === id)]">
                                    <div :key="bp.id" class="--sub">
                                        <div class="--del" @click.stop="chain.resetChain(bp.id, 'end')">
                                            &times;
                                        </div>
                                        <div>[{{ bp.code | cutHtml }}]</div>
                                        {{ bp.name | cutHtml }}
                                    </div>
                                </template>
                            </template>
                        </div>
                    </template>
                </div>
            </div>
        </div>
        <div v-if="isFullFilled" class="bp-cross-chain-model-options --options-mid">
            <div>
                <div class="--option" @click="$router.push({name: 'BPCrossChainBPSelector', params: { mode: 'mid', chainId, bpFilter: chainMidIds }})">
                    Выбрать промежуточные процессы
                </div>
                <div class="bp-cross-chain-model-options-bps">
                    <template v-for="group in chainGroups.filter(g => g.mid && g.mid.length)">
                        <div :key="group.bp.id" class="--item">
                            <div class="--del" @click="chain.resetChainByGroup(group.bp.id, 'mid')">
                                &times;
                            </div>
                            <div class="--head">
                                [{{ group.bp.code | cutHtml }}] {{ group.bp.name | cutHtml }}
                            </div>
                            <div class="--owner">
                                {{ group | deep('bp.owner.name') | cutHtml }}
                            </div>
                            <template v-for="id in group.mid">
                                <template v-for="bp in [chainMid.find(i => i.id === id)]">
                                    <div :key="bp.id" class="--sub">
                                        <div class="--del" @click.stop="chain.resetChain(bp.id, 'mid')">
                                            &times;
                                        </div>
                                        <div>[{{ bp.code | cutHtml }}]</div>
                                        {{ bp.name | cutHtml }}
                                    </div>
                                </template>
                            </template>
                        </div>
                    </template>
                </div>
            </div>
        </div>
        <ConfirmationModal name="cross-chain-save">
            <CustomInput
                v-model="bpCrossChainName"
                placeholder="Название сквозной цепочки"
            />
            <h4 class="cross-chain-save-error" v-show="isErrorName">Заполните название сквозной цепочки</h4>
        </ConfirmationModal>
    </div>
</template>

<script>
import ConfirmationModal from "@/views/shared/ConfirmationModal";
import {CHAIN_CREATE_ID} from "./entities/chain";
import Passport from "./entities/passport";
import factories from "./services/factories";
import {BP_CROSS_CHAIN_STATE_NAME} from "@/views/bp_cross_chain/bp_cross_chain.state";

export default {
    name: "BPCrossChainModelOptions",
    components: {ConfirmationModal},
    props:{
        chainId: {
          type: Number,
          default: null
        }
    },
    data() {
        const chain = factories.getOrCreateChain(this.chainId || CHAIN_CREATE_ID)
        return {
            bpCrossChainName: null,
            isErrorName: false,
            chain,
        }
    },
    created() {
        this.$repo('bp/e2e').getMap().then(({ data }) => {
            if (!data?.access?.modify) {
                this.$router.replace('/forbidden')
            }
        })
        this.$rs.useHandler({
            repo: 'bp/e2e',
            method: 'buildModelOptions',
            onCatch: (e) => {
                if (e.response.data.error === "Forbidden") {
                    this.$router.replace({name: 'Forbidden'})
                } else {
                    this.$confirm({
                        type: 'danger',
                        title: 'Внимание!',
                        text: e.response.data.message || e.message,
                        buttons: 'Вернуться'
                    })
                }
            }
        })
    },
    computed: {
        chainGroups() {
            return this.chain?.groups
        },
        chainStart() {
            return this.chain?.data.start
        },
        chainMid() {
            return this.chain?.data.mid
        },
        chainMidIds() {
            return this.chain?.data.mid.map(bp=> bp.id)
        },
        chainEnd() {
            return this.chain?.data.end
        },
        isStartFilled() {
            return this.chainStart.length > 0
        },
        isFullFilled() {
            return this.chainStart.length > 0 && this.chainEnd.length > 0
        }
    },
    methods: {
        async checkGraphBuilding() {
            const params = {
                START: this.chain.data.start.map(e => {
                    return {id: e.id}
                }),
                MID: this.chain.data.mid.map(e => {
                    return {id: e.id}
                }),
                END: this.chain.data.end.map(e => {
                    return {id: e.id}
                }),
            }

            return await this.$repo('bp/e2e').buildModelOptions(params)
        },
        save() {
            const saveHandler = () => {
                this.$confirm('cross-chain-save', {
                    title: 'Введите название сквозной цепочки',
                    buttons: [{
                        text: 'Сохранить',
                        bind: {class: 'button button_font-weight_bold button_state_save'},
                        on: {
                            click: () => {
                                if (this.bpCrossChainName === null || this.bpCrossChainName === "") {
                                    this.isErrorName = true
                                } else {
                                    this.$store.commit(`${BP_CROSS_CHAIN_STATE_NAME}/chainEdited`, this.chainMid?.length ? 'mid' : false)
                                    this.isErrorName = false
                                    let passport = new Passport(
                                        {
                                            name: this.bpCrossChainName,
                                        },
                                        this.chain
                                    )
                                    passport.createOnAPI().then(result => {
                                        this.$router.replace({
                                            name: 'BPCrossChainPassport',
                                            params: {id: result.data.id}
                                        })
                                    })
                                }
                            }
                        }
                    },
                        {
                            text: 'Отменить',
                            on: {
                                click: () => {
                                    this.bpCrossChainName = ''
                                    this.$modal.hide('cross-chain-save')
                                }
                            }
                        }]
                })
            }

            if (!this.isFullFilled) return

            this.checkGraphBuilding().then(saveHandler)

        },
        build() {
            if (!this.isStartFilled) return
            this.$store.commit(`${BP_CROSS_CHAIN_STATE_NAME}/chainEdited`, false)
            this.$router.push({name: 'BPCrossChainNewGraph', params:{id: this.chainId}})
        },
        abort() {
            const close = () => this.$router.push({ name: 'BPCrossChainMap' });

            if(this.chainGroups?.length){
                this.$confirm({
                    type: 'danger',
                    title: 'Закрыть форму создания сквозной цепочки?',
                    text: 'Все внесенные данные будут удалены',
                    buttons: [{
                        text: 'Закрыть',
                        bind: {class: 'button button_state_cancel'},
                        on: {
                            click: close
                        }
                    }, {
                        text: 'Отменить',
                        bind: {class: 'button'}
                    }]
                })
                return
            }

            close()
        },
    }
}
</script>

<style lang="sass" scoped>
.bp-cross-chain-model-head-buttons .button:last-child
    margin-right: 0

.bp-cross-chain-model
    .breadcrumbs
        margin: -30px 0 22px 0

    .bp-cross-chain-model-head
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
            min-width: 430px

            button
                margin-right: 20px

    .bp-cross-chain-model-options
        display: flex
        flex-direction: row
        gap: 40px
        justify-content: center

        > div
            width: 48.5%
            min-width: 48.5%

        &.--options-mid
            display: block

            > div
                width: 100%
                min-width: 100%

                .bp-cross-chain-model-options-bps > div
                    width: 20%

        .--option
            cursor: pointer
            margin-top: 40px
            background: rgba(32, 125, 211, 0.05)
            text-align: center
            border: 1px dashed #BEE0F5
            border-radius: 4px
            padding: 20px
            margin-bottom: 32px
            color: #66ADDE
            font-size: 17px

        &-bps
            display: flex
            flex-wrap: wrap
            flex-direction: row
            align-items: flex-start
            gap: 20px

            > div
                width: 40%
                min-width: 250px

            .--item
                background: #66ADDE
                padding: 13px 11px 13px 6px
                color: #fff
                position: relative

                .--del
                    position: absolute
                    top: 2px
                    right: 9px
                    font-size: 20px
                    cursor: pointer

                .--head
                    margin: 0 17px 0 8px

                    font-size: 13px

                .--owner
                    margin: 6px 17px 6px 8px
                    font-size: 12px

                .--sub
                    background: #fff
                    margin: 10px 0 0
                    padding: 14px 46px 14px 14px
                    color: #000
                    font-size: 13px
                    position: relative

                    .--del
                        color: #87878E


.cross-chain-save-error
    color: red

.bp-cross-chain-model-options__title
    font-size: 20px

.bp-cross-chain-model-head-buttons .button
    font-size: 15px

.bp-cross-chain-model-head-buttons
    display: flex
    justify-content: flex-end

.bp-cross-chain-model-head-buttons__button
    position: fixed
    right: 68px
    bottom: 40px
    z-index: 30

.bp-cross-chain-model-head__title
    font-size: 24px
    font-weight: 800
</style>
