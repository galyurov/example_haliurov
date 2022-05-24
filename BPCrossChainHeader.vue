<template>
    <div  class="list-bp__header list-bp__header_type_cross-chain">
        <Search v-if="viewSearchBar" @search="search" @hide="hideSearchBar"/>
        <template v-else>
            <h4 class="list-bp__title title">
                <slot></slot>
            </h4>
            <div class="list-bp__wrapper">
                <div class="list-bp__search">
                    <input
                        class="main-search"
                        :value="searchString"
                        placeholder="Поиск"
                        @focus="showSearchBar"
                    >
                </div>
                <div class="list-bp__buttons">
                    <button
                        class="button button_type_icon"
                        type="button"
                        @click="$modal.show('bp_cross_chain_print', {})"
                    >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <mask id="mask0_18675:40673" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="16" height="16">
                        <rect width="16" height="16" fill="#C4C4C4"/>
                        </mask>
                        <g mask="url(#mask0_18675:40673)">
                        <path d="M12.9492 4.52734H12.5664V3.05078C12.5664 1.91998 11.6464 1 10.5156 1H5.48438C4.35357 1 3.43359 1.91998 3.43359 3.05078V4.52734H3.05078C1.91998 4.52734 1 5.44732 1 6.57812V9.85938C1 10.9902 1.91998 11.9102 3.05078 11.9102H3.43359V13.7695C3.43359 14.448 3.98558 15 4.66406 15H11.3359C12.0144 15 12.5664 14.448 12.5664 13.7695V11.9102H12.9492C14.08 11.9102 15 10.9902 15 9.85938V6.57812C15 5.44732 14.08 4.52734 12.9492 4.52734ZM4.25391 3.05078C4.25391 2.3723 4.80589 1.82031 5.48438 1.82031H10.5156C11.1941 1.82031 11.7461 2.3723 11.7461 3.05078V4.52734H4.25391V3.05078ZM11.7461 13.7695C11.7461 13.9957 11.5621 14.1797 11.3359 14.1797H4.66406C4.4379 14.1797 4.25391 13.9957 4.25391 13.7695V9.72266H11.7461V13.7695ZM14.1797 9.85938C14.1797 10.5379 13.6277 11.0898 12.9492 11.0898H12.5664V9.72266H12.8125C13.039 9.72266 13.2227 9.53902 13.2227 9.3125C13.2227 9.08598 13.039 8.90234 12.8125 8.90234H3.1875C2.96098 8.90234 2.77734 9.08598 2.77734 9.3125C2.77734 9.53902 2.96098 9.72266 3.1875 9.72266H3.43359V11.0898H3.05078C2.3723 11.0898 1.82031 10.5379 1.82031 9.85938V6.57812C1.82031 5.89964 2.3723 5.34766 3.05078 5.34766H12.9492C13.6277 5.34766 14.1797 5.89964 14.1797 6.57812V9.85938Z" fill="white" stroke="white" stroke-width="0.5"/>
                        <path d="M9.09375 10.6523H6.90625C6.67973 10.6523 6.49609 10.836 6.49609 11.0625C6.49609 11.289 6.67973 11.4727 6.90625 11.4727H9.09375C9.32027 11.4727 9.50391 11.289 9.50391 11.0625C9.50391 10.836 9.32027 10.6523 9.09375 10.6523Z" fill="white" stroke="white" stroke-width="0.5"/>
                        <path d="M9.09375 12.4023H6.90625C6.67973 12.4023 6.49609 12.586 6.49609 12.8125C6.49609 13.039 6.67973 13.2227 6.90625 13.2227H9.09375C9.32027 13.2227 9.50391 13.039 9.50391 12.8125C9.50391 12.586 9.32027 12.4023 9.09375 12.4023Z" fill="white" stroke="white" stroke-width="0.5"/>
                        <path d="M4.5 6.27734H3.1875C2.96098 6.27734 2.77734 6.46098 2.77734 6.6875C2.77734 6.91402 2.96098 7.09766 3.1875 7.09766H4.5C4.72652 7.09766 4.91016 6.91402 4.91016 6.6875C4.91016 6.46098 4.72652 6.27734 4.5 6.27734Z" fill="white" stroke="white" stroke-width="0.5"/>
                        </g>
                        </svg>
                        Печать карты СЦ
                    </button>
                    <button
                        v-if="account.isExpert"
                        type="button"
                        @click="createNew"
                        class="button button_type_icon"
                    >
                        <svg
                            width="8"
                            height="8"
                        >
                            <use href="@/assets/images/sprites.svg#plus"></use>
                        </svg>
                        Построить СЦ
                    </button>
                </div>
            </div>
        </template>
        <BPCrossChainPrintModal />
    </div>
</template>

<script>
import Search from './BPCrossChainSearch.vue'
import BPCrossChainPrintModal from "./BPCrossChainPrintModal";
import storeService from "./services/store_service"
import {Account} from "@/entities/account";


export default {
    name: "BPCrossChainHeader",
    components: {
        Search,
        BPCrossChainPrintModal
    },
    data (){
        return {
            viewSearchBar: false,
            searchString: '',
            account: new Account()
        }
    },
    methods: {
        refreshView () {
            this.$nextTick(() => { })
        },
        showSearchBar () {
            this.$emit('search-mode-on')
            this.viewSearchBar = true
        },
        hideSearchBar () {
            this.$emit('search-mode-off')
            this.viewSearchBar = false
            this.$emit('search', '')
        },
        search(searchString) {
            this.$emit('search', searchString)
        },
        createNew() {
            storeService.clear()
            this.$router.push({ name: 'BPCrossChainModelOptions' })
        }
    }
}
</script>

<style lang="sass">
@import "@/assets/sass/pages/list-bp"

.knobs__tile
    display: flex

    img
        padding-right: 6px
        width: 11px
        height: 10.5px
        padding-left: 18px
        padding-top: 19px
    p
        left: 21px
        margin-top: 17px

.list-bp__header_type_cross-chain
    padding-top: 10px
    padding-bottom: 32px

.list-bp__header_type_cross-chain .title
    align-self: flex-start

.list-bp__header_type_cross-chain .button
    font-size: 15px
</style>
