(()=>{

Wiklo.title = 'Fortune Summoners Collection'

Wiklo.home = `

Welcome to the Fortune Summoners Collection.

You can check [[Fortune Summoners]] page or search articles at the top.
`

Wiklo.moduleHandlers = {...Wiklo.moduleHandlers, ...{
    'flag unicode': (args, kwargs) => (args[0]||'').toUpperCase().split('').map(v=>String.fromCodePoint(v.charCodeAt()+0x1F1A5)).join(''),
    'fs key': (args, kwargs) => args[0] ? (args[0].split(/(\+|\-)/).map(v=>'{{nestimage|_fskey_'+v+'.png|class=fskey}}')).join('') : ''
}}

})()
