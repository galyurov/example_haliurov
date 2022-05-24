import Vue from "vue"

export default class Passport {
    data = {}
    chain = null
    _vue = new Vue()

    constructor(modelData, chain) {
        this.chain = chain
        this.fromJSON(modelData)
    }

    setName(name) {
        this.data.name = name
    }

    setChain(chain) {
        this.chain = chain
    }

    setModel(model) {
        this.data.model = model
    }

    fromJSON(data) {
        this.data = data

        if (data.params) {
            this.chain.extend('start', data.params.START)
            this.chain.extend('mid', data.params.MID)
            this.chain.extend('end', data.params.END)
        }
    }

    toJSON() {
        return JSON.parse(JSON.stringify({
            ...this.data,
            params: this._makeParams()
        }))
    }

    clone() {
        return new Passport(this.toJSON(), this.chain)
    }

    createOnAPI(bpChain) {
        return this._vue.$repo('bp/e2e').createChain(
            this.data.name,
            this._makeParams(),
            this.data.model,
            bpChain
        ).then(r => {
            this.fromJSON(r.data)
        })
    }

    updateOnAPI() {
        return this._vue.$repo('bp/e2e').saveModel(
            this.data.id,
            this.toJSON()
        ).then(r => {
            this.fromJSON(r.data)
        })
    }

    removeOnApi() {
        return this._vue.$repo('bp/e2e').deleteChain(this.data.id)
    }

    _makeParams() {
        return {
            midMeaning: this.chain?.midMeaning,
            "START": this.chain.data.start,
            "MID": this.chain.data.mid,
            "END": this.chain.data.end
        }
    }
}
