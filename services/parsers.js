export default {
    parseGraph: (model, onBp = () => {}) => {
        let types = {}

        model.forEach( e => {
            if(types[e.type]) {
                types[e.type].push(e.bps)
            } else {
                types[e.type] = [e.bps]
            }
        })

        return Object.entries(types).map(e => {
            let [type, bps] = e
            return bps.map((layer, index) => {
                if (type != 'MID') {
                    let parents = {}
                    layer.forEach(bp => {
                        let parent = bp.bp.parent
                        if (parents[parent.id] == null) {
                            parents[parent.id] = parent
                            parents[parent.id].children = []
                            parents[parent.id].layerIndex = index + 1
                        }
                        bp.bp.parent = null
                        parents[parent.id].children.push(bp)
                        onBp(bp.bp, parent, type)
                    })
                    return Object.values(parents)
                } else {
                    let parents = []
                    layer.forEach(bp => {
                        let parent = bp.bp.parent
                        parent.children = []
                        parent.layerIndex = index + 1
                        bp.bp.parent = null
                        bp.layerLink = `${bp.bp.id}-${parent.layerIndex}`
                        parent.children.push(bp)
                        parents.push(parent)
                        onBp(bp.bp, parent, type)
                    })
                    return Object.values(parents)
                }
            })
        })
    },
}
