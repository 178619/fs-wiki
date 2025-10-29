const Wiklo = (()=>{

const Wiklo = {}
const {document, location} = window
Wiklo.metadataTemp = []
Wiklo.getMetadata = async () => {
    if (Wiklo.metadataTemp.length) return Wiklo.metadataTemp[0]
    Wiklo.metadataTemp.push(await (await fetch('./metadata.json')).json())
    return Wiklo.metadataTemp[0] || {}
}
Wiklo.getMetadataUnsafe = () => {
    return Wiklo.metadataTemp[0] || {}
}
Wiklo.middot = '⋅'
Wiklo.title = 'Wiklo'
Wiklo.home = 'Homepage'
Wiklo._truevalues = [true, 'on', 'yes', 'true', '1', 1, 'y']
Wiklo.getTrue = v => Wiklo._truevalues.includes(v)
Wiklo.PAGENAME = ''
Wiklo.PAGEUUID = ''
Object.defineProperty(Wiklo, 'PAGEINFO', {
    get: () => {
        return Wiklo.getMetadataUnsafe()[Wiklo.PAGEUUID]
    }
})
Wiklo.alert = (v, t='INFO', l=4000, k=null) => {
    if (!document.querySelector('#wiklo-alert-container')) {
        const c = document.createElement('div')
        c.id = 'wiklo-alert-container'
        document.body.appendChild(c)
    }
    if (k && document.querySelector('#wiklo-alert-container > #wiklo-alert-' + k)) return
    const d = document.createElement('div')
    d.innerHTML = v
    if (t) d.classList.add(t.toUpperCase())
    if (k) d.id = '#wiklo-alert-' + k
    document.querySelector('#wiklo-alert-container').appendChild(d)
    d.style.opacity = 1
    setTimeout(()=>{if (d) d.style.right = '-16384px'}, l)
    setTimeout(()=>{if (d) d.remove()}, l+2000)
}
Wiklo._searchEngineReferrers = [
    'https://www.google.com/',
    'https://duckduckgo.com/',
    'https://www.bing.com/',
    'https://search.yahoo.co.jp/',
    'https://search.yahoo.com/',
    'https://yandex.com/',
    'https://search.naver.com/',
    'https://search.brave.com/'
]
Wiklo._supportedCustomTypes = {}
Wiklo._supportedCustomTypes['application/json'] = Wiklo._supportedCustomTypes['text/json'] = (value) => {
    try {
        value = JSON.parse(value)
    } catch (e) {
        return value
    }
    value = JSON.stringify(value, null, 4).replaceAll('<', '&#x3C;').replaceAll('>', '&#x3E;')
    if (value.match(/^"([^\n]*?[^\\])"$/gs)) return '<span class="string">' + value + '</span>'
    if (value.match(/^-?\d+(\.\d+)?([eE][-+]?\d+)?$/gs)) return '<span class="number">' + value + '</span>'
    if (value.match(/^(true|false)$/gs)) return '<span class="boolean">' + value + '</span>'
    if (value == 'null') return '<span class="null">null</span>'
    value = value.replace(/^(\s+)"(.*?[^\\])":/gm, (v) => `<span class="key">${v.slice(0, -1)}</span>:`)
    value = value.replace(/(>:\s)"((?:[^"\\]|\\.)*)"/gm, (v) => v.slice(0, 3) + '<span class="string">' + v.slice(3) + '</span>')
    value = value.replace(/(>:\s)(true|false)/gm, (v) => v.slice(0, 3) + '<span class="boolean">' + v.slice(3) + '</span>')
    value = value.replace(/(>:\s)(null)/gm, (v) => v.slice(0, 3) + '<span class="null">' + v.slice(3) + '</span>')
    value = value.replace(/(>:\s)(-?\d+(\.\d+)?([eE][-+]?\d+)?)/gm, (v) => v.slice(0, 3) + '<span class="number">' + v.slice(3) + '</span>')
    value = value.replace(/^\s+"(.*?[^\\])"/gm, (v) => `<span class="string">${v}</span>`)
    value = value.replace(/^\s+(-?\d+(\.\d+)?([eE][-+]?\d+)?)/gm, (v) => `<span class="number">${v}</span>`)
    value = value.replace(/^\s+(true|false)/gm, (v) => '<span class="boolean">' + v + '</span>')
    value = value.replace(/^\s+(null)/gm, (v) => '<span class="null">' + v + '</span>')
    return '<code lang="json">' + value + '</code>'
}
Wiklo._supportedObjectTypes = [
    'application/pdf'
]
Wiklo._supportedCodeTypes = [
    'text/html',
    'text/javascript',
    'text/css',
    'text/xml',
    'text/x-python',
    'application/x-javascript',
    'application/xml'
]
Wiklo._super = {
    '0': '⁰',
    '1': '¹',
    '2': '²',
    '3': '³',
    '4': '⁴',
    '5': '⁵',
    '6': '⁶',
    '7': '⁷',
    '8': '⁸',
    '9': '⁹',
    '+': '⁺',
    '-': '⁻',
    '=': '⁼',
    '(': '⁽',
    ')': '⁾',
}
Wiklo._sub = {
    '0': '₀',
    '1': '₁',
    '2': '₂',
    '3': '₃',
    '4': '₄',
    '5': '₅',
    '6': '₆',
    '7': '₇',
    '8': '₈',
    '9': '₉',
    '+': '₊',
    '-': '₋',
    '=': '₌',
    '(': '₍',
    ')': '₎',
}
Wiklo._digital = {
    '0': '🯰',
    '1': '🯱',
    '2': '🯲',
    '3': '🯳',
    '4': '🯴',
    '5': '🯵',
    '6': '🯶',
    '7': '🯷',
    '8': '🯸',
    '9': '🯹'
}
Wiklo.toSuper = (v) => v.toString().split('').map(k=>Wiklo._super[k]||k).join('')
Wiklo.toSub = (v) => v.toString().split('').map(k=>Wiklo._sub[k]||k).join('')
Wiklo.retryImage = async (e, v) => {
    const metadata = await Wiklo.getMetadata()
    if (metadata[v] && metadata[v].MIMEType == 'image/svg+xml') {
        const data = await Wiklo.loadUUIDData(v)
        if (data) {
            const text = await data.text()
            // e.outerHTML = text // This should be avoided
            const src = 'data:image/svg+xml;base64,' + btoa(text)
            if (e.src != src) {
                e.src = src
                return
            }
        }
    }
    Wiklo.alert('Image load Failed.', 'WARN')
}
Wiklo.moduleHandlers = {
    'pageuuid': () => Wiklo.PAGEUUID,
    'nest': (args, kwargs) => {
        if (!args.length) return ``
        let uuid = ''
        if (args[0].match(/^[0-9a-f]{32}$/)) uuid = args[0]
        else {
            const uuidTemp = Wiklo.getPageUUIDUnsafe(decodeURIComponent(args[0]), Wiklo.PAGEINFO?.categories || [])
            if (uuidTemp) uuid = uuidTemp
        }
        if (uuid) {
            const metadata = Wiklo.getMetadataUnsafe()
            if (metadata[uuid]) {
                if (metadata[uuid].MIMEType.startsWith('image')) {
                    return Wiklo.moduleHandlers['nestimage'](args, kwargs)
                } else if (metadata[uuid].MIMEType.startsWith('audio')) {
                    return Wiklo.moduleHandlers['nestaudio'](args, kwargs)
                } else if (metadata[uuid].MIMEType.startsWith('video')) {
                    return Wiklo.moduleHandlers['nestvideo'](args, kwargs)
                }
            }
        }
        return '<section class="included" onloadedmetadata="Wiklo.getUUIDPageComponent(this)" uuid="'+uuid+'"></section>'
    },
    'articlelist': (args, kwargs) => {
        const metadata = Wiklo.getMetadataUnsafe()
        const sortedby = kwargs.sortedby || 'name'
        const reversed = Wiklo.getTrue(kwargs.reversed)
        const category = (kwargs.category && kwargs.category.match(/^[0-9a-f]{32}$/) ? kwargs.category : null) || (kwargs.category ? Wiklo.getPageUUIDUnsafe(decodeURIComponent(kwargs.category), [true]) : null) || kwargs.category || args.includes('category') || null
        return '<ol>'+Object.entries(metadata).filter(([uuid, {categories, revised}])=>(category === null||categories.includes(category))&&!revised).sort((a,b)=>{return ((a[1][sortedby] > b[1][sortedby]) - (b[1][sortedby] > a[1][sortedby])) * (reversed ? -1 : 1)}).map(([uuid, {name}])=>{
            return `<li>[[${uuid}|${name}|title=${name}]]</li>`
        }).join('')+'</ol>'
    },
    'nestimage': (args, kwargs) => {
        if (!args.length) return '<img src="">'
        let source = null
        let uuid = null
        if (args[0].match(/^[0-9a-f]{32}$/)) source = './data/' + args[0]
        else if (args[0].startsWith('http://') || args[0].startsWith('https://')) source = args[0]
        else {
            uuid = Wiklo.getPageUUIDUnsafe(decodeURIComponent(args[0]), Wiklo.PAGEINFO?.categories || [])
            if (uuid) source = './data/' + uuid
        }
        if (!source) '<img src="">'
        return `<img src="${source}"${kwargs.class ? (' class="'+kwargs.class+'"') : ''} width="${kwargs.width}" height="${kwargs.height}" onerror="Wiklo.retryImage(this, '${uuid || args[0]}')">`
    },
    'nestaudio': (args, kwargs) => {
        if (!args.length) return '<audio></audio>'
        const native = Wiklo.getTrue(kwargs.native)
        const tag = `<audio preload="metadata" onloadedmetadata="Wiklo.media(this)"${native ? ' controls' : ''}>${args.map((v)=>{
            let source = ''
            if (v.match(/^[0-9a-f]{32}$/)) source = './data/' + v
            if (v.startsWith('http://') || v.startsWith('https://')) source = v
            else {
                const uuid = Wiklo.getPageUUIDUnsafe(decodeURIComponent(v), Wiklo.PAGEINFO?.categories || [])
                if (uuid) source = './data/' + uuid
            }
            return source ? `<source src=${source}>` : ''
        }).join('')}</audio>`
        if (native) return tag
        return '<div class="mediamodule"><button class="play-pause"></button><button class="loop"></button><input class="seeker" type="range" value="0" min="0" max="0"><div class="current">--:-- / --:--</div><button class="volume-icon"></button><input class="volume" type="range" value="0" min="0" max="1" step="0.000001"><button class="info"></button>' + tag + '</div>'
    },
    'nestvideo': (args, kwargs) => {
        if (!args.length) return '<video></video>'
        const native = Wiklo.getTrue(kwargs.native)
        const tag = `<video preload="auto" onloadedmetadata="Wiklo.media(this)"${native ? ' controls' : ''}${kwargs.width ? ` width="${kwargs.width}"` : ''}${kwargs.height ? ` height="${kwargs.height}"` : ''}>${args.map((v)=>{
            let source = ''
            if (v.match(/^[0-9a-f]{32}$/)) source = './data/' + v
            if (v.startsWith('http://') || v.startsWith('https://')) source = v
            else {
                const uuid = Wiklo.getPageUUIDUnsafe(decodeURIComponent(v), Wiklo.PAGEINFO?.categories || [])
                if (uuid) source = './data/' + uuid
            }
            return source ? `<source src=${source}>` : ''
        }).join('')} + '</video>`
        if (native) return tag
        return '<div class="mediamodule"><div class="videomask shown"><input class="seeker" type="range" value="0" min="0" max="0"><div class="controls"><div><button class="play-pause"></button><button class="loop"></button><div class="current">--:-- / --:--</div><button class="volume-icon"></button><input class="volume" type="range" value="0" min="0" max="1" step="0.000001"></div><div><button class="info"></button><button class="fullscreen"></button></div></div></div>' + tag + '</div>'
    },
    'nestobject': (args, kwargs) => {
        if (!args.length) return '<object data="">'
        let source = null
        let uuid = null
        if (args[0].match(/^[0-9a-f]{32}$/)) source = './data/' + args[0]
        else if (args[0].startsWith('http://') || args[0].startsWith('https://')) source = args[0]
        else {
            uuid = Wiklo.getPageUUIDUnsafe(decodeURIComponent(args[0]), Wiklo.PAGEINFO?.categories || [])
            if (uuid) source = './data/' + uuid
        }
        if (!source) '<object data="">'
        return `<object data="${source}" width="${kwargs.width}" height="${kwargs.height}" type="${kwargs.type}"></object>`
    },
    'currentunixtime': () => Math.floor(new Date().valueOf() / 1000)+'',
    'revisionunixtime': () => (Wiklo.PAGEINFO?.lastModification || 0)+''
}
Wiklo.media = (element) => {
    const getTimeString = (v) => {
        if (!v) return '00:00'
        if (isNaN(v) || v == Infinity) return '--:--'
        return (v >= 3600 ? Math.floor(v / 3600) + ':' : '')
        + (((Math.floor(v % 3600 / 60) < 10 ? '0' : '') + Math.floor(v % 3600 / 60)) || '00') + ':'
        + (((Math.floor(v % 60) < 10 ? '0' : '') + Math.floor(v % 60)) || '00')
    }
    const mediamodule = element.parentElement
    if (!mediamodule.className.includes('mediamodule')) return
    const mask = mediamodule.querySelector('.videomask')
    if (mask) {
        const rect = element.getBoundingClientRect()
        mask.style.width = element.clientWidth + 'px'
        mask.style.height = element.clientHeight + 'px'
        mask.style.top = rect.top + 'px'
        mask.style.left = rect.left + 'px'
        mask.pointerWaitTime = 0
        setInterval(()=>{mask.pointerWaitTime -= 100}, 100)
        const hideMask = () => {setTimeout(()=>{if (mask.pointerWaitTime <= 0) mask.classList.remove('shown'); else hideMask()}, 100)}
        const showMask = () => {
            mask.classList.add('shown')
            mask.pointerWaitTime = 3000
            hideMask()
        }

        mask.addEventListener('mouseenter', (e) => {
            if (!mask.className.includes('shown')) {
                mask.classList.add('shown')
            }
        })
        mask.addEventListener('mouseleave', (e) => {
            if (mask.classList.value.includes('shown')) {
                mask.classList.remove('shown')
            }
        })
        mask.addEventListener('pointerdown', (e) => {
            if (e.target != mask || e.pointerType == 'mouse' && e.button != 0) return
            if (e.pointerType == 'touch') {
                if (mask.classList.value.includes('shown')) {
                    mask.classList.remove('shown')
                } else {
                    mask.classList.add('shown')
                }
            } else {
                if (!!(element.currentTime > 0 && !element.paused && !element.ended && element.readyState > 2)) {
                    element.pause()
                } else {
                    element.play()
                }
            }
        })
        mask.addEventListener('pointermove', (e) => {
            if (e.pointerType == "touch") return
            showMask()
        })
        mask.addEventListener('dblclick', (e) => {
            if (e.target != mask) return
            if (document.fullscreenElement) {
                document.exitFullscreen()
            } else {
                mediamodule.requestFullscreen()
            }
        })
        const relocate = () => {
            const rect = element.getBoundingClientRect()
            mask.style.width = element.clientWidth + 'px'
            mask.style.height = element.clientHeight + 'px'
            mask.style.top = rect.top + 'px'
            mask.style.left = rect.left + 'px'
        }
        window.addEventListener('resize', relocate)
        window.addEventListener('scroll', relocate)
    }
    const seeker = mediamodule.querySelector('.seeker')
    const volume = mediamodule.querySelector('.volume')
    const volumeIcon = mediamodule.querySelector('.volume-icon')
    mediamodule.querySelector('.current').textContent = getTimeString(element.currentTime) + ' / ' + getTimeString(element.duration)
    mediamodule.querySelector('.play-pause').addEventListener('click', ()=>{
        if (!!(element.currentTime > 0 && !element.paused && !element.ended && element.readyState > 2)) {
            element.pause()
        } else {
            element.play()
        }
    })
    const updateVolumeIcon = () => {
        if (element.muted) {
            volumeIcon.style.backgroundImage = 'url(./static/icons/volume-off.svg)'
        } else if (element.volume >= 0.75) {
            volumeIcon.style.backgroundImage = 'url(./static/icons/volume-4.svg)'
        } else if (element.volume >= 0.5) {
            volumeIcon.style.backgroundImage = 'url(./static/icons/volume-3.svg)'
        } else if (element.volume >= 0.25) {
            volumeIcon.style.backgroundImage = 'url(./static/icons/volume-2.svg)'
        } else if (element.volume) {
            volumeIcon.style.backgroundImage = 'url(./static/icons/volume-1.svg)'
        } else {
            volumeIcon.style.backgroundImage = 'url(./static/icons/volume-0.svg)'
        }
    }
    const updatePlaying = () => {
        if (!!(element.currentTime > 0 && !element.paused && !element.ended && element.readyState > 2)) {
            mediamodule.querySelector('.play-pause').style.backgroundImage = 'url(./static/icons/pause.svg)'
        } else {
            mediamodule.querySelector('.play-pause').style.backgroundImage = 'url(./static/icons/play.svg)'
        }
    }
    const updateVolume = () => {
        volume.value = element.volume
        volume.style.backgroundImage = `linear-gradient(to right, rgba(0,0,0,0) 6px, var(--text-color) 6px calc(6px + ${element.volume * 100}% - 12px * ${element.volume}), var(--date-color) calc(6px + ${element.volume * 100}% - 12px * ${element.volume}) calc(100% - 6px), rgba(0,0,0,0) calc(100% - 6px))`
        mediamodule.querySelector('.current').textContent = getTimeString(element.currentTime) + ' / ' + getTimeString(element.duration)
    }
    updateVolume()
    element.addEventListener('play', updatePlaying)
    element.addEventListener('playing', updatePlaying)
    element.addEventListener('pause', updatePlaying)
    element.addEventListener('timeupdate', ()=>{
        updatePlaying()
        seeker.max = element.duration * 1000
        seeker.value = element.currentTime * 1000
        const ct = element.currentTime / element.duration
        let bt
        if (element.buffered) for (let i=0; i<element.buffered.length; i++) {
            if (element.buffered.start(i) < element.currentTime && element.currentTime < element.buffered.end(i)) {
                bt = element.buffered.end(i) / element.duration
                break
            }
        }
        if (!bt) bt = ct
        seeker.style.backgroundImage = `linear-gradient(to right, rgba(0,0,0,0) 6px, var(--text-color) 6px calc(6px + ${ct * 100}% - 12px * ${ct}), var(--date-color) calc(6px + ${ct * 100}% - 12px * ${ct}) calc(6px + ${bt * 100}% - 12px * ${bt}), var(--layer-color) calc(6px + ${bt * 100}% - 12px * ${bt}) calc(100% - 6px), rgba(0,0,0,0) calc(100% - 6px))`
        mediamodule.querySelector('.current').textContent = getTimeString(element.currentTime) + ' / ' + getTimeString(element.duration)
    })
    element.addEventListener('volumechange', updateVolume)
    seeker.addEventListener('input', ()=>{
        element.currentTime = seeker.value / 1000
    })
    volume.addEventListener('input', ()=>{
        element.volume = volume.value
        updateVolumeIcon()
    })
    mediamodule.querySelector('.loop').addEventListener('click', ()=>{
        if (element.loop) {
            mediamodule.querySelector('.loop').style.backgroundImage = 'url(./static/icons/loop-off.svg)'
        } else {
            mediamodule.querySelector('.loop').style.backgroundImage = 'url(./static/icons/loop-one.svg)'
        }
        element.loop = !element.loop
    })
    volumeIcon.addEventListener('click', ()=>{
        element.muted = !element.muted
        updateVolumeIcon()
    })
    mediamodule.querySelector('.fullscreen')?.addEventListener('click', ()=>{
        if (document.fullscreenElement) {
            document.exitFullscreen()
        } else {
            mediamodule.requestFullscreen()
        }
    })
    mediamodule.querySelector('.info').addEventListener('click', ()=>{
        if (location.pathname == '/edit') return
        if (!element.currentSrc.startsWith(location.origin)) location.href = element.currentSrc
        if (element.currentSrc.endsWith(Wiklo.PAGEUUID)) return
        Wiklo.loadUUIDPage(decodeURIComponent(element.currentSrc.split('#')[0].slice(-32))).then(()=>{window.history.pushState(null, null, './?' + Wiklo.PAGEUUID); updateButtons(); document.title = Wiklo.PAGENAME + ' - ' + Wiklo.title})
    })
}
Wiklo.tryHead = (t) => {
    let q = 0
    while (t.startsWith('=')) {
        t = t.slice(1)
        q++
    }
    if (q > 6) return null
    const r = document.createElement('h'+q)
    while (t.endsWith('=')) {
        t = t.slice(0, -1)
        q--
    }
    if (q) return null
    t = t
    r.id = t.replace(/(<[\w/].*?>)/g, '').replace(/(\[\[.*?\]\]|\{\{.*?\}\})/g, v=>v.slice(2,-2)).trim()
    r.innerHTML = t.trim()
    return r
}
Wiklo.tagsHandlerGetTagList = (v) => {
    let tagLevel = 0
    let tagList = []
    for (let i = 1; i < v.length; i += 2) {
        let {name, options} = Wiklo.tagsHandlerGetVal(v[i])
        if (v[i].slice(1, -1).endsWith('/') && v[i].length != 3) {
            if (name.endsWith('/')) name = name.slice(0, -1)
            ++tagLevel
            tagList.push({tagLevel, name, options, index:i})
            tagList.push({tagLevel, name, index:i})
            tagLevel--
        } else if (!name.startsWith('/')) {
            ++tagLevel
            tagList.push({tagLevel, name, options, index:i})
        } else if (tagLevel > 0) {
            tagList.push({tagLevel, name:name.slice(1), index:i})
            tagLevel--
        }
    }
    tagList.sort((a,b)=>{return b.tagLevel - a.tagLevel})
    return tagList
}
Wiklo.tagsHandlerGetVal = (v) => {
    let val = v.slice(1, -1).replace(/\s+\=\s?(?=([^"]*"[^"]*")*[^"]*$)/g, '=').replace(/\s+(?=([^"]*"[^"]*")*[^"]*$)/g, '\n').split('\n')
    let name = val[0].toLowerCase()
    let options = {}
    val.forEach((k, j)=>{
        if (!j || k == '') return
        if (k.endsWith('/')) k = k.slice(0, -1)
        if (k.includes('=')) {
            let key = k.split('=')[0].trim().toLowerCase()
            let value = k.split('=').slice(1).join('').trim()
            if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1)
            options[key] = value
        } else {
            if (k.trim()) options[k.trim()] = ''
        }
    })
    return {name, options}
}
Wiklo.getRefname = (index, group=' ') => {
    index++
    if (group == 'lower-alpha' || group == 'upper-alpha') {
        let result = ''
        while (index > 0) {
            result = String.fromCharCode(0x41 + (index - 1) % 26) + result
            index = Math.floor((index - 1) / 26)
        }
        if (group.startsWith('lower-')) return result.toLowerCase()
        return result
    }
    return ((group && group != ' ') ? (group.replaceAll('<', '&#x3C;').replaceAll('>', '&#x3E;').replaceAll('"', '&#x22;').trim() + ' ') : '') + index.toString()
}
Wiklo.tagsHandlerMethods = {
    'ref': (v) => {
        v = v.split(/(<ref\s+.*?>|<ref>|<\/ref>)/g)
        const tagList = Wiklo.tagsHandlerGetTagList(v)
        const refgroups = {}
        const refList = []
        for (let i = 0; i < tagList.length; i += 2) {
            if (tagList[i].options) {
                if (!tagList[i+1]) continue
                let innerHTML = v.slice(tagList[i].index+1, tagList[i+1].index).join('').trim()
                for (let j = tagList[i].index; j <= tagList[i+1].index; j += 1) v[j] = ''
                if (!tagList[i].options.group) tagList[i].options.group = ' '
                if (!refgroups[tagList[i].options.group]) refgroups[tagList[i].options.group] = []
                if (!tagList[i].options.name || !refgroups[tagList[i].options.group].find(ref=>ref.id==tagList[i].options.name)) {
                    let id = tagList[i].options.name || (tagList[i].options.group.trim() + (refgroups[tagList[i].options.group].length+1))
                    v[tagList[i].index] = '<sup><a id="reflink1-'+id.replaceAll('<', '&#x3C;').replaceAll('>', '&#x3E;').replaceAll('"', '&#x22;')+'" href="#ref-'+id.replaceAll('<', '&#x3C;').replaceAll('>', '&#x3E;').replaceAll('"', '&#x22;')+'">[' + Wiklo.getRefname(refgroups[tagList[i].options.group].length, tagList[i].options.group) + ']</a><div class="refhover">'+innerHTML+'</div></sup>'
                    refgroups[tagList[i].options.group].push({id, name: tagList[i].options.name, value: innerHTML, number: 1})
                } else {
                    let ref = refgroups[tagList[i].options.group].find(ref=>ref.name==tagList[i].options.name)
                    ref.number += 1
                    if (innerHTML && !ref.value) ref.value = innerHTML
                    v[tagList[i].index] = '<sup><a id="reflink'+ref.number+'-'+ref.name.replaceAll('<', '&#x3C;').replaceAll('>', '&#x3E;').replaceAll('"', '&#x22;')+'" href="#ref-' + ref.name.replaceAll('<', '&#x3C;').replaceAll('>', '&#x3E;').replaceAll('"', '&#x22;') + '">[' + Wiklo.getRefname(refgroups[tagList[i].options.group].findIndex(ref=>ref.name==tagList[i].options.name), tagList[i].options.group) + ']</a><div class="refhover">'+ref.value+'</div></sup>'
                }
            } else {
                v[tagList[i].index] = ''
            }
        }
        Object.entries(refgroups).forEach(([group, list])=>list.forEach(ref=>{
            let node = document.createElement('li')
            node.classList.add('reflist-li')
            node.setAttribute('group', group)
            node.innerHTML = ''
            for (let i=0;i<ref.number; i++) node.innerHTML += '<a href="#reflink'+(i+1)+'-'+ref.id+'">'+Wiklo.toSuper(i+1)+'</a> '
            node.innerHTML += ref.value
            node.id = 'ref-' + ref.id
            v.push(node.outerHTML + '\n')
            delete node
        }))
        return v.join('')
    },
    'code': (v) => {
        v = v.split(/(<code\s+.*?>|<code>|<\/code>)/g)
        const tagList = Wiklo.tagsHandlerGetTagList(v)
        for (let i = 0; i < tagList.length; i += 2) {
            if (tagList[i].options) {
                if (!tagList[i+1]) continue
                let innerHTML = v.slice(tagList[i].index+1, tagList[i+1].index).join('')
                for (let j = tagList[i].index; j <= tagList[i+1].index; j += 1) v[j] = ''
                let node = document.createElement('code')
                Object.entries(tagList[i].options).forEach(([key, index])=>{
                    try {
                        node.setAttribute(key, index)
                    } catch (e) {
                    }
                })
                node.innerHTML = innerHTML.replaceAll('<', '&#x3C;').replaceAll('>', '&#x3E;')
                v[tagList[i].index] = node.outerHTML
            } else {
                v[tagList[i].index] = ''
            }
        }
        return v.join('')
    },
    // '': (v) => {
    //     v = v.split(/(<[\w/].*?>)/g)
    //     const tagList = Wiklo.tagsHandlerGetTagList(v)
    //     for (let i = 0; i < tagList.length; i++) {
    //         if (tagList[i].options) {
    //             if (!tagList[i+1]) {
    //                 if (tagList[i].name == 'script') {
    //                     v[tagList[i].index] = ''
    //                     break
    //                 }
    //                 let node = document.createElement(tagList[i].name)
    //                 Object.entries(tagList[i].options).forEach(([key, index])=>{
    //                     if (key.startsWith('on')) return
    //                     try {
    //                         node.setAttribute(key, index)
    //                     } catch (e) {
    //                     }
    //                 })
    //                 v[tagList[i].index] = node.outerHTML
    //                 break
    //             }
    //             let innerHTML = v.slice(tagList[i].index+1, tagList[i+1].index).join('')
    //             for (let j = tagList[i].index; j <= tagList[i+1].index; j += 1) {
    //                 v[j] = ''
    //             }
    //             if (tagList[i].name == 'script') {
    //                 v[tagList[i].index] = ''
    //                 break
    //             }
    //             let node = document.createElement(tagList[i].name)
    //             Object.entries(tagList[i].options).forEach(([key, index])=>{
    //                 if (key.startsWith('on')) return
    //                 try {
    //                     node.setAttribute(key, index)
    //                 } catch (e) {
    //                 }
    //             })
    //             node.innerHTML = innerHTML
    //             v[tagList[i].index] = node.outerHTML
    //         } else {
    //             v[tagList[i].index] = ''
    //         }
    //     }
    //     return v.join('')
    // }
}
Wiklo.tagsHandler = (v) => {
    Object.values(Wiklo.tagsHandlerMethods).forEach((f)=>{
        v = f(v)
    })
    return v
}
Wiklo.tagsHandlerDeprecated = (v) => {
    v = v.split(/(<[\w/].*?>)/g)
    let refgroups = {}
    let tagLevel = 0
    let tagList = []
    for (let i = 1; i < v.length; i += 2) {
        let val = v[i].slice(1, -1).replace(/\s+\=\s?(?=([^"]*"[^"]*")*[^"]*$)/g, '=').replace(/\s+(?=([^"]*"[^"]*")*[^"]*$)/g, '\n').split('\n')
        let name = val[0].toLowerCase()
        let options = {}
        val.forEach((k, j)=>{
            if (!j || k == '') return
            if (k.endsWith('/')) k = k.slice(0, -1)
            if (k.includes('=')) {
                let key = k.split('=')[0].trim().toLowerCase()
                let value = k.split('=').slice(1).join('').trim()
                if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1)
                options[key] = value
            } else {
                if (k.trim()) options[k.trim()] = ''
            }
        })
        if (v[i].slice(1, -1).endsWith('/') && v[i].length != 3) {
            if (name.endsWith('/')) name = name.slice(0, -1)
            ++tagLevel
            tagList.push({tagLevel, name, options, index:i})
            tagList.push({tagLevel, name, index:i})
            tagLevel--
        } else if (!name.startsWith('/')) {
            ++tagLevel
            tagList.push({tagLevel, name, options, index:i})
        } else if (tagLevel > 0) {
            tagList.push({tagLevel, name:name.slice(1), index:i})
            tagLevel--
        }
    }
    tagList.sort((a,b)=>{return b.tagLevel - a.tagLevel})
    for (let i = 0; i < tagList.length; i += 2) {
        if (tagList[i].options) {
            let innerHTML = v.slice(tagList[i].index+1, tagList[i+1].index).join('')
            for (let j = tagList[i].index; j <= tagList[i+1].index; j += 1) v[j] = ''
            if (tagList[i].name == 'ref') {
                if (!tagList[i].options.group) tagList[i].options.group = ' '
                if (!refgroups[tagList[i].options.group]) refgroups[tagList[i].options.group] = []
                if (!tagList[i].options.name || !refgroups[tagList[i].options.group].includes(tagList[i].options.name)) {
                    let node = document.createElement('li')
                    node.classList.add('reflist-li')
                    Object.entries(tagList[i].options).forEach(([key, index])=>{
                        node.setAttribute(key, index)
                    })
                    let id = tagList[i].options.name || (tagList[i].options.group.trim() + (refgroups[tagList[i].options.group].length+1))
                    node.innerHTML = '<a href="#reflink-'+id+'">*</a> ' + innerHTML.trim()
                    node.id = 'ref-' + id
                    v[tagList[i].index] = '<sup><a id="reflink-'+id.replaceAll('<', '&#x3C;').replaceAll('>', '&#x3E;').replaceAll('"', '&#x22;')+'" href="#ref-' + id.replaceAll('<', '&#x3C;').replaceAll('>', '&#x3E;').replaceAll('"', '&#x22;') + '">[' + (tagList[i].options.group.replaceAll('<', '&#x3C;').replaceAll('>', '&#x3E;').replaceAll('"', '&#x22;').trim() + (refgroups[tagList[i].options.group].length+1)) + ']</a><div class="refhover">'+innerHTML.trim()+'</div></sup>'
                    refgroups[tagList[i].options.group].push(tagList[i].options.name || ' ')
                    v.push(node.outerHTML)
                } else {
                    v[tagList[i].index] = '<sup><a href="#ref-' + tagList[i].options.name.replaceAll('<', '&#x3C;').replaceAll('>', '&#x3E;').replaceAll('"', '&#x22;') + '">[' + (tagList[i].options.group.replaceAll('<', '&#x3C;').replaceAll('>', '&#x3E;').replaceAll('"', '&#x22;').trim() + (refgroups[tagList[i].options.group].indexOf(tagList[i].options.name)+1)) + ']</a><div class="refhover">'+innerHTML.trim()+'</div></sup>'
                }
                delete node
            } else if (tagList[i].name == 'gallery') {
                let node = document.createElement(tagList[i].name)
                Object.entries(tagList[i].options).forEach(([key, index])=>{
                    node.setAttribute(key, index)
                })
                node.innerHTML = innerHTML.split('\n').map(k=>k?('[['+k.split('|')[0]+']] | '+k.split('|').slice(1).join(' | ')):'').join('\n')
                v[tagList[i].index] = node.outerHTML
                delete node
            } else {
                try {
                    let node = document.createElement(tagList[i].name)
                    Object.entries(tagList[i].options).forEach(([key, index])=>{
                        node.setAttribute(key, index)
                    })
                    node.innerHTML = innerHTML
                    v[tagList[i].index] = node.outerHTML
                    delete node
                } catch (e) {
                    Wiklo.alert(e + '<br>' + tagList[i].name, 'ERROR')
                    throw(e)
                }
            }
        } else {
            v[tagList[i].index] = ''
        }
    }
    return v.join('')
}
Wiklo.modulesHandler = (v) => {
    v = v.split(/(\{\{\{[^\{]*?\}\}\})/gs).map(k=>{
        if (!k.startsWith('{{{')) return k
        if (k.includes('|')) return k.slice(3,-3).split('|')[1]
        return ''
    }).join('').replace(/\|\}\}(?:[^\}]|$)/gs, '| }}').split(/(\{\{|\}\}|\[\[|\]\]|\{\||\|\})/g)
    let tagLevel = 0
    let tagList = []
    for (let i = 0; i < v.length; i++) {
        if (v[i] == '{{') {
            v[i] = ''
            tagLevel++
            tagList.push({tagLevel, type:'module', index:i})
        } else if (v[i] == '}}' && tagLevel != 0) {
            v[i] = ''
            tagList.push({tagLevel, type:'module', index:i})
            tagLevel--
        } else if (v[i] == '[[') {
            v[i] = ''
            tagLevel++
            tagList.push({tagLevel, type:'link', index:i})
        } else if (v[i] == ']]' && tagLevel != 0) {
            v[i] = ''
            tagList.push({tagLevel, type:'link', index:i})
            tagLevel--
        } else if (v[i] == '{|') {
            v[i] = ''
            tagLevel++
            tagList.push({tagLevel, type:'table', index:i})
        } else if (v[i] == '|}' && tagLevel != 0) {
            v[i] = ''
            tagList.push({tagLevel, type:'table', index:i})
            tagLevel--
        } else if ((v[i] == '}}' || v[i] == ']]' || v[i] == '|}') && tagLevel == 0) {
            v[i] = ''
        }
    }
    for (let i = 0; i < tagLevel; i++) {
        tagList.push({tagLevel: tagLevel-i, index:v.length + i})
        v.push('')
    }
    tagList.sort((a,b)=>{return b.tagLevel - a.tagLevel})
    for (let i = 0; i < tagList.length; i += 2) {
        if (tagList[i+1]) {
            if (tagList[i].type == 'module') v[tagList[i].index] = Wiklo.moduleToHTML(v.slice(tagList[i].index+1, tagList[i+1].index).join(''))
            if (tagList[i].type == 'link') v[tagList[i].index] = Wiklo.linkToHTML(v.slice(tagList[i].index+1, tagList[i+1].index).join(''))
            if (tagList[i].type == 'table') v[tagList[i].index] = Wiklo.tableToHTML(v.slice(tagList[i].index+1, tagList[i+1].index).join(''))
            for (let j = tagList[i].index+1; j <= tagList[i+1].index; j += 1) v[j] = ''
        } else {
            v[tagList[i].index] = ''
        }
    }
    return v.join('')
}
Wiklo.moduleToHTML = (v) => {
    v = v.split('|').map(k=>k.trim())
    const name = v[0].toLowerCase()
    const args = []
    const kwargs = {}
    v.forEach((k, i)=>{
        if (!i) return
        if (k.match(/(^[^<]*?)=/)) {
            const s = k.split(/(^[^<]*?)=/)
            kwargs[s[1].trim().toLowerCase()] = s[2].trim()
            return
        }
        args.push(k.trim())
        return
    })
    if (Wiklo.moduleHandlers.hasOwnProperty(name)) return Wiklo.modulesHandler(Wiklo.moduleHandlers[name](args, kwargs))
    return '[Module ' + v[0] + ']'
}
Wiklo.linkToHTML = (v) => {
    const metadata = Wiklo.getMetadataUnsafe()
    v = v.split('|').map(k=>k.trim())
    const args = []
    const kwargs = {}
    v.forEach((k, i)=>{
        if (k.match(/(^[^<]*?[^<:])=/)) {
            const s = k.split(/(^[^<]*?[^<:])=/)
            kwargs[s[1].trim().toLowerCase()] = s[2].trim()
            return
        }
        args.push(k.trim())
        return 
    })
    if (args[0].startsWith('http://') || args[0].startsWith('https://')) return `<a href="${args[0]}" title="${args[0]}" target="${kwargs.target || '_blank'}">${args[1] || args[0]}</a><div class="linkhover">${args[0]}</div>`
    const hash = args[0].split('#').slice(1).join('#')
    args[0] = args[0].split('#')[0]
    const entries = Object.entries(metadata).filter(([k,v])=>!v.revised)
    const categories = Wiklo.PAGEINFO?.categories || []
    if (kwargs.category) {
        const category = Wiklo.getPageUUIDUnsafe(kwargs.category)
        if (category) categories.push(category)
    }
    const article = args[0].match(/^[0-9a-f]{32}$/) && entries.find(([k,v])=>(args[0]==k)) || entries.find(([k,v])=>(args[0]==v.name)&&v.categories.some(t=>categories.includes(t))) || entries.find(([k,v])=>args[0]==v.name&&v.categories.includes(false)) || entries.find(([k,v])=>args[0]==v.name) || entries.find(([k,v])=>args[0].toLocaleLowerCase()==v.name.toLocaleLowerCase()) || null
    return `<a href="./?${article ? article[0] : args[0]}${hash ? ('#'+hash) : ''}" title="${kwargs.title || args[0]}"${!article ? ' class="no-article"' : (Wiklo.PAGEUUID == article[0] && !hash ? ' class="self-link"' : '')} target="${kwargs.target || '_self'}">${args[1] || (hash ? (args[0] + ' &#xA7; ' + hash) : args[0])}</a><div class="linkhover">${article ? ('<h1>'+article[1].name.replaceAll('<', '&#x3C;').replaceAll('>', '&#x3E;').replaceAll('"', '&#x22;')+'</h1>'+(article[1].description ? Wiklo.modulesHandler(article[1].description) : 'This page does not have a description.')) : ('<h1>'+args[0].replaceAll('<', '&#x3C;').replaceAll('>', '&#x3E;').replaceAll('"', '&#x22;')+'</h1>This page could not be found.')}</div>`
}
Wiklo.tableToHTML = (v) => {
    let caption, tableoptions
    let trs = v.split('|-')
    trs[0] = trs[0].split('\n').map(trr=>{
        if (!trr.startsWith('!') && !trr.startsWith('|') && !tableoptions) {
            tableoptions = trr
            /* trr.trim().replace(/\s+\=\s?(?=([^"]*"[^"]*")*[^"]*$)/g, '=').replace(/\s+(?=([^"]*"[^"]*")*[^"]*$)/g, '\n').split('\n').forEach(k=>{
                if (k == '') return
                if (k.includes('=')) {
                    let key = k.split('=')[0].trim().toLowerCase()
                    let value = k.split('=').slice(1).join('').trim()
                    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1)
                    options[key] = value
                } else {
                    if (k.trim()) options[k.trim()] = ''
                }
            }) */
            return ''
        }
        if (trr.startsWith('|+') && !caption) {
            caption = trr.slice(2).trim()
            caption = caption.includes('|') ? ('<caption ' + caption.split('|')[0].trim() + '>' + caption.split('|').slice(1).join('|').trim() + '</caption>') : ('<caption>' + caption.trim() + '</caption>')
            return ''
        }
        return trr
    }).join('\n')
    if (!trs[0].trim()) trs = trs.slice(1)
    return '<table'+(tableoptions ? (' ' + tableoptions.replaceAll('<', '&#x3C;').replaceAll('>', '&#x3E;')) : '')+'>'+(caption || '')+'<tbody>'+trs.map(tr=>{
        console.log(tr)
        const cells = tr.split(/(\n(?:\<\!--.*?--\>)*?\!|\!\!|\n(?:\<\!--.*?--\>)*?\||\|\|)/g)
        cells[0] = cells[0].trim()
        for (let i = 1; i < cells.length; i += 2) {
            const node = cells[i].endsWith('!') ? 'th' : 'td'
            cells[i+1] = cells[i+1].includes('|') ? ('<' + node + ' ' + cells[i+1].split('|')[0].replaceAll('<', '&#x3C;').replaceAll('>', '&#x3E;').trim() + '>' + cells[i+1].split('|').slice(1).join('|').trim() + '</' + node + '>') : ('<' + node + '>' + cells[i+1].trim() + '</' + node + '>')
            cells[i] = ''
        }
        return cells[0] ? ('<tr ' + cells[0].replaceAll('<', '&#x3C;').replaceAll('>', '&#x3E;') + '>' + cells.slice(1).join('') + '</tr>') : ('<tr>' + cells.slice(1).join('') + '</tr>')
    }).join('')+'</tbody></table>'
}
Wiklo.textToHTML = (v) => {
    return Wiklo.tagsHandler(Wiklo.modulesHandler(
        Wiklo.tagsHandler(v)
        .replace(/^\n/gs, '')
        .replace(/^=[^\n]*=\s*?\n/gs, (v)=>((Wiklo.tryHead(v.slice(0, -1).trim())?.outerHTML)||v.slice(0, -1))+'\n')
        .replace(/^=[^\n]*=\s*?$/gm, (v)=>((Wiklo.tryHead(v.trim())?.outerHTML)||v))
        .replace(/\n(?:\*\*\*\*\*+[^\n]*\n)+/gs, (v)=>'<ul>'+v.slice(1, -1).split('\n').map(k=>'<li>'+k.slice(5).trim()+'</li>').join('')+'</ul>\n')
        .replace(/\n(?:\*\*\*\*+[^\n]*\n)+/gs, (v)=>'<ul>'+v.slice(1, -1).split('\n').map(k=>'<li>'+k.slice(4).trim()+'</li>').join('')+'</ul>\n')
        .replace(/\n(?:\*\*\*+[^\n]*\n)+/gs, (v)=>'<ul>'+v.slice(1, -1).split('\n').map(k=>'<li>'+k.slice(3).trim()+'</li>').join('')+'</ul>\n')
        .replace(/\n(?:\*\*+[^\n]*\n)+/gs, (v)=>'<ul>'+v.slice(1, -1).split('\n').map(k=>'<li>'+k.slice(2).trim()+'</li>').join('')+'</ul>\n')
        .replace(/\n(?:\*+[^\n]*\n)+/gs, (v)=>'<ul>'+v.slice(1, -1).split('\n').map(k=>'<li>'+k.slice(1).trim()+'</li>').join('')+'</ul>')
        .replace(/^:.+?$/gm, (v)=>'<blockquote>'+v.slice(1)+'</blockquote>')
        .replace(/'''.*?'''/g, (v)=>'<b>'+v.slice(3, -3)+'</b>')
        .replace(/''.*?''/g, (v)=>'<i>'+v.slice(2, -2)+'</i>')
        .replace(/^\}\}\n(?:[^\!\|])/gm, (v)=>'}}'+v.slice(-1))
        .replace(/^(\{\{[^\{\}]*?\}\})+\n/gm, (v)=>v.slice(0, -1))
        .replace(/^<[^<>]*?>\n/gm, (v)=>v.slice(0, -1))
        .replace(/\n<!--.*?-->\n/gs, (v)=>v.slice(1))
    )).replace(/\[https?:\/\/[^\]]+?\..+?\]/gm, (v)=>{
        v = v.slice(1, -1).split(' ')
        return `<a href="${v[0]}" title="${v[0]}" target="_blank">${v.length == 1 ? v[0] : v.slice(1).join(' ')}</a><div class="linkhover">${v[0]}</div>`
    })
}
Wiklo.timeFormat = {timeZoneName:'short', hour12: false}
Wiklo.textToPage = (text, pageinfo=null) => {
    const page = document.createElement('article')
    page.innerHTML =
        (
            pageinfo ? 
            ( '<div class="page-header">'
                + '<h1 class="page-title">'+(pageinfo.name.replaceAll('<', '&#x3C;').replaceAll('>', '&#x3E;').replaceAll('"', '&#x22;')||'')+'</h1>'
                + '<div class="page-info">'
                    // + (pageinfo.author ? '<div>Author: '+pageinfo.author.replaceAll('<', '&#x3C;').replaceAll('>', '&#x3E;').replaceAll('"', '&#x22;')+'</div>' : '')
                    // + (pageinfo.creation ? '<div>Creation: <span class="date" value='+pageinfo.creation+'>'+new Date(pageinfo.creation).toLocaleString(undefined, Wiklo.timeFormat)+'</span></div>' : '')
                    + (pageinfo.lastModification ? '<div>Last Edit: <span class="date" value='+pageinfo.lastModification+'>'+new Date(pageinfo.lastModification).toLocaleString(undefined, Wiklo.timeFormat)+'</span></div>' : '')
                + '</div>'
            + '</div><hr>' ) : ''
        )
        + Wiklo.textToHTML(text.replaceAll('\r\n','\n').replaceAll('\r','\n'))
    page.querySelectorAll('sup:has(> a[href^="#ref-"]:first-child + div.refhover:last-child)').forEach((v)=>{
        const reflink = v.querySelector('a[href^="#ref-"]')
        const refhover = v.querySelector('a[href^="#ref-"] + div.refhover')
        if (!refhover.innerHTML) refhover.innerHTML = Array.from(page.querySelectorAll('sup > a[href="'+decodeURIComponent(reflink.hash)+'"] + div.refhover')).slice(-1)[0]?.innerHTML
    })
    if (page.querySelector('.reflist > ol')) page.querySelectorAll('.reflist-li').forEach((v)=>{
        let group = v.getAttribute('group')
        let reflist = group != ' ' ? page.querySelector('.reflist#reflist-'+group+' > ol') : page.querySelector('.reflist:not([id]) > ol')
        if (reflist) {
            v.remove()
            reflist.appendChild(v)
        }
    })
    return page
}
Wiklo.textToPageRaw = (text, pageinfo=null) => {
    const page = document.createElement('article')
    page.innerHTML =
        (
            pageinfo ? 
            ( '<div class="page-header">'
                + '<h1 class="page-title">'+(pageinfo.name.replaceAll('<', '&#x3C;').replaceAll('>', '&#x3E;').replaceAll('"', '&#x22;')||'')+'</h1>'
                + '<div class="page-info">'
                    // + (pageinfo.author ? '<div>Author: '+pageinfo.author.replaceAll('<', '&#x3C;').replaceAll('>', '&#x3E;').replaceAll('"', '&#x22;')+'</div>' : '')
                    // + (pageinfo.creation ? '<div>Creation: <span class="date" value='+pageinfo.creation+'>'+new Date(pageinfo.creation).toLocaleString()+'</span></div>' : '')
                    + (pageinfo.lastModification ? '<div>Last Modification: <span class="date" value='+pageinfo.lastModification+'>'+new Date(pageinfo.lastModification).toLocaleString()+'</span></div>' : '')
                + '</div>'
            + '</div><hr>' ) : ''
        )
        + text
    return page
}
Wiklo.loadUUIDData = async (uuid) => {
    const metadata = await Wiklo.getMetadata()
    if (!metadata.hasOwnProperty(uuid)) return null
    const data = await fetch('./data/'+uuid)
    return data
}
Wiklo.loadUUIDPage = async (uuid, hash=null, forceLatestVersion=false) => {
    const metadata = await Wiklo.getMetadata()
    if (!metadata.hasOwnProperty(uuid)) return
    if (forceLatestVersion && metadata[uuid].revised) {
        const [nuid] = Object.entries(await Wiklo.getMetadata()).find(([k, v])=>!v.revised&&v.revisions?.includes(uuid)) || [null, null]
        if (nuid) {
            Wiklo.loadUUIDPage(nuid, hash).then(()=>{
                window.history.replaceState(null, null, './?' + Wiklo.PAGEUUID + (hash || ''))
                document.title = Wiklo.PAGENAME + ' - ' + Wiklo.title
                Wiklo.alert(`Redirected to the latest revision. <a href="?${uuid}">Go back</a>`)
            })
            return
        }
    }
    Wiklo.PAGENAME = metadata[uuid].name
    Wiklo.PAGEUUID = uuid
    document.querySelectorAll('article').forEach(v=>{v.remove()})
    const safepagename = metadata[uuid].name.replaceAll('<', '&#x3C;').replaceAll('>', '&#x3E;').replaceAll('"', '&#x22;')
    if (metadata[uuid].MIMEType == 'text/wkl') {
        const data = await (await Wiklo.loadUUIDData(uuid)).text() || ''
        if (data.startsWith('#redirect ') && hash != '#no-redirect-1') {
            if (data.slice(10).split('#')[0].match(/^[0-9a-f]{32}$/)) Wiklo.loadUUIDPage(data.slice(10).split('#')[0], data.slice(10).split('#')[1] || hash).then(()=>{
                window.history.replaceState(null, null, './?' + Wiklo.PAGEUUID + (data.slice(10).split('#')[1] || hash || ''))
                document.title = Wiklo.PAGENAME + ' - ' + Wiklo.title
                Wiklo.alert(`Redirected from <a href="?${uuid}#no-redirect-1">${safepagename}</a>.`)
            })
            else Wiklo.loadPageFromName(data.slice(10).split('#')[0], Wiklo.PAGEINFO?.categories || [], data.slice(10).split('#')[1] || hash).then(()=>{
                window.history.replaceState(null, null, './?' + Wiklo.PAGEUUID + (data.slice(10).split('#')[1] || hash || ''))
                document.title = Wiklo.PAGENAME + ' - ' + Wiklo.title
                Wiklo.alert(`Redirected from <a href="?${uuid}#no-redirect-1">${safepagename}</a>.`)
            })
        } else {
            if (metadata[uuid].encrypted) {
                let code = null
                while (!code) {
                    code = window.prompt('This article is encrypted. You need to ender a code.')
                }
            }
            document.querySelector('section').append(Wiklo.textToPage(data, metadata[uuid]))
        }
    } else if (metadata[uuid].MIMEType.startsWith('image')) {
        document.querySelector('section').append(Wiklo.textToPage('{{nestimage|'+uuid+'}}<hr>'+(metadata[uuid]?.description ? (metadata[uuid]?.description + '<hr>') : '')+'This is an image file uploaded to this website. ('+metadata[uuid].MIMEType+') <a href="./data/'+uuid+'" download="'+safepagename+'">Download</a>', metadata[uuid]))
    } else if (metadata[uuid].MIMEType.startsWith('audio')) {
        document.querySelector('section').append(Wiklo.textToPage('{{nestaudio|'+uuid+'}}<hr>'+(metadata[uuid]?.description ? (metadata[uuid]?.description + '<hr>') : '')+'This is an audio file uploaded to this website. ('+metadata[uuid].MIMEType+') <a href="./data/'+uuid+'" download="'+safepagename+'">Download</a>', metadata[uuid]))
    } else if (metadata[uuid].MIMEType.startsWith('video')) {
        document.querySelector('section').append(Wiklo.textToPage('{{nestvideo|'+uuid+'}}<hr>'+(metadata[uuid]?.description ? (metadata[uuid]?.description + '<hr>') : '')+'This is a video file uploaded to this website. ('+metadata[uuid].MIMEType+') <a href="./data/'+uuid+'" download="'+safepagename+'">Download</a>', metadata[uuid]))
    } else if (Wiklo._supportedObjectTypes.includes(metadata[uuid].MIMEType)) {
        document.querySelector('section').append(Wiklo.textToPage('{{nestobject|'+uuid+'|type='+metadata[uuid].MIMEType+'|width=100%|height=400}}<hr>'+(metadata[uuid]?.description ? (metadata[uuid]?.description + '<hr>') : '')+'This is an object file uploaded to this website. ('+metadata[uuid].MIMEType+') <a href="./data/'+uuid+'" download="'+safepagename+'">Download</a>', metadata[uuid]))
    } else if (Wiklo._supportedCustomTypes.hasOwnProperty(metadata[uuid].MIMEType)) {
        const data = await (await Wiklo.loadUUIDData(uuid)).text() || ''
        document.querySelector('section').append(Wiklo.textToPageRaw(Wiklo._supportedCustomTypes[metadata[uuid].MIMEType](data) + '<hr>'+(metadata[uuid]?.description ? (metadata[uuid]?.description + '<hr>') : '')+'This is a text file uploaded to this website. ('+metadata[uuid].MIMEType+') <a href="./data/'+uuid+'" download="'+safepagename+'">Download</a> <a href="./data/'+uuid+'">Raw</a>', metadata[uuid]))
    } else if (Wiklo._supportedCodeTypes.includes(metadata[uuid].MIMEType)) {
        const data = await (await Wiklo.loadUUIDData(uuid)).text() || ''
        document.querySelector('section').append(Wiklo.textToPageRaw('<code>' + data.replaceAll('<', '&#x3C;').replaceAll('>', '&#x3E;') + '</code><hr>'+(metadata[uuid]?.description ? (metadata[uuid]?.description + '<hr>') : '')+'This is a text file uploaded to this website. ('+metadata[uuid].MIMEType+') <a href="./data/'+uuid+'" download="'+safepagename+'">Download</a>', metadata[uuid]))
    } else if (metadata[uuid].MIMEType.startsWith('text')) {
        const data = await (await Wiklo.loadUUIDData(uuid)).text() || ''
        document.querySelector('section').append(Wiklo.textToPageRaw(data.replaceAll('<', '&#x3C;').replaceAll('>', '&#x3E;') + '<hr>' + (metadata[uuid]?.description ? (metadata[uuid]?.description + '<hr>') : '')+'This is a text file uploaded to this website. ('+metadata[uuid].MIMEType+') <a href="./data/'+uuid+'" download="'+safepagename+'">Download</a>', metadata[uuid]))
    } else {
        document.querySelector('section').append(Wiklo.textToPage((metadata[uuid]?.description ? (metadata[uuid]?.description + '<hr>') : '') + 'This is an unknown file uploaded to this website. ('+metadata[uuid].MIMEType+') <a href="./data/'+uuid+'" download="'+safepagename+'">Download</a>', metadata[uuid]))
    }
    if (metadata[uuid].revised) Wiklo.alert('You are looking at a displaced revision.')
    document.querySelectorAll('section.included').forEach(v=>{v.onloadedmetadata()})
    document.querySelectorAll('article script').forEach(v=>{eval(v.textContent)})
    if (hash || location.hash) document.getElementById(decodeURIComponent(hash?.slice(1) || location.hash.slice(1)))?.scrollIntoView()
    return true
}
Wiklo._forceScroll = (t) => {
    if (document.getElementById(t)) document.getElementById(t).scrollIntoView()
    else setTimeout(()=>{Wiklo._forceScroll(t)}, 100)
}
Wiklo.getUUIDPageComponent = async (section) => {
    const metadata = await Wiklo.getMetadata()
    const uuid = section.getAttribute('uuid')
    if (!metadata.hasOwnProperty(uuid)) return section.innerHTML = '<span class="module-error">Error: Page Not Found</span>'
    if (metadata[uuid].MIMEType.startsWith('image')) {
        section.innerHTML = Wiklo.textToHTML('{{nest|'+uuid+'}}')
    } else if (metadata[uuid].MIMEType.startsWith('audio')) {
        section.innerHTML = Wiklo.textToHTML('{{nest|'+uuid+'}}')
    } else if (metadata[uuid].MIMEType.startsWith('video')) {
        section.innerHTML = Wiklo.textToHTML('{{nest|'+uuid+'}}')
    } else if (metadata[uuid].MIMEType.startsWith('text')) {
        const data = await (await Wiklo.loadUUIDData(uuid)).text() || ''
        if (data.startsWith('#redirect ')) {
            if (data.slice(10).match(/^[0-9a-f]{32}$/)) return await Wiklo.getUUIDPageComponent(data.slice(10), section)
            else return await Wiklo.getUUIDPageComponent(await Wiklo.getPageUUID(data.slice(10)), section)
        } else {
            section.innerHTML = Wiklo.textToHTML(data)
        }
    } else {
        section.innerHTML = Wiklo.textToHTML('{{nestobject|'+uuid+'}}')
    }
    section.querySelectorAll('article script').forEach(v=>{eval(v.textContent)})
}
Wiklo.getPageUUID = async (name, categories=[]) => {
    const metadata = await Wiklo.getMetadata()
    const entries = Object.entries(metadata).filter(([k,v])=>!v.revised)
    const [uuid] = entries.find(([k,v])=>name.toLocaleLowerCase()==v.name.toLocaleLowerCase()&&v.categories.some(t=>categories.includes(t))) || entries.find(([k,v])=>name.toLocaleLowerCase()==v.name.toLocaleLowerCase()&&v.categories.includes(false)) || entries.find(([k,v])=>name==v.name) || entries.find(([k,v])=>name.toLocaleLowerCase()==v.name.toLocaleLowerCase()) || [null]
    return uuid
}
Wiklo.getPageUUIDUnsafe = (name, categories=[]) => {
    const metadata = Wiklo.getMetadataUnsafe()
    const entries = Object.entries(metadata).filter(([k,v])=>!v.revised)
    const [uuid] = entries.find(([k,v])=>name.toLocaleLowerCase()==v.name.toLocaleLowerCase()&&v.categories.some(t=>categories.includes(t))) || entries.find(([k,v])=>name.toLocaleLowerCase()==v.name.toLocaleLowerCase()&&v.categories.includes(false)) || entries.find(([k,v])=>name==v.name) || entries.find(([k,v])=>name.toLocaleLowerCase()==v.name.toLocaleLowerCase()) || [null]
    return uuid
}
Wiklo.loadPageFromName = async (name, categories=[], hash) => {
    const uuid = await Wiklo.getPageUUID(decodeURIComponent(name), categories)
    if (uuid) return await Wiklo.loadUUIDPage(uuid, hash)
    return await Wiklo.loadArticleList(name)
}
Wiklo.loadHome = async () => {
    Wiklo.PAGENAME = ''
    Wiklo.PAGEUUID = ''
    await Wiklo.getMetadata()
    document.querySelectorAll('article').forEach(v=>{v.remove()})
    document.querySelector('section').append(Wiklo.textToPage(Wiklo.home))
    document.title = Wiklo.title
}
Wiklo.loadArticleList = async (key) => {
    Wiklo.PAGENAME = 'Search: ' + key
    Wiklo.PAGEUUID = key
    const metadata = await Wiklo.getMetadata()
    const newlist = Object.entries(metadata).filter(([uuid, {name, revised}])=>(!revised && name.toLocaleLowerCase().includes(key.toLocaleLowerCase()))).sort((a,b)=>{return ((a[1].name > b[1].name) - (b[1].name > a[1].name))})
    document.querySelectorAll('article').forEach(v=>{v.remove()})
    document.querySelector('section').append(Wiklo.textToPage(
        newlist.length ? '<ol>'+newlist.map(([uuid, {name}])=>{
            return `<li>[[${uuid}|${name}|title=${name}]]</li>`
        }).join('')+'</ol>' : 'No articles were found.'
    , {name: 'Search: ' + key}))
    return true
}
Wiklo.loadFromSearch = (forceLatestVersion=false) => {
    updateButtons()
    if (location.pathname == '/edit') return
    if (location.search && location.search.match(/^\?[0-9a-f]{32}$/) && location.search.slice(1) == Wiklo.PAGEUUID) {
        if (location.hash) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView()
        return
    }
    if (location.search && location.search.match(/^\?[0-9a-f]{32}$/)) Wiklo.loadUUIDPage(location.search.slice(1), location.hash, forceLatestVersion).then(()=>{document.title = Wiklo.PAGENAME + ' - ' + Wiklo.title})
    else if (location.search) Wiklo.loadPageFromName(decodeURIComponent(location.search.slice(1)), [], location.hash).then(()=>{window.history.replaceState(null, null, './?' + Wiklo.PAGEUUID + location.hash); updateButtons(); document.title = Wiklo.PAGENAME + ' - ' + Wiklo.title})
    else Wiklo.loadHome()
}
Wiklo.popup = (v) => {
    if (!v) v = document.createElement('div')
    const bg = document.createElement('div')
    bg.classList.add('wiklo-popup-layer')
    bg.addEventListener('click', (e)=>{
        if (e.target == bg) bg.remove()
    })
    const d = document.createElement('div')
    d.classList.add('wiklo-popup-container')
    d.appendChild(v)
    bg.appendChild(d)
    document.body.appendChild(bg)
    return bg
}
Wiklo.popupVersionHistory = async (uuid=Wiklo.PAGEUUID) => {
    let info = (await Wiklo.getMetadata())[uuid]
    if (info?.revised) [uuid, info] = Object.entries(await Wiklo.getMetadata()).find(([k, v])=>!v.revised&&v.revisions?.includes(uuid)) || [null, null]
    if (!info) {
        const v = document.createElement('div')
        v.textContent = 'This page does not support history view.'
        return Wiklo.popup(v)
    }
    const v = document.createElement('ol')
    v.classList.add('wiklo-page-history')
    v.reversed = true
    const crev = document.createElement('li')
    const ca = document.createElement('a')
    ca.textContent = new Date(info.lastModification).toLocaleString(undefined, Wiklo.timeFormat) + (' | ' + info.name) + (info.author ? (' | ' + info.author) : '')
    if (info.revisions?.includes(Wiklo.PAGEUUID)) {
        ca.href = './?' + uuid
        ca.addEventListener('click', (e)=>{
            e.preventDefault()
            if (location.pathname == '/edit') return
            Wiklo.loadUUIDPage(uuid).then(()=>{window.history.pushState(null, null, './?' + Wiklo.PAGEUUID); updateButtons(); document.title = Wiklo.PAGENAME + ' - ' + Wiklo.title})
            document.querySelectorAll('.wiklo-popup-layer').forEach(v=>{v.remove()})
        })
    } else crev.classList.add('current')
    crev.appendChild(ca)
    v.appendChild(crev)
    if (info.revisions && info.revisions.length) info.revisions.toReversed().forEach((uid)=>{
        const uinfo = Wiklo.getMetadataUnsafe()[uid]
        const rev = document.createElement('li')
        const a = document.createElement('a')
        a.textContent = new Date(uinfo.lastModification).toLocaleString(undefined, Wiklo.timeFormat) + (' | ' + uinfo.name) + (uinfo.author ? (' | ' + uinfo.author) : '')
        if (Wiklo.PAGEUUID != uid) {
            a.href = './?' + uid
            a.addEventListener('click', (e)=>{
                e.preventDefault()
                if (location.pathname == '/edit') return
                Wiklo.loadUUIDPage(uid).then(()=>{window.history.pushState(null, null, './?' + Wiklo.PAGEUUID); updateButtons(); document.title = Wiklo.PAGENAME + ' - ' + Wiklo.title})
                document.querySelectorAll('.wiklo-popup-layer').forEach(v=>{v.remove()})
            })
        } else rev.classList.add('current')
        rev.appendChild(a)
        v.appendChild(rev)
    })
    return Wiklo.popup(v)
}
const updateButtons = (r=Wiklo.editable) => {
    if (Wiklo.editable === undefined) Wiklo.editable = r
    const newlink = document.querySelector('header nav a#newlink')
    const editlink = document.querySelector('header nav a#editlink')
    const deletelink = document.querySelector('header nav a#deletelink')
    const versionlink = document.querySelector('header nav a#versionlink')
    versionlink.onclick = (e) => {
        e.preventDefault()
        Wiklo.popupVersionHistory()
    }
    if (r || Wiklo.editable) {
        if (!newlink || !editlink || !deletelink) return
        editable = location.search && location.search.match(/^\?[0-9a-f]{32}$/)
        newlink.style.display = 'block'
        editlink.style.display = editable ? 'block' : 'none'
        editlink.onclick = (e) => {
            e.preventDefault()
            if (Wiklo.PAGEINFO?.revised) {
                Wiklo.alert('You cannot edit from a displaced revision.', 'ERROR')
                return
            }
            location.href = editlink.href + '?' + Wiklo.PAGEUUID
        }
        deletelink.style.display = editable ? 'block' : 'none'
        deletelink.onclick = (e) => {
            e.preventDefault()
            Wiklo.alert('Are you sure you want to delete this page? If so, click the button twice within 0.5 seconds.')
            const deleteFuction = () => {
                fetch('/'+Wiklo.PAGEUUID, {method: 'DELETE'}).then((r)=>{
                    if (r.status != 204) Wiklo.alert(r.statusText, 'ERROR')
                    else {
                        Wiklo.alert('Page successfully deleted.')
                        deletelink.removeEventListener('click', deleteFuction)
                        setTimeout(()=>{location.href = '/'}, 2000)
                    }
                })
            }
            deletelink.addEventListener('click', deleteFuction)
            setTimeout(()=>{deletelink.removeEventListener('click', deleteFuction)}, 500)
        }
    } else if (r === false) {
        if (newlink) newlink.remove()
        if (editlink) editlink.remove()
        if (deletelink) deletelink.remove()
    }
}
window.addEventListener('load', () => {
    Wiklo.getMetadata()
    fetch('./editable', {method: 'HEAD'}).then(({status})=>{updateButtons(status==202)})
    document.querySelector('section').addEventListener('click', (e) => {
        if (e.target.nodeName == 'A' && location.pathname == '/edit') {
            e.preventDefault()
            return
        } else if (e.target.nodeName == 'A' && e.target.origin == location.origin && e.target.search) {
            e.preventDefault()
            if (e.target.classList.value.includes('self-link')) return
            if (e.target.search == location.search) {
                document.getElementById(decodeURIComponent(e.target.hash.slice(1)))?.scrollIntoView()
                window.history.replaceState(null, null, './?' + Wiklo.PAGEUUID + e.target.hash)
                return
            }
            if (e.target.classList.value.includes('no-article')) return Wiklo.alert(`Page '${decodeURIComponent(e.target.search.slice(1))}' does not exist.`, 'WARN')
            if (e.target.search.match(/^\?[0-9a-f]{32}$/)) Wiklo.loadUUIDPage(decodeURIComponent(e.target.search.slice(1)), e.target.hash).then(()=>{window.history.pushState(null, null, './?' + Wiklo.PAGEUUID + e.target.hash); updateButtons(); document.title = Wiklo.PAGENAME + ' - ' + Wiklo.title})
            else Wiklo.loadPageFromName(decodeURIComponent(e.target.search.slice(1)), Wiklo.PAGEINFO?.categories || [], e.target.hash).then(()=>{window.history.pushState(null, null, './?' + Wiklo.PAGEUUID + e.target.hash); updateButtons(); document.title = Wiklo.PAGENAME + ' - ' + Wiklo.title})
        }
    })
    document.querySelector('section').addEventListener('mousemove', (e) => {
        document.querySelectorAll('a:hover + div.linkhover').forEach((v)=>{
            v.style.left = Math.min(Math.max(4, e.clientX - v.clientWidth / 2), window.innerWidth - v.clientWidth - 4) + 'px'
            v.style.bottom = Math.min(window.innerHeight - e.clientY - window.scrollY + 12, window.innerHeight - v.clientHeight - window.scrollY - 4) + 'px'
        })
    })
    document.body.onpopstate = Wiklo.loadFromSearch
    Wiklo.loadFromSearch(Wiklo._searchEngineReferrers.includes(document.referrer))
    document.querySelector('#article_search').addEventListener('keydown', (e) => {
        if (e.key == 'Enter') {
            if (e.target.value.match(/^[0-9a-f]{32}$/)) Wiklo.loadUUIDPage(e.target.value).then(()=>{
                window.history.pushState(null, null, './?' + Wiklo.PAGEUUID)
                document.title = Wiklo.PAGENAME + ' - ' + Wiklo.title
                updateButtons()
            })
            else Wiklo.loadPageFromName(decodeURIComponent(e.target.value), Wiklo.PAGEINFO?.categories || []).then((k)=>{
                if (!k) return
                window.history.pushState(null, null, './?' + Wiklo.PAGEUUID)
                document.title = Wiklo.PAGENAME + ' - ' + Wiklo.title
                updateButtons()
            })
        }
    })
    document.querySelector('#article_search').addEventListener('input', (e) => {
        if (!e.target.value) return document.querySelectorAll('#article_search_list > li').forEach(v=>{v.remove()})
        const metadata = Wiklo.getMetadataUnsafe()
        document.querySelectorAll('#article_search_list > li').forEach(v=>{v.remove()})
        Object.entries(metadata).filter(([k,v])=>!v.revised&&v.name.toLocaleLowerCase().startsWith(e.target.value.toLocaleLowerCase().trim())).sort((a,b)=>a[1].name.length-b[1].name.length-a[1]).slice(0, 10).forEach(([k,v])=>{
            const li = document.createElement('li')
            li.textContent = v.name
            li.addEventListener('click', ()=>{
                Wiklo.loadUUIDPage(k).then(()=>{window.history.pushState(null, null, './?' + k); updateButtons(); document.title = Wiklo.PAGENAME + ' - ' + Wiklo.title})
            })
            document.getElementById('article_search_list').appendChild(li)
        })
    }) 
})

return Wiklo})()
