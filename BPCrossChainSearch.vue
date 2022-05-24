<template>
    <div class="search-header">
        <div class="search-header__wrapper">
            <SearchBar
                class="main-header__search"
                v-model="searchString"
                placeholder="Введите название СЦ"
                :search-on-reset="true"
                @search="$emit('search', searchString)"
            />

            <button
                class="button button_size_long"
                type="button"
                @click="$emit('hide')"
            >
                Закрыть
            </button>
            <slot></slot>
        </div>
    </div>
</template>

<script>
export default {
    name: "BPCrossChainSearch",
    data (){
        return {
            viewSearchBar: false,
            searchString: ''
        }
    },
}
</script>

<style lang="sass" scoped>
.search-header
    display: flex
    flex-direction: column
    row-gap: 25px
    width: 100%

.search-header__wrapper
    display: flex
    justify-content: space-between
    column-gap: 29px

.search-header__filter
    min-width: 53px
    height: 48px
    padding: 0

    border-radius: 4px
    background-color: var(--blue-color)
    box-sizing: border-box
    border: none

    &:hover
        cursor: pointer

.search-header__filters
    display: flex
    flex-wrap: wrap
    gap: 16px

.search-header__tag
    position: relative

.search-header__tag-text,
.search-header__tag-close
    padding: 0

    border: none
    background-color: var(--background-color, transparent)

.search-header__tag-text
    --background-color: var(--blue-color)
    --space: 4px

    padding-top: var(--space)
    padding-right: calc(var(--space) * 8)
    padding-bottom: var(--space)
    padding-left: calc(var(--space) * 3)

    color: var(--white-color)

    border-radius: 24px

.search-header__tag-close
    position: absolute
    top: 50%
    right: 10px

    transform: translateY(-50%) scale(0.8)
</style>
