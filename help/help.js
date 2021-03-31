const help = (prefix) => {
    return `
┏━━━━ *Elaina Bot* ━━━━
┃
┣◪ 𝗜𝗡𝗙𝗢
┃ ❏ Prefix: 「 ${prefix} 」
┃ ❏ Elaina Bot : V 1.2
┃ ❏ Lib : Baileys
┃
┣◪ *MENU*
┃
┃\`\`\`Ketik ${prefix}verify, untuk mendaftar\`\`\`
┃\`\`\`Ketik ${prefix}menu angkanya, untuk membuka menu\`\`\`
┃
┣ ❏ *[1]* Sticker
┣ ❏ *[2]* Downloader
┣ ❏ *[3]* Anime
┣ ❏ *[4]* Moderation
┣ ❏ *[5]* NSFW
┣ ❏ *[6]* Text Maker
┣ ❏ *[7]* Fun
┃
┗━━━━ *Elaina Bot* ━━━━`
}

exports.help = help

const donate = (sender) => {
    return `https://saweria.co/yuuxelaina`
}
exports.donate = donate

const menuSticker = (prefix) => {
    return `
┏━━━━ *Menu Sticker* ━━━━
┃ ❏ ${prefix}sticker / stiker ( kirim atau tag gambar/video )
┃ ❏ ${prefix}attp <text>
┃ ❏ ${prefix}ttp <text>
┃ ❏ ${prefix}ttp2 <text>
┃ ❏ ${prefix}ttp3 <text>
┃ ❏ ${prefix}ttp4 <text>
┃ ❏ ${prefix}emoji <emotnya>
┃ ❏ ${prefix}toimg
┗━━━━ *Elaina Bot* ━━━━`
}
exports.menuSticker = menuSticker

const menuDownloader = (prefix) => {
    return `
┏━━━━ *Menu Downloader* ━━━━
┃ ❏ ${prefix}igdl <link>
┃ ❏ ${prefix}fbdl <link>
┃ ❏ ${prefix}ytmp3 <link>
┃ ❏ ${prefix}joox <judul lagu>
┃ ❏ ${prefix}spotify <link>
┃ ❏ ${prefix}play <judul lagu>
┃ ❏ ${prefix}tiktokdl <link>
┗━━━━ *Elaina Bot* ━━━━`
}
exports.menuDownloader = menuDownloader

const menuAnimek = (prefix) => {
    return `
┏━━━━ *Menu Anime* ━━━━
┃ ❏ ${prefix}nsfwcheck <kirim / tag gambar>
┃ ❏ ${prefix}waifu
┃ ❏ ${prefix}neko
┃ ❏ ${prefix}shinobu
┃ ❏ ${prefix}megumin
┃ ❏ ${prefix}kanna
┃ ❏ ${prefix}loli
┃ ❏ ${prefix}elf
┃ ❏ ${prefix}shota
┃ ❏ ${prefix}art
┃ ❏ ${prefix}husbu
┃ ❏ ${prefix}nekomimi
┃ ❏ ${prefix}wallnime
┃ ❏ ${prefix}wait <kirim / tag gambar>
┃ ❏ ${prefix}quotesanime
┃ ❏ ${prefix}karakter <nama chara>
┃ ❏ ${prefix}anime <judul anime>
┃ ❏ ${prefix}manga <judul mamnga>
┗━━━━ *Elaina Bot* ━━━━`
}
exports.menuAnimek = menuAnimek

const menuModeration = (prefix) => {
    return `
┏━━━━ *Menu Moderation* ━━━━
┃ ❏ ${prefix}kick <tag member>
┃ ❏ ${prefix}promote <tag member>
┃ ❏ ${prefix}demote <tag admin>
┃ ❏ ${prefix}tagall
┃ ❏ ${prefix}hidetag <text>
┃ ❏ ${prefix}group <close / open>
┃ ❏ ${prefix}leveling <on / off>
┗━━━━ *Elaina Bot* ━━━━`
}
exports.menuModeration = menuModeration

const menuNSFW = (prefix) => {
    return `
┏━━━━ *Menu NSFW* ━━━━
┃ ❏ ${prefix}nhentai <kode>
┃ ❏ ${prefix}nhentaipdf <kode>
┃ ❏ ${prefix}ecchi
┃ ❏ ${prefix}hentai
┃ ❏ ${prefix}yaoi
┃ ❏ ${prefix}trap
┃ ❏ ${prefix}hololewd
┃ ❏ ${prefix}ahegao
┃ ❏ ${prefix}lewdkemo
┃ ❏ ${prefix}yuri
┃ ❏ ${prefix}ero
┃ ❏ ${prefix}hentaifemdom
┗━━━━ *Elaina Bot* ━━━━`
}
exports.menuNSFW = menuNSFW

const menuTextMaker = (prefix) => {
    return `
┏━━━━ *Menu Text Maker* ━━━━
┃ ❏ ${prefix}shadow text
┃ ❏ ${prefix}cup text
┃ ❏ ${prefix}cup1 text
┃ ❏ ${prefix}romance text
┃ ❏ ${prefix}smoke text
┃ ❏ ${prefix}burnpaper text
┃ ❏ ${prefix}lovemessage text
┃ ❏ ${prefix}undergrass text
┃ ❏ ${prefix}love text
┃ ❏ ${prefix}coffe text
┃ ❏ ${prefix}woodheart text
┃ ❏ ${prefix}woodenboard text
┃ ❏ ${prefix}summer3d text
┃ ❏ ${prefix}wolfmetal text
┃ ❏ ${prefix}nature3d text
┃ ❏ ${prefix}underwater text
┃ ❏ ${prefix}golderrose text
┃ ❏ ${prefix}summernature text
┃ ❏ ${prefix}letterleaves text
┃ ❏ ${prefix}glowingneon text
┃ ❏ ${prefix}fallleaves text
┃ ❏ ${prefix}flamming text
┃ ❏ ${prefix}harrypotter text
┃ ❏ ${prefix}carvedwood text
┃ ❏ ${prefix}tiktok text1 text2
┃ ❏ ${prefix}arcade8bit text1 text2
┃ ❏ ${prefix}battlefield4 text1 text2
┃ ❏ ${prefix}pubg text1 text2
┗━━━━ *Elaina Bot* ━━━━`
}
exports.menuTextMaker = menuTextMaker

const menuFun = (prefix) => {
    return `
┏━━━━ *Menu Fun* ━━━━
┃ ❏ ${prefix}fakedonald text
┃ ❏ ${prefix}asupan
┃ ❏ ${prefix}wancak
┃ ❏ ${prefix}brainly <pertanyaan lu>
┃ ❏ ${prefix}quotes
┃ ❏ ${prefix}quotesdilan
┃ ❏ ${prefix}lirik <judul lagu>
┃ ❏ ${prefix}spamsms <nomornye>
┗━━━━ *Elaina Bot* ━━━━`
}
exports.menuFun = menuFun

const bahasa = (prefix) => {
    return `
List Bahasa :
  af: Afrikaans
  sq: Albanian
  ar: Arabic
  hy: Armenian
  ca: Catalan
  zh: Chinese
  zh-cn: Chinese (Mandarin/China)
  zh-tw: Chinese (Mandarin/Taiwan)
  zh-yue: Chinese (Cantonese)
  hr: Croatian
  cs: Czech
  da: Danish
  nl: Dutch
  en: English
  en-au: English (Australia)
  en-uk: English (United Kingdom)
  en-us: English (United States)
  eo: Esperanto
  fi: Finnish
  fr: French
  de: German
  el: Greek
  ht: Haitian Creole
  hi: Hindi
  hu: Hungarian
  is: Icelandic
  id: Indonesian
  it: Italian
  ja: Japanese
  ko: Korean
  la: Latin
  lv: Latvian
  mk: Macedonian
  no: Norwegian
  pl: Polish
  pt: Portuguese
  pt-br: Portuguese (Brazil)
  ro: Romanian
  ru: Russian
  sr: Serbian
  sk: Slovak
  es: Spanish
  es-es: Spanish (Spain)
  es-us: Spanish (United States)
  sw: Swahili
  sv: Swedish
  ta: Tamil
  th: Thai
  tr: Turkish
  vi: Vietnamese
  cy: Welsh
`
}
exports.bahasa = bahasa