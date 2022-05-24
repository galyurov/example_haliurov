<template>
    <modal
        class="modal"
        name="bp_cross_chain_print"
        width="928px"
        height="85%"
        @before-open="beforeOpen"
    >
        <header class="modal__header">
            <h2 class="title title_type_inverse">
                Фильтр для печати карты СЦ
            </h2>
            <button
                class="modal__close"
                type="button"
                @click="$modal.hide('bp_cross_chain_print')"
            >
                <svg
                    class="modal__close-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 14 14"
                    width="14"
                    height="14"
                    fill="none"
                    aria-hidden="true"
                    focusable="false"
                >
                    <path
                        d="M1 1L7 7M7 7L1 13M7 7L13 1M7 7L13 13"
                        stroke="var(--white-color)"
                        stroke-width="2"
                        stroke-linejoin="round"
                    />
                </svg>
                <span class="visually-hidden">
          Закрыть модальное окно
        </span>
            </button>
        </header>
        <div class="modal__body">
            <template v-if="filterParams">
                <p class="modal__description">
                    По умолчанию выгружается карта со всеми СЦ
                </p>
                <div class="modal__block">
                    <h3 class="modal__subtitle">
                        Интервал дат
                    </h3>
                    <p class="modal__text">
                        (попадут СЦ, которые получили статус “Утвержден” в этот период)
                    </p>
                    <div class="modal__box" :key="filter.fromDate+filter.toDate">
                        <DatePicker
                            class="datepicher-start"
                            v-model="filter.fromDate"
                        />
                        <DatePicker
                            class="datepicher-end"
                            v-model="filter.toDate"
                        />
                    </div>
                </div>
                <div class="modal__block">
                    <h3 class="modal__subtitle">
                        Наименование СЦ
                    </h3>
                    <p class="modal__text">
                        (попадут СЦ, с указанным наименованием)
                    </p>
                    <CustomSelector
                        class="modal__input"
                        :options="filterParams.e2e"
                        v-model="filter.e2e"
                        placeholder="Выберите СЦ из списка имеющихся"
                        multiple
                        allowEmpty
                        trackBy="id"
                        :deletedFirst="false"
                    />
                </div>
                <div class="modal__block">
                    <h3 class="modal__subtitle">
                        ФИО владельца СЦ
                    </h3>
                    <p class="modal__text">
                        (попадут СЦ, в которых владельцем указан выбранный работник)
                    </p>
                    <CustomSelector
                        class="modal__input"
                        :options="filterParams.e2eOwners"
                        v-model="filter.e2eOwners"
                        placeholder="Выберите работников"
                        multiple
                        allowEmpty
                        trackBy="id"
                        :deletedFirst="false"
                    />
                </div>
                <div class="modal__block">
                    <h3 class="modal__subtitle">
                        БП, который входит в состав СЦ
                    </h3>
                    <p class="modal__text">
                        (попадут СЦ, в состав которых входит указанный БП)
                    </p>
                    <CustomSelector
                        class="modal__input"
                        :options="filterParams.bps"
                        v-model="filter.bps"
                        placeholder="Выберите БП"
                        multiple
                        allowEmpty
                        trackBy="id"
                        :deletedFirst="false"
                    />
                </div>
                <div class="modal__block">
                    <h3 class="modal__subtitle">
                        ФИО владельца БП
                    </h3>
                    <p class="modal__text">
                        (попадут СЦ, в которых участвует БП с указанным владельцем)
                    </p>
                    <CustomSelector
                        class="modal__input"
                        :options="filterParams.bpOwners"
                        v-model="filter.bpOwners"
                        placeholder="Выберите работников"
                        multiple
                        allowEmpty
                        trackBy="id"
                        :deletedFirst="false"
                    />
                </div>
                <div v-if="account.isExpert" class="modal__block">
                    <h3 class="modal__subtitle">
                        Статус
                    </h3>
                    <p class="modal__text">
                        (попадут СЦ с выбранным статусом)
                    </p>
                    <CustomSelector
                        class="modal__input"
                        :options="filterParams.status"
                        v-model="filter.status"
                        placeholder="Выберите статус"
                        :label="(v)=> `${statusCodes[v]}`"
                        multiple
                        trackBy=""
                        allowEmpty
                        :deletedFirst="false"
                    />
                </div>
                <div class="modal__buttons">
                    <button
                        class="button button_state_cancel"
                        type="button"
                        @click="reset"
                    >
                        Сбросить фильтр
                    </button>
                    <button
                        class="button button_state_save"
                        type="button"
                        @click="submit"
                    >
                        Напечатать
                    </button>
                </div>

            </template>
        </div>
    </modal>
</template>


<script>

import {Account} from "@/entities/account";

const filter = {
    fromDate: '',
    toDate: '',
    e2e: [],
    e2eOwners: [],
    bps: [],
    bpOwners: [],
    tz: '' + (-new Date().getTimezoneOffset()),
    status: ''
}
const statusCodes ={
    PROJECT: 'Проект',
    APPROVAL: 'На утверждении',
    APPROVED: 'Утверждён',
}
export default {
    data() {
        return {
            filterParams: null,
            filter: {...filter},
            onSubmit: null,
            statusCodes,
            account: new Account()
        }
    },
    methods: {
        beforeOpen({params: data}) {
            this.$resetData()
            this.setData(data)
            this.getFilterParams()
        },
        setData({onSubmit}) {
            this.onSubmit = onSubmit
        },
        getFilterParams() {
            return this.$repo('bp/e2e').getFilterParams().then((r) => {
                this.filterParams = r.data
            })
        },
        reset() {
            this.filter = {...filter}
        },
        submit() {
            const params = {...this.filter}
            Object.assign(params, {
                e2e: params.e2e.map(i=>i.id),
                e2eOwners: params.e2eOwners.map(i=>i.id),
                bps: params.bps.map(i=>i.id),
                bpOwners: params.bpOwners.map(i=>i.id),
                fromDate: this.$utils.dateFormat(params.fromDate),
                toDate: this.$utils.dateFormat(params.toDate),
                status: params.status
            })
            this.$utils.openLink(`/api/report/e2eChainReport?${this.$utils.uriEncode(params)}`)
            this.onSubmit && this.onSubmit(params)
        }
    }
}
</script>

<style lang="sass" scoped>
.modal /deep/ .vm--modal
    display: flex
    flex-direction: column

    background-color: transparent

.modal__header
    --space: 22px

    display: flex
    align-items: center
    justify-content: space-between
    padding-top: var(--space)
    padding-right: var(--space)
    padding-bottom: var(--space)
    padding-left: calc(var(--space) * 3)

    background-color: var(--blue-color)

.modal__close
    --size: 30px

    display: flex
    width: var(--size)
    height: var(--size)
    padding: 0

    background-color: transparent
    border: none

.modal__close-icon
    margin: auto

.modal__body
    display: flex
    flex-direction: column
    padding: 32px 64px
    flex-grow: 1

    background-color: var(--white-color)

    overflow-y: auto

.modal__description
    margin-top: 0
    margin-bottom: 58px

.modal__block
    display: flex
    align-items: center
    column-gap: 16px
    row-gap: 18px
    flex-wrap: wrap
    margin-bottom: 37px

.modal__subtitle
    margin-top: 0
    margin-bottom: 0

    font-size: 15px
    font-weight: 700

.modal__text
    margin-top: 0
    margin-bottom: 0

    font-size: 13px
    color: #bbbbc4

.modal__box
    display: flex
    column-gap: 24px
    width: 100%

.modal__input
    width: 100%

.modal__buttons
    display: flex
    column-gap: 24px
    align-self: flex-end
    margin-top: auto
</style>
