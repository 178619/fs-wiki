(()=>{

Wiklo.title = 'Fortune Summoners Collection'

Wiklo.home = `

Welcome to the [[Fortune Summoners]] Collection.

Although this page is named Fortune Summoners Collection, it aims to document all products from [[Lizsoft]] and their affiliates.

You can search articles at the top to browse pages.

Note:
This webpage uses Hepburn style without diacritics to transliterate Japanese names.
It also respects the native form of the personal names, causing family names to be placed ''before'' given names.
However, if the right owner consistently uses their own version for their ''romaji'' name or openly endorses it, it will be respected and take priority.

<details>
    <summary>Open Recent Changes</summary>{{articlelist|sortedby=lastModification|reversed=1}}
</details>
`

fsKeySortTable = {
    'right': '6',
    'up': '7',
    'down': '8',
    'left': '9',
    'z': '1',
    'x': '2',
    'c': '3',
    '+': '+',
    '-': '-',
    'f1': 'F1',
    'f2': 'F2',
    'f3': 'F3',
    'f4': 'F4',
    'f5': 'F5',
    'enter': 'F6'
}

Wiklo.moduleHandlers = {...Wiklo.moduleHandlers, ...{
    'flag unicode': (args, kwargs) => (args[0]||'').toUpperCase().split('').map(v=>String.fromCodePoint(v.charCodeAt()+0x1F1A5)).join(''),
    'fs key': (args, kwargs) => args[0] ? ('<span class="fskey-array" data-sort-value="!FSKEY_'+args[0].split(/(\+|\-)/).map(v=>fsKeySortTable[v]||v).join('')+'">' + args[0].split(/(\+|\-)/).map(v=>'{{nestimage|_fskey_'+v+'.png|class=fskey|alt='+v+'}}').join('') + '</span>') : '',
    'fs level': (args, kwargs) => `<span data-sort-value="!FSLEVEL_${args[0].padStart(2,'0')}">${args[0] != '-1' ? ((args[1] || 'Level') + ' ' + args[0]) : 'None'}</span>`,
    'fs mp': (args, kwargs) => `<span data-sort-value="!FSMP_${args[0].padStart(2,'0')}">${args[0] != '-1' ? (args[0] + ' ' + (args[1] || 'MP')) : 'None'}</span>`
}}

})()
