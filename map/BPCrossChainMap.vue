<template>
    <div>
        <BreadCrumbs class="breadcrumbs" style="margin-top: -30px; margin-bottom: 20px">
            <li class="breadcrumb__item">
                <router-link
                    class="breadcrumb__link"
                    :to="{ name: 'BPCrossChainMap' }"
                >
                    Сквозные цепочки /
                </router-link>
            </li>
        </BreadCrumbs>
        <template v-if="bp">
            <h4 class="list-bp__title title" style="margin-bottom: 30px">
                Сквозные цепочки, в которых участвует [{{bp.code}}] {{bp.name}}
            </h4>
        </template>
        <Header v-else @search="search">Карта сквозных цепочек</Header>
        <div v-if="filteredBlocks && filteredBlocks.length > 0">
            <Block
                v-for="block in filteredBlocks"
                :searchString="searchString"
                :key="block.id"
                :bps="block"
                :bpSearched="bp"
            />
        </div>
        <NotFound class="bp-cross-chain-map-not-found" v-else-if="filteredBlocks && filteredBlocks.length == 0">
            <p v-if="!searchString">Для создания сквозных цепочек нажмите "+ Построить СЦ"</p>
         </NotFound>
        <p v-else style="text-align:  center"> Для создания сквозных цепочек нажмите "+ Построить СЦ"</p>
    </div>
</template>

<script>
import Header from '../BPCrossChainHeader.vue'
import Block from './BPCrossChainMapBlock.vue'

export default {
    name: "BPCrossChainMap",
    components: {Header, Block},
    data() {
        return {
            blocks: null,
            filteredBlocks: null,
            bp: null,
            searchString: ''
        }
    },
    created() {
        const params = {}
        if (this.$route.query.bps) {
            params.bps = this.$route.query.bps
            this.$repo('bp/passport').getView(params.bps).then((r) => {
                this.bp = r.data
            })
        }
        this.getBPMap(false, params)
    },
    methods: {
        getBPMap (bg, params) {
            this.$rs.useLoader(!bg).repo('bp/e2e').getMap(params)
                .then((r) => {
                    this.blocks = r.data.passports;
                    this.filteredBlocks = r.data.passports;
                })
        },
        search(query) {
            this.searchString = query.toLowerCase();
            if (query.length == 0) {
                this.filteredBlocks = this.blocks;
            } else {
                this.filteredBlocks = this.blocks.filter(e => { return JSON.stringify(e).toLowerCase().includes(this.searchString) });
            }
        }
    }
}
</script>

<style lang="sass" scoped>
/deep/
.not-found.bp-cross-chain-map-not-found
    margin-top: 90px
</style>
