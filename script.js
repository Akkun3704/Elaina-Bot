const {
    WAConnection,
    MessageType,
    Presence,
    Mimetype,
    GroupSettingChange,
    MessageOptions,
    WALocationMessage,
    WA_MESSAGE_STUB_TYPES,
    ReconnectMode,
    ProxyAgent,
    waChatKey,
    mentionedJid,
    processTime,
    ChatModification,
} = require('@adiwajshing/baileys')

const fs = require("fs")
const FormData = require('form-data')
const request = require('request')
const ffmpeg = require('fluent-ffmpeg')
const moment = require('moment-timezone')

const { apikey, prefix, owner } = JSON.parse(fs.readFileSync('./config.json'))

const { fetchJson, getBuffer } = require('./lib/fetcher')
const { color } = require('./lib/color')
const { exec } = require("child_process")
const { getRandom, getGroupAdmins, generateMessageID } = require('./lib/function')
const { help, donate, menuSticker, menuAnimek, menuDownloader, menuModeration, menuNSFW, menuTextMaker, menuFun } = require('./help/help')
const { exit } = require('process')

/***** Load File *****/

const _leveling = JSON.parse(fs.readFileSync('./database/group/leveling.json'))
const _level = JSON.parse(fs.readFileSync('./database/users/level.json'))
const registered = JSON.parse(fs.readFileSync('./database/bot/registered.json'))
const welkom = JSON.parse(fs.readFileSync('./database/group/welkom.json'))
const nsfw = JSON.parse(fs.readFileSync('./database/nsfw.json'))

/***** End Of Load File *****/

async function starts() {
    const yuu = new WAConnection()
    yuu.logger.level = 'warn'
    yuu.on('qr', () => {
        const time_connecting = moment.tz('Asia/Jakarta').format('HH:mm:ss')
        console.log(color(time_connecting, "white"), color("[  STATS  ]", "aqua"), "Scan QR Code with WhatsApp")
    })
    fs.existsSync('./yuu.json') && yuu.loadAuthInfo('./yuu.json')
    if (apikey == "") {
        ini_time = moment.tz('Asia/Jakarta').format('HH:mm:ss')
        console.log(color(ini_time, "white"), color("[  ERROR  ]", "aqua"), color("Apikey is empty, please check at config.json", 'red'))
        exit()
    }
    yuu.on('connecting', () => {
        const time_connecting = moment.tz('Asia/Jakarta').format('HH:mm:ss')
        console.log(color(time_connecting, "white"), color("[  STATS  ]", "aqua"), "Connecting...")
    })
    yuu.on('open', () => {
        const time_connect = moment.tz('Asia/Jakarta').format('HH:mm:ss')
        console.log(color(time_connect, "white"), color("[  STATS  ]", "aqua"), "Connected")
    })
    await yuu.connect({ timeoutMs: 30 * 1000 })
    fs.writeFileSync('./yuu.json', JSON.stringify(yuu.base64EncodedAuthInfo(), null, '\t'))

    yuu.on('group-participants-update', async (anu) => {
        if (!welkom.includes(anu.jid)) return;
        try {
            const mdata = await yuu.groupMetadata(anu.jid);
            console.log(anu);
            if (anu.action == 'add') {
                num = anu.participants[0];
                try {
                    ppimg = await yuu.getProfilePicture(`${anu.participants[0].split('@')[0]}@c.us`);
                } catch {
                    ppimg = 'https://i0.wp.com/www.gambarunik.id/wp-content/uploads/2019/06/Top-Gambar-Foto-Profil-Kosong-Lucu-Tergokil-.jpg';
                }
                teks = `*_Hallo👋_* @${num.split('@')[0]}\n selamat datang di group *${mdata.subject}*`;
                let buff = await getBuffer(ppimg);
                yuu.sendMessage(mdata.id, buff, MessageType.image, { caption: teks, contextInfo: { mentionedJid: [num] } });
            } else if (anu.action == 'promote') {
                num = anu.participants[0];
                try {
                    ppimg = await yuu.getProfilePicture(`${anu.participants[0].split('@')[0]}@c.us`);
                } catch {
                    ppimg = 'https://i0.wp.com/www.gambarunik.id/wp-content/uploads/2019/06/Top-Gambar-Foto-Profil-Kosong-Lucu-Tergokil-.jpg';
                }
                teks = `*_「 Promote deteᴄted 」_*\n@${num.split('@')[0]} yang add admin siapa?, dah iᴢin oᴡner grup belum?`;
                let buff = await getBuffer(ppimg);
                yuu.sendMessage(mdata.id, buff, MessageType.image, { caption: teks, contextInfo: { mentionedJid: [num] } });
            } else if (anu.action == 'demote') {
                num = anu.participants[0];
                try {
                    ppimg = await yuu.getProfilePicture(`${anu.participants[0].split('@')[0]}@c.us`);
                } catch {
                    ppimg = 'https://i0.wp.com/www.gambarunik.id/wp-content/uploads/2019/06/Top-Gambar-Foto-Profil-Kosong-Lucu-Tergokil-.jpg';
                }
                teks = `*_「 Demote deteᴄted 」_*\n@${num.split('@')[0]} yang un admin siapa?, dah iᴢin oᴡner grup belum?`;
                let buff = await getBuffer(ppimg);
                yuu.sendMessage(mdata.id, buff, MessageType.image, { caption: teks, contextInfo: { mentionedJid: [num] } });
            } else if (anu.action == 'remove') {
                num = anu.participants[0];
                try {
                    ppimg = await yuu.getProfilePicture(`${num.split('@')[0]}@c.us`);
                } catch {
                    ppimg = 'https://i0.wp.com/www.gambarunik.id/wp-content/uploads/2019/06/Top-Gambar-Foto-Profil-Kosong-Lucu-Tergokil-.jpg';
                }
                teks = `*_Sayonara👋_* @${num.split('@')[0]} semoga tenang di alam sana`;
                let buff = await getBuffer(ppimg);
                yuu.sendMessage(mdata.id, buff, MessageType.image, { caption: teks, contextInfo: { mentionedJid: [num] } });
            }
        } catch (e) {
            console.log('Error : %s', color(e, 'yellow'));
        }
    })

    yuu.on('chat-update', async(rei) => {
        try {
            const time = moment.tz('Asia/Jakarta').format('HH:mm:ss')
            if (!rei.hasNewMessage) return
            rei = JSON.parse(JSON.stringify(rei)).messages[0]
            if (!rei.message) return
            if (rei.key && rei.key.remoteJid == 'status@broadcast') return
            if (rei.key.fromMe) return
            global.prefix
            const content = JSON.stringify(rei.message)
            const from = rei.key.remoteJid
            const type = Object.keys(rei.message)[0]
            const insom = from.endsWith('@g.us')
            const nameReq = insom ? rei.participant : rei.key.remoteJid
            pushname2 = yuu.contacts[nameReq] != undefined ? yuu.contacts[nameReq].vname || yuu.contacts[nameReq].notify : undefined
            
            const { text, extendedText, contact, location, liveLocation, image, video, sticker, document, audio, product } = MessageType

            body = (type === 'conversation' && rei.message.conversation.startsWith(prefix)) ? rei.message.conversation : (type == 'imageMessage') && rei.message.imageMessage.caption.startsWith(prefix) ? rei.message.imageMessage.caption : (type == 'videoMessage') && rei.message.videoMessage.caption.startsWith(prefix) ? rei.message.videoMessage.caption : (type == 'extendedTextMessage') && rei.message.extendedTextMessage.text.startsWith(prefix) ? rei.message.extendedTextMessage.text : ''
            budy = (type === 'conversation') ? rei.message.conversation : (type === 'extendedTextMessage') ? rei.message.extendedTextMessage.text : ''
            var Link = (type === 'conversation' && rei.message.conversation) ? rei.message.conversation : (type == 'imageMessage') && rei.message.imageMessage.caption ? rei.message.imageMessage.caption : (type == 'videoMessage') && rei.message.videoMessage.caption ? rei.message.videoMessage.caption : (type == 'extendedTextMessage') && rei.message.extendedTextMessage.text ? rei.message.extendedTextMessage.text : ''
            const messagesLink = Link.slice(0).trim().split(/ +/).shift().toLowerCase()
            const command = body.slice(1).trim().split(/ +/).shift().toLowerCase()
            const args = body.trim().split(/ +/).slice(1)
            const isCmd = body.startsWith(prefix)
            //yuu.chatRead(from)

            /****** Validator *****/
            const botNumber = yuu.user.jid
            const ownerNumber = ["6289669497213@s.whatsapp.net"]
            const isGroup = from.endsWith('@g.us')
            const sender = isGroup ? rei.participant : rei.key.remoteJid
            const groupMetadata = isGroup ? await yuu.groupMetadata(from) : ''
            const groupName = isGroup ? groupMetadata.subject : ''
            const groupId = isGroup ? groupMetadata.jid : ''
            const groupMembers = isGroup ? groupMetadata.participants : ''
            const groupAdmins = isGroup ? getGroupAdmins(groupMembers) : ''
            const isBotGroupAdmins = groupAdmins.includes(botNumber) || false
            const isGroupAdmins = groupAdmins.includes(sender) || false
            const isNsfw = isGroup ? nsfw.includes(from) : false
            const isLevelingOn = isGroup ? _leveling.includes(from) : false
            const isWelkom = isGroup ? welkom.includes(from) : false
            const isRegistered = registered.includes(sender)
            const totalchat = await yuu.chats.all()
            const isOwner = ownerNumber.includes(sender)

        /****** End Of Validator *****/

            pesan = {
                wait: 'Tunggu pak, sedang proses...',
                waitfile: '*Tunggu file sedang dikirim\nJangan spam pak!*',
                unregist: `Kamu belum terdaftar di database\nKetik : *${prefix}verify atau ${prefix}daftar* untuk mendaftar`,
                dahregist: `Maaf pak ${pushname2}, anda sudah mendaftar sebelumnya`,
                nolink: 'Linknya mana pak?',
                nonsfw: 'NSFW belum diaktifkan',
                ok: 'Ok desu~',
                kelar: 'Sukses mengirim file',
                rusak: 'Error bang',
                error: {
                    stick: 'Gabisa bang, coba ulang',
                    Iv: 'Linknya mokad:v'
                },
                only: {
                    group: 'cuman di group...',
                    ownerG: 'khusus owner group...',
                    ownerB: 'lu siapa?',
                    admin: 'khusus admin group...',
                    Badmin: 'bukan admin gimana mau command'
                }
            }

            const isUrl = (urlnya) => {
                return urlnya.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'))
            }
            const reply = (teks) => {
                yuu.sendMessage(from, teks, text, { quoted: rei })
            }
            const sendMess = (hehe, teks) => {
                yuu.sendMessage(hehe, teks, text)
            }
            const costum = (pesan, tipe, target, target2) => {
                yuu.sendMessage(from, pesan, tipe, { quoted: { key: { fromMe: false, participant: `${target}`, ...(from ? { remoteJid: from } : {}) }, message: { conversation: `${target2}` } } })
            }

            const freply = { key: { fromMe: false, participant: `0@s.whatsapp.net`, ...(from ? { remoteJid: "status@broadcast" } : {}) }, message: { "imageMessage": { "url": "https://mmg.whatsapp.net/d/f/At0x7ZdIvuicfjlf9oWS6A3AR9XPh0P-hZIVPLsI70nM.enc", "mimetype": "image/jpeg", "caption": "yuu | @reiyuura", "fileSha256": "+Ia+Dwib70Y1CWRMAP9QLJKjIJt54fKycOfB2OEZbTU=", "fileLength": "28777", "height": 1080, "width": 1079, "mediaKey": "vXmRR7ZUeDWjXy5iQk17TrowBzuwRya0errAFnXxbGc=", "fileEncSha256": "sR9D2RS5JSifw49HeBADguI23fWDz1aZu4faWG/CyRY=", "directPath": "/v/t62.7118-24/21427642_840952686474581_572788076332761430_n.enc?oh=3f57c1ba2fcab95f2c0bb475d72720ba&oe=602F3D69", "mediaKeyTimestamp": "1610993486", "jpegThumbnail": fs.readFileSync('./help/rei.jpeg') } } }

            const mentions = (teks, memberr, id) => {
                (id == null || id == undefined || id == false) ? yuu.sendMessage(from, teks.trim(), extendedText, { contextInfo: { "mentionedJid": memberr } }): yuu.sendMessage(from, teks.trim(), extendedText, { quoted: rei, contextInfo: { "mentionedJid": memberr } })
            }
            async function faketoko(teks, url_image, title, code, price) {
                var punya_wa = "0@s.whatsapp.net"
                var ini_buffer = await getBuffer(url_image)
                const ini_cstoko = {
                    contextInfo: {
                        participant: punya_wa,
                        remoteJid: 'status@broadcast',
                        quotedMessage: {
                            productMessage: {
                                product: {
                                    currencyCode: code,
                                    title: title,
                                    priceAmount1000: price,
                                    productImageCount: 1,
                                    productImage: {
                                        jpegThumbnail: ini_buffer
                                    }
                                },
                                businessOwnerJid: "0@s.whatsapp.net"
                            }
                        }
                    }
                }
                yuu.sendMessage(from, teks, text, ini_cstoko)
            }

            let authorname = yuu.contacts[from] != undefined ? yuu.contacts[from].vname || yuu.contacts[from].notify : undefined
            if (authorname != undefined) { } else { authorname = groupName }

            function addMetadata(packname, author) {	// by Mhankbarbar
                if (!packname) packname = 'yuuBot'; if (!author) author = '@reiyuura';
                author = author.replace(/[^a-zA-Z0-9]/g, '');
                let name = `${author}_${packname}`
                if (fs.existsSync(`./stickers/${name}.exif`)) return `./stickers/${name}.exif`
                const json = {
                    "sticker-pack-name": packname,
                    "sticker-pack-publisher": author,
                }
                const littleEndian = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00])
                const bytes = [0x00, 0x00, 0x16, 0x00, 0x00, 0x00]

                let len = JSON.stringify(json).length
                let last

                if (len > 256) {
                    len = len - 256
                    bytes.unshift(0x01)
                } else {
                    bytes.unshift(0x00)
                }

                if (len < 16) {
                    last = len.toString(16)
                    last = "0" + len
                } else {
                    last = len.toString(16)
                }

                const buf2 = Buffer.from(last, "hex")
                const buf3 = Buffer.from(bytes)
                const buf4 = Buffer.from(JSON.stringify(json))

                const buffer = Buffer.concat([littleEndian, buf2, buf3, buf4])

                fs.writeFile(`./stickers/${name}.exif`, buffer, (err) => {
                    return `./stickers/${name}.exif`
                })

            }

            /*******Funtion ********/

            const getLevelingXp = (sender) => {
                let position = false
                Object.keys(_level).forEach((i) => {
                    if (_level[i].id === sender) {
                        position = i
                    }
                })
                if (position !== false) {
                    return _level[position].xp
                }
            }

            const getLevelingLevel = (sender) => {
                let position = false
                Object.keys(_level).forEach((i) => {
                    if (_level[i].id === sender) {
                        position = i
                    }
                })
                if (position !== false) {
                    return _level[position].level
                }
            }

            const getLevelingId = (sender) => {
                let position = false
                Object.keys(_level).forEach((i) => {
                    if (_level[i].id === sender) {
                        position = i
                    }
                })
                if (position !== false) {
                    return _level[position].id
                }
            }

            const addLevelingXp = (sender, amount) => {
                let position = false
                Object.keys(_level).forEach((i) => {
                    if (_level[i].id === sender) {
                        position = i
                    }
                })
                if (position !== false) {
                    _level[position].xp += amount
                    fs.writeFileSync('./database/users/level.json', JSON.stringify(_level))
                }
            }

            const addLevelingLevel = (sender, amount) => {
                let position = false
                Object.keys(_level).forEach((i) => {
                    if (_level[i].id === sender) {
                        position = i
                    }
                })
                if (position !== false) {
                    _level[position].level += amount
                    fs.writeFileSync('./database/users/level.json', JSON.stringify(_level))
                }
            }

            const addLevelingId = (sender) => {
                const obj = { id: sender, xp: 1, level: 1 }
                _level.push(obj)
                fs.writeFileSync('./database/users/level.json', JSON.stringify(_level))
            }

            if (budy.startsWith('Bot')) {
                reply(`Iya ada apa pak ${pushname2} panggil bot?\n Ketik ${prefix}menu untuk menggunakan bot 🙂`) //`Iya ada apa pak ${pushname2} panggil bot? ketik ${prefix}menu untuk menggunakan bot 🙂
            }
            if (budy.startsWith('Thanks')) {
                reply(`Sama Sama Kak ${pushname2}`)
            }
            if (budy.startsWith('thanks')) {
                reply(`Sama Sama Kak ${pushname2}`)
            }
            if (budy.startsWith('Makasih')) {
                reply(`Sama Sama Kak ${pushname2}`)
            }
            if (budy.startsWith('makasih')) {
                reply(`Sama Sama Kak ${pushname2}`)
            }
            if (budy.startsWith('Halo')) {
                reply(`Halo juga kak ${pushname2}`)
            }
            if (budy.startsWith('halo')) {
                reply(`Halo juga kak ${pushname2}`)
            }
            if (budy.startsWith('Arigatou')) {
                reply(`Sama Sama Kak ${pushname2}`)
            }
            if (budy.startsWith('arigatou')) {
                reply(`Sama Sama Kak ${pushname2}`)
            }
            if (budy.startsWith('thx')) {
                reply(`Sama Sama Kak ${pushname2}`)
            }
            if (budy.startsWith('Thx')) {
                reply(`Sama Sama Kak ${pushname2}`)
            }
            if (budy.startsWith('Yuu Chan')) {
                reply(`Nandayo *${pushname2}*`)
            }
            if (budy.match('@6289669497213')) {
                reply(`Halo ${pushname2}, Owner sekarang sedang offline\nTunggu beberapa saat lagi :)`)
            }
            if (budy.startsWith('Thankyou')) {
                reply(`Sama sama kak ${pushname2}`)
            }
            if (budy.match('@6285156897673')) {
                reply(`Ada apa pak ${pushname2} tag saya?`)
            }


            /*** End Of Funtion ****/

        /***** Leveling *****/
            //role level
            const levelRole = getLevelingLevel(sender)
            var role = 'Newbie ㋡'
            if (levelRole <= 2) {
                role = 'Newbie ㋡'
            } else if (levelRole <= 4) {
                role = 'Beginner Grade 1 ⚊¹'
            } else if (levelRole <= 6) {
                role = 'Beginner Grade 2 ⚊²'
            } else if (levelRole <= 8) {
                role = 'Beginner Grade 3 ⚊³'
            } else if (levelRole <= 10) {
                role = 'Beginner Grade 4 ⚊⁴'
            } else if (levelRole <= 12) {
                role = 'Private Grade 1 ⚌¹'
            } else if (levelRole <= 14) {
                role = 'Private Grade 2 ⚌²'
            } else if (levelRole <= 16) {
                role = 'Private Grade 3 ⚌³'
            } else if (levelRole <= 18) {
                role = 'Private Grade 4 ⚌⁴'
            } else if (levelRole <= 20) {
                role = 'Private Grade 5 ⚌⁵'
            } else if (levelRole <= 22) {
                role = 'Corporal Grade 1 ☰¹'
            } else if (levelRole <= 24) {
                role = 'Corporal Grade 2 ☰²'
            } else if (levelRole <= 26) {
                role = 'Corporal Grade 3 ☰³'
            } else if (levelRole <= 28) {
                role = 'Corporal Grade 4 ☰⁴'
            } else if (levelRole <= 30) {
                role = 'Corporal Grade 5 ☰⁵'
            } else if (levelRole <= 32) {
                role = 'Sergeant Grade 1 ≣¹'
            } else if (levelRole <= 34) {
                role = 'Sergeant Grade 2 ≣²'
            } else if (levelRole <= 36) {
                role = 'Sergeant Grade 3 ≣³'
            } else if (levelRole <= 38) {
                role = 'Sergeant Grade 4 ≣⁴'
            } else if (levelRole <= 40) {
                role = 'Sergeant Grade 5 ≣⁵'
            } else if (levelRole <= 42) {
                role = 'Staff Grade 1 ﹀¹'
            } else if (levelRole <= 44) {
                role = 'Staff Grade 2 ﹀²'
            } else if (levelRole <= 46) {
                role = 'Staff Grade 3 ﹀³'
            } else if (levelRole <= 48) {
                role = 'Staff Grade 4 ﹀⁴'
            } else if (levelRole <= 50) {
                role = 'Staff Grade 5 ﹀⁵'
            } else if (levelRole <= 52) {
                role = 'Sergeant Grade 1 ︾¹'
            } else if (levelRole <= 54) {
                role = 'Sergeant Grade 2 ︾²'
            } else if (levelRole <= 56) {
                role = 'Sergeant Grade 3 ︾³'
            } else if (levelRole <= 58) {
                role = 'Sergeant Grade 4 ︾⁴'
            } else if (levelRole <= 60) {
                role = 'Sergeant Grade 5 ︾⁵'
            } else if (levelRole <= 62) {
                role = '2nd Lt. Grade 1 ♢¹ '
            } else if (levelRole <= 64) {
                role = '2nd Lt. Grade 2 ♢²'
            } else if (levelRole <= 66) {
                role = '2nd Lt. Grade 3 ♢³'
            } else if (levelRole <= 68) {
                role = '2nd Lt. Grade 4 ♢⁴'
            } else if (levelRole <= 70) {
                role = '2nd Lt. Grade 5 ♢⁵'
            } else if (levelRole <= 72) {
                role = '1st Lt. Grade 1 ♢♢¹'
            } else if (levelRole <= 74) {
                role = '1st Lt. Grade 2 ♢♢²'
            } else if (levelRole <= 76) {
                role = '1st Lt. Grade 3 ♢♢³'
            } else if (levelRole <= 78) {
                role = '1st Lt. Grade 4 ♢♢⁴'
            } else if (levelRole <= 80) {
                role = '1st Lt. Grade 5 ♢♢⁵'
            } else if (levelRole <= 82) {
                role = 'Major Grade 1 ✷¹'
            } else if (levelRole <= 84) {
                role = 'Major Grade 2 ✷²'
            } else if (levelRole <= 86) {
                role = 'Major Grade 3 ✷³'
            } else if (levelRole <= 88) {
                role = 'Major Grade 4 ✷⁴'
            } else if (levelRole <= 90) {
                role = 'Major Grade 5 ✷⁵'
            } else if (levelRole <= 92) {
                role = 'Colonel Grade 1 ✷✷¹'
            } else if (levelRole <= 94) {
                role = 'Colonel Grade 2 ✷✷²'
            } else if (levelRole <= 96) {
                role = 'Colonel Grade 3 ✷✷³'
            } else if (levelRole <= 98) {
                role = 'Colonel Grade 4 ✷✷⁴'
            } else if (levelRole <= 100) {
                role = 'Colonel Grade 5 ✷✷⁵'
            } else if (levelRole <= 102) {
                role = 'Brigadier Early ✰'
            } else if (levelRole <= 104) {
                role = 'Brigadier Silver ✩'
            } else if (levelRole <= 106) {
                role = 'Brigadier gold ✯'
            } else if (levelRole <= 108) {
                role = 'Brigadier Platinum ✬'
            } else if (levelRole <= 110) {
                role = 'Brigadier Diamond ✪'
            } else if (levelRole <= 112) {
                role = 'Major General Early ✰'
            } else if (levelRole <= 114) {
                role = 'Major General Silver ✩'
            } else if (levelRole <= 116) {
                role = 'Major General gold ✯'
            } else if (levelRole <= 118) {
                role = 'Major General Platinum ✬'
            } else if (levelRole <= 120) {
                role = 'Major General Diamond ✪'
            } else if (levelRole <= 122) {
                role = 'Lt. General Early ✰'
            } else if (levelRole <= 124) {
                role = 'Lt. General Silver ✩'
            } else if (levelRole <= 126) {
                role = 'Lt. General gold ✯'
            } else if (levelRole <= 128) {
                role = 'Lt. General Platinum ✬'
            } else if (levelRole <= 130) {
                role = 'Lt. General Diamond ✪'
            } else if (levelRole <= 132) {
                role = 'General Early ✰'
            } else if (levelRole <= 134) {
                role = 'General Silver ✩'
            } else if (levelRole <= 136) {
                role = 'General gold ✯'
            } else if (levelRole <= 138) {
                role = 'General Platinum ✬'
            } else if (levelRole <= 140) {
                role = 'General Diamond ✪'
            } else if (levelRole <= 142) {
                role = 'Commander Early ★'
            } else if (levelRole <= 144) {
                role = 'Commander Intermediate ⍣'
            } else if (levelRole <= 146) {
                role = 'Commander Elite ≛'
            } else if (levelRole <= 148) {
                role = 'The Commander Hero ⍟'
            } else if (levelRole <= 152) {
                role = 'Legends 忍'
            } else if (levelRole <= 154) {
                role = 'Legends 忍'
            } else if (levelRole <= 156) {
                role = 'Legends 忍'
            } else if (levelRole <= 158) {
                role = 'Legends 忍'
            } else if (levelRole <= 160) {
                role = 'Legends 忍'
            } else if (levelRole <= 162) {
                role = 'Legends 忍'
            } else if (levelRole <= 164) {
                role = 'Legends 忍'
            } else if (levelRole <= 166) {
                role = 'Legends 忍'
            } else if (levelRole <= 168) {
                role = 'Legends 忍'
            } else if (levelRole <= 170) {
                role = 'Legends 忍'
            } else if (levelRole <= 172) {
                role = 'Legends 忍'
            } else if (levelRole <= 174) {
                role = 'Legends 忍'
            } else if (levelRole <= 176) {
                role = 'Legends 忍'
            } else if (levelRole <= 178) {
                role = 'Legends 忍'
            } else if (levelRole <= 180) {
                role = 'Legends 忍'
            } else if (levelRole <= 182) {
                role = 'Legends 忍'
            } else if (levelRole <= 184) {
                role = 'Legends 忍'
            } else if (levelRole <= 186) {
                role = 'Legends 忍'
            } else if (levelRole <= 188) {
                role = 'Legends 忍'
            } else if (levelRole <= 190) {
                role = 'Legends 忍'
            } else if (levelRole <= 192) {
                role = 'Legends 忍'
            } else if (levelRole <= 194) {
                role = 'Legends 忍'
            } else if (levelRole <= 196) {
                role = 'Legends 忍'
            } else if (levelRole <= 198) {
                role = 'Legends 忍'
            } else if (levelRole <= 200) {
                role = 'Legends 忍'
            } else if (levelRole <= 210) {
                role = 'Legends 忍'
            } else if (levelRole <= 220) {
                role = 'Legends 忍'
            } else if (levelRole <= 230) {
                role = 'Legends 忍'
            } else if (levelRole <= 240) {
                role = 'Legends 忍'
            } else if (levelRole <= 250) {
                role = 'Legends 忍'
            } else if (levelRole <= 260) {
                role = 'Legends 忍'
            } else if (levelRole <= 270) {
                role = 'Legends 忍'
            } else if (levelRole <= 280) {
                role = 'Legends 忍'
            } else if (levelRole <= 290) {
                role = 'Legends 忍'
            } else if (levelRole <= 300) {
                role = 'Legends 忍'
            } else if (levelRole <= 310) {
                role = 'Legends 忍'
            } else if (levelRole <= 320) {
                role = 'Legends 忍'
            } else if (levelRole <= 330) {
                role = 'Legends 忍'
            } else if (levelRole <= 340) {
                role = 'Legends 忍'
            } else if (levelRole <= 350) {
                role = 'Legends 忍'
            } else if (levelRole <= 360) {
                role = 'Legends 忍'
            } else if (levelRole <= 370) {
                role = 'Legends 忍'
            } else if (levelRole <= 380) {
                role = 'Legends 忍'
            } else if (levelRole <= 390) {
                role = 'Legends 忍'
            } else if (levelRole <= 400) {
                role = 'Legends 忍'
            } else if (levelRole <= 410) {
                role = 'Legends 忍'
            } else if (levelRole <= 420) {
                role = 'Legends 忍'
            } else if (levelRole <= 430) {
                role = 'Legends 忍'
            } else if (levelRole <= 440) {
                role = 'Legends 忍'
            } else if (levelRole <= 450) {
                role = 'Legends 忍'
            } else if (levelRole <= 460) {
                role = 'Legends 忍'
            } else if (levelRole <= 470) {
                role = 'Legends 忍'
            } else if (levelRole <= 480) {
                role = 'Legends 忍'
            } else if (levelRole <= 490) {
                role = 'Legends 忍'
            } else if (levelRole <= 500) {
                role = 'Legends 忍'
            } else if (levelRole <= 600) {
                role = 'Legends 忍'
            } else if (levelRole <= 700) {
                role = 'Legends 忍'
            } else if (levelRole <= 800) {
                role = 'Legends 忍'
            } else if (levelRole <= 900) {
                role = 'Legends 忍'
            } else if (levelRole <= 1000) {
                role = 'Legends 忍'
            } else if (levelRole <= 2000) {
                role = 'Legends 忍'
            } else if (levelRole <= 3000) {
                role = 'Legends 忍'
            } else if (levelRole <= 4000) {
                role = 'Legends 忍'
            } else if (levelRole <= 5000) {
                role = 'Legends 忍'
            } else if (levelRole <= 6000) {
                role = 'Legends 忍'
            } else if (levelRole <= 7000) {
                role = 'Legends 忍'
            } else if (levelRole <= 8000) {
                role = 'Legends 忍'
            } else if (levelRole <= 9000) {
                role = 'Legends 忍'
            } else if (levelRole <= 10000) {
                role = 'Legends 忍'
            }

            //function leveling
            if (isGroup && isLevelingOn) {
                const currentLevel = getLevelingLevel(sender)
                const checkId = getLevelingId(sender)
                try {
                    if (currentLevel === undefined && checkId === undefined) addLevelingId(sender)
                    const amountXp = Math.floor(Math.random() * 10) + 100
                    const requiredXp = 5000 * (Math.pow(2, currentLevel) - 1)
                    const getLevel = getLevelingLevel(sender)
                    addLevelingXp(sender, amountXp)
                    if (requiredXp <= getLevelingXp(sender)) {
                        addLevelingLevel(sender, 1)
                        //bayarLimit(sender, 3)
                        reply(`➸ * Username *: ${pushname2} \nYour progress: \n➸ * Level *: ${getLevel} \n➸ * XP *: ${getLevelingXp}`)
                    }
                } catch (err) {
                    console.error(err)
                }
            }


            colors = ['red', 'white', 'black', 'blue', 'yellow', 'green', 'aqua']
            const isMedia = (type === 'imageMessage' || type === 'videoMessage')
            const isQuotedImage = type === 'extendedTextMessage' && content.includes('imageMessage')
            const isQuotedVideo = type === 'extendedTextMessage' && content.includes('videoMessage')
            const isQuotedSticker = type === 'extendedTextMessage' && content.includes('stickerMessage')

            if (!isGroup && !isCmd) console.log(color(time, "white"), color("[ PRIVATE ]", "aqua"), color(budy, "white"), "from", color(sender.split('@')[0], "yellow"))
            if (isGroup && !isCmd) console.log(color(time, "white"), color("[  GROUP  ]", "aqua"), color(budy, "white"), "from", color(sender.split('@')[0], "yellow"), "in", color(groupName, "yellow"))
            if (!isGroup && isCmd) console.log(color(time, "white"), color("[ COMMAND ]", "cyan"), color(budy, "white"), "from", color(sender.split('@')[0], "yellow"))
            if (isGroup && isCmd) console.log(color(time, "white"), color("[ COMMAND ]", "cyan"), color(budy, "white"), "from", color(sender.split('@')[0], "yellow"), "in", color(groupName, "yellow"))

            switch (command) {
                case 'help':
                case 'menu':
                    var punya_wa = "0@s.whatsapp.net"
                    var ini_text = "yuu | Beta"
                    var ini_buffer = await getBuffer("https://i.ibb.co/grhPN1P/Reiyuura.jpg")
                    const ini_csreply = {
                        contextInfo: {
                            stanzaId: 'B826873620DD5947E683E3ABE663F263',
                            participant: punya_wa,
                            remoteJid: 'status@broadcast',
                            quotedMessage: {
                                imageMessage: {
                                    caption: ini_text,
                                    jpegThumbnail: ini_buffer
                                }
                            }
                        }
                    }
                    if (args[0] === '1') {
                        await reply(menuSticker(prefix))
                    } else if (args[0] === '2') {
                        await reply(menuDownloader(prefix))
                    } else if (args[0] === '3') {
                        await reply(menuAnimek(prefix))
                    } else if (args[0] === '4') {
                        await reply(menuModeration(prefix))
                    } else if (args[0] === '5') {
                        if (isGroup && !isNsfw) return reply(pesan.nonsfw)
                        await reply(menuNSFW(prefix))
                    } else if (args[0] === '6') {
                        await reply(menuTextMaker(prefix))
                    } else if (args[0] === '7') {
                        await reply(menuFun(prefix))
                        } else {
                            yuu.sendMessage(from, help(prefix), text, ini_csreply)
                        }
                    break
                case '1':
                    await reply(menuSticker(prefix))
                    break
                case '2':
                    await reply(menuDownloader(prefix))
                    break
                case '3':
                    await reply(menuAnimek(prefix))
                    break
                case '4':
                    await reply(menuModeration(prefix))
                    break
                case '5':
                    if (isGroup && !isNsfw) return reply(pesan.nonsfw)
                    await reply(menuNSFW(prefix))
                    break
                case '6':
                    await reply(menuTextMaker(prefix))
                    break
                case '7':
                    await reply(menuFun(prefix))
                    break
                case 'donate':
                    reply(donate(pushname2))
                    break
                case 'leveling':
                    if (!isGroup) return reply(pesan.only.groupo)
                    if (!isGroupAdmins) return reply(pesan.only.admin)
                    if (args.length < 1) return reply('Mengaktifkan tekan on, Menonaktif tekan off')
                    if (args[0] === 'on') {
                        if (isLevelingOn) return reply('*Fitur level sudah aktif sebelum nya*')
                        _leveling.push(from)
                        fs.writeFileSync('./database/group/leveling.json', JSON.stringify(_leveling))
                        reply('Leveling berhasil di Aktifkan')
                    } else if (args[0] === 'off') {
                        _leveling.splice(from, 1)
                        fs.writeFileSync('./database/group/leveling.json', JSON.stringify(_leveling))
                        reply('Leveling berhasil di Nonaktifkan')
                    } else {
                        reply('Pilih on atau off pak')
                    }
                    break
                case 'level':
                    //if (!isRegistered) return reply(ind.noregis())
                    if (!isLevelingOn) return reply('Leveling belum diaktifkan')
                    if (!isGroup) return reply(pesan.only.group)
                    const userLevel = getLevelingLevel(sender)
                    const userXp = getLevelingXp(sender)
                    if (userLevel === undefined && userXp === undefined) return reply('Belum ada level xixixi')
                    const requiredXp = 5000 * (Math.pow(2, userLevel) - 1)
                    resul = `◪ *LEVEL*\n  ├─ ❏ *Name* : ${pushname2}\n  ├─ ❏ *Nomor* : ${sender.split("@")[0]}\n  ├─ ❏ *User XP* : ${userXp}/${requiredXp}\n  ├─ ❏ *Level* : ${userLevel}\n  └─ ❏ *Role* : ${role}`
                    yuu.sendMessage(from, resul, text, { quoted: rei })
                        .catch(async (err) => {
                            console.error(err)
                            await reply(`Error!\n${err}`)
                        })
                    break
                case 'daftar':
                case 'verify':
                    yuu.updatePresence(from, Presence.composing);
                    if (isRegistered) return reply(pesan.dahregist);
                    const serdaftar = generateMessageID(2)
                    registered.push(sender)
                    fs.writeFileSync('./database/bot/registered.json', JSON.stringify(registered));
                    try {
                        ppimg = await yuu.getProfilePicture(`${sender.split('@')[0]}@s.whatsapp.net`);
                    } catch {
                        ppimg = 'https://i0.wp.com/www.gambarunik.id/wp-content/uploads/2019/06/Top-Gambar-Foto-Profil-Kosong-Lucu-Tergokil-.jpg';
                    }
                    captionnya = `╭─「 *_REGISTRATION_* 」\`\`\`\n│ Pendaftaran behasil dengan SN: \n│${serdaftar}\`\`\`\n│\n│\`\`\`Pada ${time}\`\`\`\n│\`\`\`「 Nama 」: ${pushname2}\`\`\`\n│\`\`\`「 Nomor 」: wa.me/${sender.split('@')[0]
                        }\`\`\`\n│\`\`\`Untuk menggunakan bot\`\`\`\n│\`\`\`silahkan\`\`\`\n│\`\`\`kirim ${prefix}help/menu\`\`\`\n│\`\`\`\n│total pengguna: ${registered.length} orang\`\`\`\n╰────────────────`;
                    daftarimg = await getBuffer(ppimg);
                    yuu.sendMessage(from, daftarimg, image, { quoted: freply, caption: captionnya });
                    break
                case 'join':
                    reply('Hubungi owner atau kirim pesan ke Bot')
                    break
                case 'grup':
                case 'group':
                    if (!isGroup) return reply(pesan.only.group)
                    if (!isGroupAdmins) return reply(pesan.only.admin)
                    if (!isBotGroupAdmins) return reply(pesan.only.Badmin)
                    if (args[0] === 'open') {
                        reply(`*BERHASIL MEMBUKA GROUP*`)
                        yuu.groupSettingChange(from, GroupSettingChange.messageSend, false)
                    } else if (args[0] === 'close') {
                        reply(`*BERHASIL MENUTUP GROUP*`)
                        yuu.groupSettingChange(from, GroupSettingChange.messageSend, true)
                    }
                    break
                case 'kick':
                    if (!isGroup) return reply(pesan.only.group);
                    if (!isGroupAdmins) return reply(pesan.only.admin);
                    if (!isBotGroupAdmins) return reply(pesan.only.Badmin);
                    if (rei.message.extendedTextMessage === undefined || rei.message.extendedTextMessage === null) return reply('Tag member yang ingin di tendang!');
                    mentioned = rei.message.extendedTextMessage.contextInfo.mentionedJid;
                    if (mentioned.length > 1) {
                        teks = 'Perintah di terima, mengeluarkan :\n';
                        for (let _ of mentioned) {
                            teks += `@${_.split('@')[0]}\n`;
                        }
                        mentions(teks, mentioned, true);
                        yuu.groupRemove(from, mentioned);
                    } else {
                        mentions(`Perintah di terima, mengeluarkan : @${mentioned[0].split('@')[0]}`, mentioned, true);
                        yuu.groupRemove(from, mentioned);
                    }
                    break
                case 'delete':
                case 'del':
                case 'd':
                    if (!isGroup) return reply(pesan.only.group);
                    //if (!isGroupAdmins) return reply(pesan.only.admin);
                    yuu.deleteMessage(from, { id: rei.message.extendedTextMessage.contextInfo.stanzaId, remoteJid: from, fromMe: true });
                    break
                case 'promote':
                case 'pm':
                    if (!isGroup) return reply(pesan.only.group);
                    if (!isGroupAdmins) return reply(pesan.only.admin);
                    if (!isBotGroupAdmins) return reply(pesan.only.Badmin);
                    if (rei.message.extendedTextMessage === undefined || rei.message.extendedTextMessage === null) return reply('Tag target yang ingin di jadi admin!');
                    mentioned = rei.message.extendedTextMessage.contextInfo.mentionedJid;
                    if (mentioned.length > 1) {
                        teks = 'Perintah di terima, anda menjdi admin \n';
                        for (let _ of mentioned) {
                            teks += `@${_.split('@')[0]}\n`;
                        }
                        mentions(teks, mentioned, true);
                        yuu.groupMakeAdmin(from, mentioned);
                    } else {
                        mentions(`Perintah di terima, @${mentioned[0].split('@')[0]} Kamu Menjadi Admin Di Group *${groupMetadata.subject}*`, mentioned, true);
                        yuu.groupMakeAdmin(from, mentioned);
                    }
                    break
                case 'demote':
                    if (!isGroup) return reply(pesan.only.group);
                    if (!isGroupAdmins) return reply(pesan.only.admin);
                    if (!isBotGroupAdmins) return reply(pesan.only.Badmin);
                    if (rei.message.extendedTextMessage === undefined || rei.message.extendedTextMessage === null) return reply('Tag target yang ingin di tidak jadi admin!');
                    mentioned = rei.message.extendedTextMessage.contextInfo.mentionedJid;
                    if (mentioned.length > 1) {
                        teks = 'Perintah di terima, anda tidak menjadi admin \n';
                        for (let _ of mentioned) {
                            teks += `@${_.split('@')[0]}\n`;
                        }
                        mentions(teks, mentioned, true);
                        yuu.groupDemoteAdmin(from, mentioned);
                    } else {
                        mentions(`Perintah di terima, Menurunkan  @${mentioned[0].split('@')[0]} Menjadi Member`, mentioned, true);
                        yuu.groupDemoteAdmin(from, mentioned);
                    }
                    break
                case 'toimg':
                    //if (!isRegistered) return reply(`Kamu belum terdaftar di database\nEx : Ketik *${prefix}verify* untuk mendaftar`)
                    if (!isQuotedSticker) return reply('sticker saja pak')
                    reply(pesan.wait)
                    encmedia = JSON.parse(JSON.stringify(rei).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo
                    media = await yuu.downloadAndSaveMediaMessage(encmedia)
                    ran = getRandom('.png')
                    exec(`ffmpeg -i ${media} ${ran}`, (err) => {
                        fs.unlinkSync(media)
                        if (err) return reply('Error om')
                        buffer = fs.readFileSync(ran)
                        yuu.sendMessage(from, buffer, image, { quoted: rei, caption: pesan.ok })
                        fs.unlinkSync(ran)
                    })
                    break
                case 'tagall':
                    if (!isGroup) return reply('Hanya dialam grup pak')
                    if (!isGroupAdmins) return reply('Hanya admin pak')
                    members_id = []
                    teks = (args.length > 1) ? body.slice(8).trim() : ''
                    teks += '\n\n'
                    for (let mem of groupMembers) {
                        teks += `➸ @${mem.jid.split('@')[0]}\n`
                        members_id.push(mem.jid)
                    }
                    mentions(teks, members_id, true)
                    break
                case 'hidetag':
                    if (sender.split("@")[0] != owner) return reply("Command only for owner bot")
                    var value = args.join(" ")
                    var group = await yuu.groupMetadata(from)
                    var member = group['participants']
                    var mem = []
                    member.map(async adm => {
                        mem.push(adm.id.replace('c.us', 's.whatsapp.net'))
                    })
                    var options = {
                        text: value,
                        contextInfo: { mentionedJid: mem },
                        quoted: rei
                    }
                    yuu.sendMessage(from, options, text)
                    break
                case 'nsfw':
                    if (!isGroup) return reply(pesan.only.group);
                    if (!isGroupAdmins) return reply(pesan.only.admin)
                    if (args.length < 1) return reply('Pilih On atau Off pak')
                    if (args[0] === 'on') {
                        if (isNsfw) return reply('Udah aktif pak')
                        nsfw.push(from);
                        fs.writeFileSync('./database/nsfw.json', JSON.stringify(nsfw));
                        reply(`\`\`\`Sukses mengaktifkan fitur nsfw di group\`\`\` *${groupMetadata.subject}*`)
                    } else if (args[0] === 'off') {
                        nsfw.splice(from, 1)
                        fs.writeFileSync('./database/nsfw.json', JSON.stringify(nsfw));
                        reply(`\`\`\`Sukses menonaktifkan fitur nsfw di group\`\`\` *${groupMetadata.subject}*`)
                    } else {
                        reply('On untuk mengaktifkan, Off untuk menonaktifkan')
                    }
                    break
                case 'welcome':
                    //if (isBanned) return reply(pesan.only.benned);
                    //if (!isUser) return reply(pesan.only.userB);
                    if (!isGroup) return reply(pesan.only.group);
                    if (!isGroupAdmins) return reply(pesan.only.admin);
                    if (args.length < 1) return reply('Hmmmm');
                    if (args[0] === 'on') {
                        if (isWelkom) return reply('Udah aktif kak');
                        welkom.push(from);
                        fs.writeFileSync('./database/group/welkom.json', JSON.stringify(welkom));
                        reply(`\`\`\`✓“Sukses mengaktifkan fitur welcome di group\`\`\` *${groupMetadata.subject}*`);
                    } else if (args[0] === 'off') {
                        welkom.splice(from, 1);
                        fs.writeFileSync('./database/group/welkom.json', JSON.stringify(welkom));
                        reply(`\`\`\`✓“Sukses menonaktifkan fitur welcome di group\`\`\` *${groupMetadata.subject}*`);
                    } else {
                        reply('On untuk mengaktifkan, Off untuk menonaktifkan');
                    }
                    break
                case 'lirik':
                    if (args.length == 0) return reply(`Example: ${prefix + command} Melukis Senja`)
                    query = args.join(" ")
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/lirik?apikey=${apikey}&query=${query}`)
                    reply(get_result.result)
                    break
                case 'brainly':
                    if (args.length == 0) return reply(`Example: ${prefix + command} Apa itu anime`)
                    query = args.join(" ")
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/brainly?apikey=${apikey}&query=${query}`)
                    get_result = get_result.result
                    ini_txt = "Result : \n"
                    for (var x of get_result) {
                        ini_txt += `${x.title}\n`
                        ini_txt += `${x.url}\n\n`
                    }
                    reply(ini_txt)
                    break
                case 'character':
                case 'karakter':
                    if (args.length == 0) return reply(`Example: ${prefix + command} yuu`)
                    query = args.join(" ")
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/character?apikey=${apikey}&query=${query}`)
                    get_result = get_result.result
                    ini_txt = `Id : ${get_result.id}\n`
                    ini_txt += `Name : ${get_result.name.full}\n`
                    ini_txt += `Native : ${get_result.name.native}\n`
                    ini_txt += `Favorites : ${get_result.favourites}\n`
                    ini_txt += `Media : \n`
                    ini_media = get_result.media.nodes
                    for (var x of ini_media) {
                        ini_txt += `- ${x.title.romaji} (${x.title.native})\n`
                    }
                    ini_txt += `\nDescription : \n${get_result.description.replace(/__/g, "_")}`
                    thumbnail = await getBuffer(get_result.image.large)
                    yuu.sendMessage(from, thumbnail, image, { quoted: rei, caption: ini_txt })
                    break
                case 'manga':
                    if (args.length == 0) return reply(`Example: ${prefix + command} Majo no tabi tabi`)
                    query = args.join(" ")
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/manga?apikey=${apikey}&query=${query}`)
                    get_result = get_result.result
                    ini_txt = `Id : ${get_result.id}\n`
                    ini_txt += `Id MAL : ${get_result.idMal}\n`
                    ini_txt += `Title : ${get_result.title.romaji}\n`
                    ini_txt += `English : ${get_result.title.english}\n`
                    ini_txt += `Native : ${get_result.title.native}\n`
                    ini_txt += `Format : ${get_result.format}\n`
                    ini_txt += `Chapters : ${get_result.chapters}\n`
                    ini_txt += `Volume : ${get_result.volumes}\n`
                    ini_txt += `Status : ${get_result.status}\n`
                    ini_txt += `Source : ${get_result.source}\n`
                    ini_txt += `Start Date : ${get_result.startDate.day} - ${get_result.startDate.month} - ${get_result.startDate.year}\n`
                    ini_txt += `End Date : ${get_result.endDate.day} - ${get_result.endDate.month} - ${get_result.endDate.year}\n`
                    ini_txt += `Genre : ${get_result.genres.join(", ")}\n`
                    ini_txt += `Synonyms : ${get_result.synonyms.join(", ")}\n`
                    ini_txt += `Score : ${get_result.averageScore}%\n`
                    ini_txt += `Characters : \n`
                    ini_character = get_result.characters.nodes
                    for (var x of ini_character) {
                        ini_txt += `- ${x.name.full} (${x.name.native})\n`
                    }
                    ini_txt += `\nDescription : ${get_result.description}`
                    thumbnail = await getBuffer(get_result.coverImage.large)
                    yuu.sendMessage(from, thumbnail, image, { quoted: rei, caption: ini_txt })
                    break
                case 'anime':
                    if (args.length == 0) return reply(`Example: ${prefix + command} Majo no tabi tabi`)
                    query = args.join(" ")
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/anime?apikey=${apikey}&query=${query}`)
                    get_result = get_result.result
                    ini_txt = `Id : ${get_result.id}\n`
                    ini_txt += `Id MAL : ${get_result.idMal}\n`
                    ini_txt += `Title : ${get_result.title.romaji}\n`
                    ini_txt += `English : ${get_result.title.english}\n`
                    ini_txt += `Native : ${get_result.title.native}\n`
                    ini_txt += `Format : ${get_result.format}\n`
                    ini_txt += `Episodes : ${get_result.episodes}\n`
                    ini_txt += `Duration : ${get_result.duration} mins.\n`
                    ini_txt += `Status : ${get_result.status}\n`
                    ini_txt += `Season : ${get_result.season}\n`
                    ini_txt += `Season Year : ${get_result.seasonYear}\n`
                    ini_txt += `Source : ${get_result.source}\n`
                    ini_txt += `Start Date : ${get_result.startDate.day} - ${get_result.startDate.month} - ${get_result.startDate.year}\n`
                    ini_txt += `End Date : ${get_result.endDate.day} - ${get_result.endDate.month} - ${get_result.endDate.year}\n`
                    ini_txt += `Genre : ${get_result.genres.join(", ")}\n`
                    ini_txt += `Synonyms : ${get_result.synonyms.join(", ")}\n`
                    ini_txt += `Score : ${get_result.averageScore}%\n`
                    ini_txt += `Characters : \n`
                    ini_character = get_result.characters.nodes
                    for (var x of ini_character) {
                        ini_txt += `- ${x.name.full} (${x.name.native})\n`
                    }
                    ini_txt += `\nDescription : ${get_result.description}`
                    thumbnail = await getBuffer(get_result.coverImage.large)
                    yuu.sendMessage(from, thumbnail, image, { quoted: rei, caption: ini_txt })
                    break
                case 'bc':
                    if (sender.split("@")[0] != owner) return reply("Command only for owner bot")
                    if (args.length < 1) return reply('.......')
                    anu = await yuu.chats.all()
                    if (isMedia && !rei.message.videoMessage || isQuotedImage) {
                        const encmedia = isQuotedImage ? JSON.parse(JSON.stringify(rei).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo : rei
                        buff = await yuu.downloadMediaMessage(encmedia)
                        for (let _ of anu) {
                            yuu.sendMessage(_.jid, buff, image, { caption: `❮ 𝙋𝙀𝙎𝘼𝙉 𝘽𝙍𝙊𝘼𝘿𝘾𝘼𝙎𝙏 ❯\n\n${body.slice(4)}` })
                        }
                        reply('𝙨𝙪𝙘𝙘𝙚𝙨𝙨 𝙗𝙧𝙤𝙖𝙙𝙘𝙖𝙨𝙩 ')
                    } else {
                        for (let _ of anu) {
                            sendMess(_.jid, `*INFO NEW*\n\n${body.slice(4)}`)
                        }
                        reply('𝙨𝙪𝙘𝙘𝙚𝙨𝙨 𝙗𝙧𝙤𝙖𝙙𝙘𝙖𝙨𝙩 ')
                    }
                    break
                case 'alquran':
                    if (args.length < 1) return reply('_Example: !alquran 108_')
                    urls = `http://api.lolhuman.xyz/api/quran/${args[0]}?apikey=${apikey}`
                    quran = await fetchJson(urls)
                    result = quran.result
                    ayat = result.ayat
                    ini_txt = `QS. ${result.surah} : 1-${ayat.length}\n\n`
                    for (var x in ayat) {
                        test = ayat[x]
                        arab = test.arab
                        nomor = test.ayat
                        latin = test.latin
                        indo = test.indonesia
                        ini_txt += `${arab}\n${nomor}. ${latin}\n${indo}\n\n`
                    }
                    ini_txt = ini_txt.replace(/<u>/g, "").replace(/<\/u>/g, "")
                    ini_txt = ini_txt.replace(/<strong>/g, "").replace(/<\/strong>/g, "")
                    ini_txt = ini_txt.replace(/<u>/g, "").replace(/<\/u>/g, "")
                    reply(ini_txt)
                    break
                case 'alquranaudio':
                    if (args.length == 0) return reply(`Usage: ${prefix + command} query\nExample: ${prefix + command} 18 or ${prefix + command} 18/10`)
                    surah = args[0]
                    ini_buffer = await getBuffer(`http://api.lolhuman.xyz/api/quran/audio/${surah}?apikey=${apikey}`)
                    yuu.sendMessage(from, ini_buffer, audio, { quoted: rei, mimetype: Mimetype.mp4Audio })
                    break
                case 'quotes':
                    quotes = await fetchJson(`http://api.lolhuman.xyz/api/random/quotes?apikey=${apikey}`)
                    quotes = quotes.result
                    author = quotes.by
                    quotes = quotes.quote
                    reply(`_${quotes}_\n\n*― ${author}*`)
                    break
                case 'quotesanime':
                    quotes = await fetchJson(`http://api.lolhuman.xyz/api/random/quotesnime?apikey=${apikey}`)
                    quotes = quotes.result
                    quote = quotes.quote
                    char = quotes.character
                    anime = quotes.anime
                    episode = quotes.episode
                    reply(`_${quote}_\n\n*― ${char}*\n*― ${anime} ${episode}*`)
                    break
                case 'quotesdilan':
                    quotedilan = await fetchJson(`http://api.lolhuman.xyz/api/quotes/dilan?apikey=${apikey}`)
                    reply(quotedilan.result)
                    break
                case 'jadwaltv':
                    channel = args[0]
                    tvnow = await fetchJson(`http://api.lolhuman.xyz/api/jadwaltv/${channel}?apikey=${apikey}`)
                    tvnow = tvnow.result
                    ini_txt = `Jadwal TV ${channel.toUpperCase()}\n`
                    for (var x in tvnow) {
                        ini_txt += `${x} - ${tvnow[x]}\n`
                    }
                    reply(ini_txt)
                    break
                case 'nhentai':
                    henid = args[0]
                    anu = await fetchJson(`http://api.lolhuman.xyz/api/nhentai/${henid}?apikey=${apikey}`)
                    anu = anu.result
                    ini_txt = `Title Romaji : ${anu.title_romaji}\n`
                    ini_txt += `Title Native : ${anu.title_native}\n`
                    //ini_txt += `Read Online : ${anu.read}\n`
                    get_info = anu.info
                    ini_txt += `Parodies : ${get_info.parodies}\n`
                    ini_txt += `Character : ${get_info.characters.join(", ")}\n`
                    ini_txt += `Tags : ${get_info.tags.join(", ")}\n`
                    ini_txt += `Artist : ${get_info.artists}\n`
                    ini_txt += `Group : ${get_info.groups}\n`
                    ini_txt += `Languager : ${get_info.languages.join(", ")}\n`
                    ini_txt += `Categories : ${get_info.categories}\n`
                    ini_txt += `Pages : ${get_info.pages}\n`
                    ini_txt += `Uploaded : ${get_info.uploaded}\n`
                    reply(ini_txt)
                    break
                case 'nhentaipdf':
                    henid = args[0]
                    anu = await fetchJson(`http://api.lolhuman.xyz/api/nhentaipdf/${henid}?apikey=${apikey}`)
                    anu = anu.result
                    ini_buffer = await getBuffer(anu)
                    yuu.sendMessage(from, ini_buffer, document, { quoted: rei, mimetype: Mimetype.pdf, filename: `${henid}.pdf` })
                    break
                case 'wancak':
                    ini_buffer = await getBuffer(`http://api.lolhuman.xyz/api/onecak?apikey=${apikey}`)
                    yuu.sendMessage(from, ini_buffer, image, { quoted: rei })
                    break
                case 'kusonime':
                    urlnya = args[0]
                    anu = await fetchJson(`http://api.lolhuman.xyz/api/kusonime?apikey=${apikey}&url=${urlnya}`)
                    anu = anu.result
                    ini_txt = `Title : ${anu.title}\n`
                    ini_txt += `Japanese : ${anu.japanese}\n`
                    ini_txt += `Genre : ${anu.genre}\n`
                    ini_txt += `Seasons : ${anu.seasons}\n`
                    ini_txt += `Producers : ${anu.producers}\n`
                    ini_txt += `Type : ${anu.type}\n`
                    ini_txt += `Status : ${anu.status}\n`
                    ini_txt += `Total Episode : ${anu.total_episode}\n`
                    ini_txt += `Score : ${anu.score}\n`
                    ini_txt += `Duration : ${anu.duration}\n`
                    ini_txt += `Released On : ${anu.released_on}\n`
                    ini_txt += `Desc : ${anu.desc}\n`
                    link_dl = anu.link_dl
                    for (var x in link_dl) {
                        ini_txt += `\n${x}\n`
                        for (var y in link_dl[x]) {
                            ini_txt += `${y} - ${link_dl[x][y]}\n`
                        }
                    }
                    ini_buffer = await getBuffer(anu.thumbnail)
                    yuu.sendMessage(from, ini_buffer, image, { quoted: rei, caption: ini_txt })
                    break
                case 'kusonimesearch':
                    query = args.join(" ")
                    anu = await fetchJson(`http://api.lolhuman.xyz/api/kusonimesearch?apikey=${apikey}&query=${query}`)
                    anu = anu.result
                    ini_txt = `Title : ${anu.title}\n`
                    ini_txt += `Japanese : ${anu.japanese}\n`
                    ini_txt += `Genre : ${anu.genre}\n`
                    ini_txt += `Seasons : ${anu.seasons}\n`
                    ini_txt += `Producers : ${anu.producers}\n`
                    ini_txt += `Type : ${anu.type}\n`
                    ini_txt += `Status : ${anu.status}\n`
                    ini_txt += `Total Episode : ${anu.total_episode}\n`
                    ini_txt += `Score : ${anu.score}\n`
                    ini_txt += `Duration : ${anu.duration}\n`
                    ini_txt += `Released On : ${anu.released_on}\n`
                    ini_txt += `Desc : ${anu.desc}\n`
                    link_dl = anu.link_dl
                    for (var x in link_dl) {
                        ini_txt += `\n${x}\n`
                        for (var y in link_dl[x]) {
                            ini_txt += `${y} - ${link_dl[x][y]}\n`
                        }
                    }
                    ini_buffer = await getBuffer(anu.thumbnail)
                    yuu.sendMessage(from, ini_buffer, image, { quoted: rei, caption: ini_txt })
                    break
                case 'otakudesu':
                    urlnya = args[0]
                    anu = await fetchJson(`http://api.lolhuman.xyz/api/otakudesu?apikey=${apikey}&url=${urlnya}`)
                    anu = anu.result
                    ini_txt = `Title : ${anu.title}\n`
                    ini_txt += `Japanese : ${anu.japanese}\n`
                    ini_txt += `Judul : ${anu.judul}\n`
                    ini_txt += `Type : ${anu.type}\n`
                    ini_txt += `Episode : ${anu.episodes}\n`
                    ini_txt += `Aired : ${anu.aired}\n`
                    ini_txt += `Producers : ${anu.producers}\n`
                    ini_txt += `Genre : ${anu.genres}\n`
                    ini_txt += `Duration : ${anu.duration}\n`
                    ini_txt += `Studios : ${anu.status}\n`
                    ini_txt += `Rating : ${anu.rating}\n`
                    ini_txt += `Credit : ${anu.credit}\n`
                    get_link = anu.link_dl
                    for (var x in get_link) {
                        ini_txt += `\n\n*${get_link[x].title}*\n`
                        for (var y in get_link[x].link_dl) {
                            info = get_link[x].link_dl[y]
                            ini_txt += `\n\`\`\`Reso : \`\`\`${info.reso}\n`
                            ini_txt += `\`\`\`Size : \`\`\`${info.size}\n`
                            ini_txt += `\`\`\`Link : \`\`\`\n`
                            down_link = info.link_dl
                            for (var z in down_link) {
                                ini_txt += `${z} - ${down_link[z]}\n`
                            }
                        }
                    }
                    reply(ini_txt)
                    break
                case 'otakudesusearch':
                    query = args.join(" ")
                    anu = await fetchJson(`http://api.lolhuman.xyz/api/otakudesusearch?apikey=${apikey}&query=${query}`)
                    anu = anu.result
                    ini_txt = `Title : ${anu.title}\n`
                    ini_txt += `Japanese : ${anu.japanese}\n`
                    ini_txt += `Judul : ${anu.judul}\n`
                    ini_txt += `Type : ${anu.type}\n`
                    ini_txt += `Episode : ${anu.episodes}\n`
                    ini_txt += `Aired : ${anu.aired}\n`
                    ini_txt += `Producers : ${anu.producers}\n`
                    ini_txt += `Genre : ${anu.genres}\n`
                    ini_txt += `Duration : ${anu.duration}\n`
                    ini_txt += `Studios : ${anu.status}\n`
                    ini_txt += `Rating : ${anu.rating}\n`
                    ini_txt += `Credit : ${anu.credit}\n`
                    get_link = anu.link_dl
                    for (var x in get_link) {
                        ini_txt += `\n\n*${get_link[x].title}*\n`
                        for (var y in get_link[x].link_dl) {
                            info = get_link[x].link_dl[y]
                            ini_txt += `\n\`\`\`Reso : \`\`\`${info.reso}\n`
                            ini_txt += `\`\`\`Size : \`\`\`${info.size}\n`
                            ini_txt += `\`\`\`Link : \`\`\`\n`
                            down_link = info.link_dl
                            for (var z in down_link) {
                                ini_txt += `${z} - ${down_link[z]}\n`
                            }
                        }
                    }
                    reply(ini_txt)
                    break
                case 'stickerwm':
                    if ((isMedia && !rei.message.videoMessage || isQuotedImage)) {
                        const encmedia = isQuotedImage ? JSON.parse(JSON.stringify(rei).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo : rei
                        filePath = await yuu.downloadAndSaveMediaMessage(encmedia, filename = getRandom());
                        file_name = getRandom(".webp")
                        ini_txt = args.join(" ").split("|")
                        request({
                            url: `http://api.lolhuman.xyz/api/convert/towebpauthor?apikey=${apikey}`,
                            method: 'POST',
                            formData: {
                                "img": fs.createReadStream(filePath),
                                "package": ini_txt[0],
                                "author": ini_txt[1]
                            },
                            encoding: "binary"
                        }, function(error, response, body) {
                            fs.unlinkSync(filePath)
                            fs.writeFileSync(file_name, body, "binary")
                            ini_buff = fs.readFileSync(file_name)
                            yuu.sendMessage(from, ini_buff, sticker, { quoted: rei })
                            fs.unlinkSync(file_name)
                        });
                    } else {
                        reply(`Kirim gambar dengan caption ${prefix + command} atau tag gambar yang sudah dikirim`)
                    }
                    break
                case 'stiker':
                case 'sticker':
                    //if (!isRegistered) return reply(`Kamu belum terdaftar di database\nEx : Ketik *${prefix}verify* untuk mendaftar`)
                    if ((isMedia && !rei.message.videoMessage || isQuotedImage) && args.length == 0) {
                        const encmedia = isQuotedImage ? JSON.parse(JSON.stringify(rei).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo : rei
                        const media = await yuu.downloadAndSaveMediaMessage(encmedia)
                        ran = getRandom('.webp')
                        await ffmpeg(`./${media}`)
                            .input(media)
                            .on('start', function (cmd) {
                                console.log(`Started : ${cmd}`)
                            })
                            .on('error', function (err) {
                                console.log(`Error : ${err}`)
                                fs.unlinkSync(media)
                                reply(pesan.error.stick)
                            })
                            .on('end', function () {
                                console.log('Finish')
                                exec(`webpmux -set exif ${addMetadata('yuuBot', '@reiyuura')} ${ran} -o ${ran}`, async (error) => {
                                    if (error) return reply(pesan.error.stick)
                                    yuu.sendMessage(from, fs.readFileSync(ran), sticker, { quoted: rei })
                                    fs.unlinkSync(media)
                                    fs.unlinkSync(ran)
                                })
                            })
                            .addOutputOptions([`-vcodec`, `libwebp`, `-vf`, `scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`])
                            .toFormat('webp')
                            .save(ran)
                    } else if ((isMedia && rei.message.videoMessage.seconds < 11 || isQuotedVideo && rei.message.extendedTextMessage.contextInfo.quotedMessage.videoMessage.seconds < 11) && args.length == 0) {
                        const encmedia = isQuotedVideo ? JSON.parse(JSON.stringify(rei).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo : rei
                        const media = await yuu.downloadAndSaveMediaMessage(encmedia)
                        ran = getRandom('.webp')
                        reply(pesan.wait)
                        await ffmpeg(`./${media}`)
                            .inputFormat(media.split('.')[1])
                            .on('start', function (cmd) {
                                console.log(`Started : ${cmd}`)
                            })
                            .on('error', function (err) {
                                console.log(`Error : ${err}`)
                                fs.unlinkSync(media)
                                tipe = media.endsWith('.mp4') ? 'video' : 'gif'
                                reply(`❌ Gagal, pada saat mengkonversi ${tipe} ke stiker`)
                            })
                            .on('end', function () {
                                console.log('Finish')
                                exec(`webpmux -set exif ${addMetadata('yuuBot', '@reiyuura')} ${ran} -o ${ran}`, async (error) => {
                                    if (error) return reply(pesan.error.stick)
                                    yuu.sendMessage(from, fs.readFileSync(ran), sticker, { quoted: rei })
                                    fs.unlinkSync(media)
                                    fs.unlinkSync(ran)
                                })
                            })
                            .addOutputOptions([`-vcodec`, `libwebp`, `-vf`, `scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`])
                            .toFormat('webp')
                            .save(ran)
                    } else if ((isMedia || isQuotedImage) && args[0] == 'nobg') {
                        const encmedia = isQuotedImage ? JSON.parse(JSON.stringify(rei).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo : rei
                        const media = await yuu.downloadAndSaveMediaMessage(encmedia)
                        ranw = getRandom('.webp')
                        ranp = getRandom('.png')
                        reply(pesan.wait)
                        keyrmbg = 'mDFyehsrjRS1vrVcKhLaQ4T8'
                        await removeBackgroundFromImageFile({ path: media, apiKey: keyrmbg.result, size: 'auto', type: 'auto', ranp }).then(res => {
                            fs.unlinkSync(media)
                            let buffer = Buffer.from(res.base64img, 'base64')
                            fs.writeFileSync(ranp, buffer, (err) => {
                                if (err) return reply('Gagal, Terjadi kesalahan, silahkan coba beberapa saat lagi.')
                            })
                            exec(`ffmpeg -i ${ranp} -vcodec libwebp -filter:v fps=fps=20 -lossless 1 -loop 0 -preset default -an -vsync 0 -s 512:512 ${ranw}`, (err) => {
                                fs.unlinkSync(ranp)
                                if (err) return reply(pesan.error.stick)
                                yuu.sendMessage(from, fs.readFileSync(ranw), sticker, { quoted: rei })
                            })
                        })
                    } else {
                        reply(`Eror bang, mungkin durasi terlalu panjang`)
                    }
                    break

                case 'telesticker':
                    urlnya = args[0]
                    urlnya = await fetchJson(`http://api.lolhuman.xyz/api/telestick?apikey=${apikey}&url=${urlnya}`)
                    ini_sticker = urlnya.result.sticker
                    for (sticker_ in ini_sticker) {
                        ini_buffer = await getBuffer(ini_sticker[sticker_])
                        yuu.sendMessage(from, ini_buffer, sticker)
                    }
                    break
                case 'igdl':
                    if (args.length == 0) return reply(`Example: ${prefix + command} https://www.instagram.com/p/CJ8XKFmJ4al/?igshid=1acpcqo44kgkn`)
                    ini_url = args[0]
                    ini_url = await fetchJson(`http://api.lolhuman.xyz/api/instagram?apikey=${apikey}&url=${ini_url}`)
                    ini_url = ini_url.result
                    ini_type = image
                    if (ini_url.includes(".mp4")) ini_type = video
                    ini_buffer = await getBuffer(ini_url)
                    yuu.sendMessage(from, ini_buffer, ini_type, { quoted: rei })
                    break
                case 'fbdl':
                    if (args.length == 0) return reply(`Example: ${prefix + command} https://id-id.facebook.com/SamsungGulf/videos/video-bokeh/561108457758458/`)
                    ini_url = args[0]
                    ini_url = await fetchJson(`http://api.lolhuman.xyz/api/facebook?apikey=${apikey}&url=${ini_url}`)
                    ini_url = ini_url.result[0].link
                    ini_buffer = await getBuffer(ini_url)
                    yuu.sendMessage(from, ini_buffer, video, { quoted: rei })
                    break
                case 'nsfwcheck':
                    if ((isMedia && !rei.message.videoMessage || isQuotedImage) && args.length == 0) {
                        const encmedia = isQuotedImage ? JSON.parse(JSON.stringify(rei).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo : rei
                        const filePath = await yuu.downloadAndSaveMediaMessage(encmedia, filename = getRandom());
                        const form = new FormData();
                        const stats = fs.statSync(filePath);
                        const fileSizeInBytes = stats.size;
                        const fileStream = fs.createReadStream(filePath);
                        form.append('img', fileStream, { knownLength: fileSizeInBytes });
                        const options = {
                            method: 'POST',
                            credentials: 'include',
                            body: form
                        }
                        get_result = await fetchJson(`http://api.lolhuman.xyz/api/nsfwcheck?apikey=${apikey}`, { ...options })
                        fs.unlinkSync(filePath)
                        get_result = get_result.result
                        is_nsfw = "No"
                        if (Number(get_result.replace("%", "")) >= 50) is_nsfw = "Yes"
                        reply(`Is NSFW? ${is_nsfw}\nNSFW Score : ${get_result}`)
                    } else {
                        reply(`Kirim gambar dengan caption ${prefix + command} atau tag gambar yang sudah dikirim`)
                    }
                    break
                case 'ytsearch':
                case 'yts':
                    if (args.length == 0) return reply(`Usage: ${prefix + command} query\nExample: ${prefix + command} Tahu Bacem`)
                    query = args.join(" ")
                    anu = await fetchJson(`http://api.lolhuman.xyz/api/ytsearch?apikey=${apikey}&query=${query}`)
                    anu = anu.result
                    ini_txt = ""
                    for (var x in anu) {
                        ini_txt += `Title : ${anu[x].title}\n`
                        ini_txt += `Views : ${anu[x].views}\n`
                        ini_txt += `Published : ${anu[x].published}\n`
                        ini_txt += `Thumbnail : ${anu[x].thumbnail}\n`
                        ini_txt += `Link : https://www.youtube.com/watch?v=${anu[x].videoId}\n\n`
                    }
                    reply(ini_txt)
                    break
                case 'ytplay':
                case 'play':
                    query = args.join(" ")
                    reply(pesan.wait)
                    anu = await fetchJson(`http://api.lolhuman.xyz/api/ytplay?apikey=${apikey}&query=${query}`)
                    anu = anu.result
                    get_info = anu.info
                    ini_txt = `Title : ${get_info.title}\n`
                    ini_txt += `Uploader : ${get_info.uploader}\n`
                    ini_txt += `Duration : ${get_info.duration}\n`
                    ini_txt += `View : ${get_info.view}\n`
                    ini_txt += `Like : ${get_info.like}\n`
                    ini_txt += `Dislike : ${get_info.dislike}\n`
                    ini_txt += `Description :\n ${get_info.description}\n`
                    ini_buffer = await getBuffer(get_info.thumbnail)
                    yuu.sendMessage(from, ini_buffer, image, { quoted: rei, caption: ini_txt })
                    get_audio = await getBuffer(anu.audio[3].link)
                    yuu.sendMessage(from, get_audio, audio, { mimetype: 'audio/mp4', filename: `${get_info.title}.mp3`, quoted: rei })
                    //get_video = await getBuffer(anu.video[0].link)
                    //yuu.sendMessage(from, get_audio, video, { mimetype: 'video/mp4', filename: `${get_info.title}.mp4`, quoted: rei })
                    break
                case 'ytmp3':
                    ini_link = args[0]
                    anu = await fetchJson(`http://api.lolhuman.xyz/api/ytaudio?apikey=${apikey}&url=${ini_link}`)
                    anu = anu.result
                    ini_txt = `Title : ${anu.title}\n`
                    ini_txt += `Uploader : ${anu.uploader}\n`
                    ini_txt += `Duration : ${anu.duration}\n`
                    ini_txt += `View : ${anu.view}\n`
                    ini_txt += `Like : ${anu.like}\n`
                    ini_txt += `Dislike : ${anu.dislike}\n`
                    ini_txt += `Description :\n ${anu.description}`
                    ini_buffer = await getBuffer(anu.thumbnail)
                    yuu.sendMessage(from, ini_buffer, image, { quoted: rei, caption: ini_txt })
                    get_audio = await getBuffer(anu.link[3].link)
                    yuu.sendMessage(from, get_audio, audio, { mimetype: 'audio/mp4', filename: `${anu.title}.mp3`, quoted: rei })
                    break
                case 'ytmp4':
                    ini_link = args[0]
                    anu = await fetchJson(`http://api.lolhuman.xyz/api/ytvideo?apikey=${apikey}&url=${ini_link}`)
                    anu = anu.result
                    ini_txt = `Title : ${anu.title}\n`
                    ini_txt += `Uploader : ${anu.uploader}\n`
                    ini_txt += `Duration : ${anu.duration}\n`
                    ini_txt += `View : ${anu.view}\n`
                    ini_txt += `Like : ${anu.like}\n`
                    ini_txt += `Dislike : ${anu.dislike}\n`
                    ini_txt += `Description :\n ${anu.description}`
                    ini_buffer = await getBuffer(anu.thumbnail)
                    yuu.sendMessage(from, ini_buffer, image, { quoted: rei, caption: ini_txt })
                    get_audio = await getBuffer(anu.link[0].link)
                    yuu.sendMessage(from, get_audio, video, { mimetype: 'video/mp4', filename: `${anu.title}.mp4`, quoted: rei })
                    break
                case 'pinterest':
                    if (args.length == 0) return reply(`Usage: ${prefix + command} query\nExample: ${prefix + command} loli kawaii`)
                    query = args.join(" ")
                    urlnya = await fetchJson(`http://api.lolhuman.xyz/api/pinterest?apikey=${apikey}&query=${query}`)
                    urlnya = urlnya.result
                    ini_buffer = await getBuffer(urlnya)
                    yuu.sendMessage(from, ini_buffer, image, { quoted: rei })
                    break
                case 'pinterestdl':
                    urlnya = args[0]
                    urlnya = await fetchJson(`http://yuu.herokuapp.com/api/pinterestdl?apikey=${apikey}&url=${urlnya}`)
                    urlnya = urlnya.result["736x"]
                    ini_buffer = await getBuffer(urlnya)
                    yuu.sendMessage(from, ini_buffer, image, { quoted: rei })
                    break
                case 'konachan':
                    if (args.length == 0) return reply(`Usage: ${prefix + command} query\nExample: ${prefix + command} azur_lane`)
                    query = args.join(" ")
                    ini_buffer = await getBuffer(`http://api.lolhuman.xyz/api/konachan?apikey=${apikey}&query=${query}`)
                    yuu.sendMessage(from, ini_buffer, image, { quoted: rei })
                    break
                case 'ttp':
                case 'ttp2':
                case 'ttp3':
                case 'ttp4':
                    if (args.length == 0) return reply(`Usage: ${prefix + command} query\nExample: ${prefix + command} yuu Bot`)
                    ini_txt = args.join(" ")
                    ini_buffer = await getBuffer(`http://api.lolhuman.xyz/api/${command}?apikey=${apikey}&text=${ini_txt}`)
                    yuu.sendMessage(from, ini_buffer, sticker, { quoted: rei })
                    break
                case 'wait':
                    if ((isMedia && !rei.message.videoMessage || isQuotedImage) && args.length == 0) {
                        const encmedia = isQuotedImage ? JSON.parse(JSON.stringify(rei).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo : rei
                        const filePath = await yuu.downloadAndSaveMediaMessage(encmedia, filename = getRandom());
                        const form = new FormData();
                        const stats = fs.statSync(filePath);
                        const fileSizeInBytes = stats.size;
                        const fileStream = fs.createReadStream(filePath);
                        form.append('img', fileStream, { knownLength: fileSizeInBytes });
                        const options = {
                            method: 'POST',
                            credentials: 'include',
                            body: form
                        }
                        anu = await fetchJson(`http://api.lolhuman.xyz/api/wait?apikey=${apikey}`, {...options })
                        fs.unlinkSync(filePath)
                        anu = anu.result
                        ini_video = await getBuffer(anu.video)
                        ini_txt = `Anilist id : ${anu.anilist_id}\n`
                        ini_txt += `MAL id : ${anu.mal_id}\n`
                        ini_txt += `Title Romaji : ${anu.title_romaji}\n`
                        ini_txt += `Title Native : ${anu.title_native}\n`
                        ini_txt += `Title English : ${anu.title_english}\n`
                        ini_txt += `at : ${anu.at}\n`
                        ini_txt += `Episode : ${anu.episode}\n`
                        ini_txt += `Similarity : ${anu.similarity}`
                        yuu.sendMessage(from, ini_video, video, { quoted: rei, caption: ini_txt })
                    } else {
                        reply(`Kirim gambar dengan caption ${prefix + command} atau tag gambar yang sudah dikirim`)
                    }
                    break
                case 'xhamstersearch':
                    if (args.length == 0) return reply(`Usage: ${prefix + command} query\nExample: ${prefix + command} Japanese`)
                    query = args.join(" ")
                    anu = await fetchJson(`http://api.lolhuman.xyz/api/xhamstersearch?apikey=${apikey}&query=${query}`)
                    anu = anu.result
                    ini_txt = ""
                    for (var x in anu) {
                        ini_txt += `Title : ${anu[x].title}\n`
                        ini_txt += `Views : ${anu[x].views}\n`
                        ini_txt += `Duration : ${anu[x].duration}\n`
                        ini_txt += `Link : ${anu[x].link}\n\n`
                    }
                    reply(ini_txt)
                    break
                case 'xhamster':
                    if (args.length == 0) return reply(`Usage: ${prefix + command} query\nExample: ${prefix + command} https://xhamster.com/videos/party-with-friends-end-in-awesome-fucking-5798407`)
                    query = args.join(" ")
                    anu = await fetchJson(`http://api.lolhuman.xyz/api/xhamster?apikey=${apikey}&url=${query}`)
                    anu = anu.result
                    ini_txt = `Title : ${anu.title}\n`
                    ini_txt += `Duration : ${anu.duration}\n`
                    ini_txt += `Uploader : ${anu.author}\n`
                    ini_txt += `Upload : ${anu.upload}\n`
                    ini_txt += `View : ${anu.views}\n`
                    ini_txt += `Rating : ${anu.rating}\n`
                    ini_txt += `Like : ${anu.likes}\n`
                    ini_txt += `Dislike : ${anu.dislikes}\n`
                    ini_txt += `Comment : ${anu.comments}\n`
                    ini_txt += "Link : \n"
                    link = anu.link
                    for (var x in link) {
                        ini_txt += `${link[x].type} - ${link[x].link}\n\n`
                    }
                    thumbnail = await getBuffer(anu.thumbnail)
                    yuu.sendMessage(from, thumbnail, image, { quoted: rei, caption: ini_txt })
                    break
                case 'xnxxsearch':
                    if (args.length == 0) return reply(`Usage: ${prefix + command} query\nExample: ${prefix + command} Japanese`)
                    query = args.join(" ")
                    anu = await fetchJson(`http://api.lolhuman.xyz/api/xnxxsearch?apikey=${apikey}&query=${query}`)
                    anu = anu.result
                    ini_txt = ""
                    for (var x in anu) {
                        ini_txt += `Title : ${anu[x].title}\n`
                        ini_txt += `Views : ${anu[x].views}\n`
                        ini_txt += `Duration : ${anu[x].duration}\n`
                        ini_txt += `Uploader : ${anu[x].uploader}\n`
                        ini_txt += `Link : ${anu[x].link}\n`
                        ini_txt += `Thumbnail : ${anu[x].thumbnail}\n\n`
                    }
                    reply(ini_txt)
                    break
                case 'xnxx':
                    if (args.length == 0) return reply(`Usage: ${prefix + command} query\nExample: ${prefix + command} https://www.xnxx.com/video-uy5a73b/mom_is_horny_-_brooklyn`)
                    query = args.join(" ")
                    anu = await fetchJson(`http://api.lolhuman.xyz/api/xnxx?apikey=${apikey}&url=${query}`)
                    anu = anu.result
                    ini_txt = `Title : ${anu.title}\n`
                    ini_txt += `Duration : ${anu.duration}\n`
                    ini_txt += `View : ${anu.view}\n`
                    ini_txt += `Rating : ${anu.rating}\n`
                    ini_txt += `Like : ${anu.like}\n`
                    ini_txt += `Dislike : ${anu.dislike}\n`
                    ini_txt += `Comment : ${anu.comment}\n`
                    ini_txt += `Tag : ${anu.tag.join(", ")}\n`
                    ini_txt += `Description : ${anu.description}\n`
                    ini_txt += "Link : \n"
                    link = anu.link
                    for (var x in link) {
                        ini_txt += `${link[x].type} - ${link[x].link}\n\n`
                    }
                    thumbnail = await getBuffer(anu.thumbnail)
                    yuu.sendMessage(from, thumbnail, image, { quoted: rei, caption: ini_txt })
                    break
                case 'lk21':
                    if (args.length == 0) return reply(`Usage: ${prefix + command} query\nExample: ${prefix + command} Transformer`)
                    query = args.join(" ")
                    anu = await fetchJson(`http://api.lolhuman.xyz/api/lk21?apikey=${apikey}&query=${query}`)
                    anu = anu.result
                    ini_txt = `Title : ${anu.title}\n`
                    ini_txt += `Link : ${anu.link}\n`
                    ini_txt += `Genre : ${anu.genre}\n`
                    ini_txt += `Views : ${anu.views}\n`
                    ini_txt += `Duration : ${anu.duration}\n`
                    ini_txt += `Tahun : ${anu.tahun}\n`
                    ini_txt += `Rating : ${anu.rating}\n`
                    ini_txt += `Desc : ${anu.desc}\n`
                    ini_txt += `Actors : ${anu.actors.join(", ")}\n`
                    ini_txt += `Location : ${anu.location}\n`
                    ini_txt += `Date Release : ${anu.date_release}\n`
                    ini_txt += `Language : ${anu.language}\n`
                    ini_txt += `Link Download : ${anu.link_dl}`
                    thumbnail = await getBuffer(anu.thumbnail)
                    yuu.sendMessage(from, thumbnail, image, { quoted: rei, caption: ini_txt })
                    break
                case 'drakorongoing':
                    anu = await fetchJson(`http://api.lolhuman.xyz/api/drakorongoing?apikey=${apikey}`)
                    anu = anu.result
                    ini_txt = "Ongoing Drakor\n\n"
                    for (var x in anu) {
                        ini_txt += `Title : ${anu[x].title}\n`
                        ini_txt += `Link : ${anu[x].link}\n`
                        ini_txt += `Thumbnail : ${anu[x].thumbnail}\n`
                        ini_txt += `Year : ${anu[x].category}\n`
                        ini_txt += `Total_episode : ${anu[x].total_episode}\n`
                        ini_txt += `Genre : ${anu[x].genre.join(", ")}\n\n`
                    }
                    reply(ini_txt)
                    break
                case 'triggered':
                    urlnya = args[0]
                    ranp = getRandom('.gif')
                    rano = getRandom('.webp')
                    ini_buffer = `http://api.lolhuman.xyz/api/editor/triggered?apikey=${apikey}&img=${urlnya}`
                    exec(`wget "${ini_buffer}" -O ${ranp} && ffmpeg -i ${ranp} -vcodec libwebp -filter:v fps=fps=15 -lossless 1 -loop 0 -preset default -an -vsync 0 -s 512:512 ${rano}`, (err) => {
                        fs.unlinkSync(ranp)
                        buff = fs.readFileSync(rano)
                        yuu.sendMessage(from, buff, sticker, { quoted: rei })
                        fs.unlinkSync(rano)
                    })
                    break
                case 'wasted':
                    urlnya = args[0]
                    ini_buffer = await getBuffer(`http://api.lolhuman.xyz/api/editor/${wasted}?apikey=${apikey}&img=${urlnya}`)
                    yuu.sendMessage(from, ini_buffer, image, { quoted: rei })
                    break
                case 'tiktoknowm':
                    urlnya = args[0]
                    urlnya = `http://api.lolhuman.xyz/api/tiktok?apikey=${apikey}&url=${urlnya}`
                    anu = await fetchJson(urlnya)
                    ini_buffer = await getBuffer(anu.result.link)
                    yuu.sendMessage(from, ini_buffer, video, { quoted: rei })
                    break
                case 'nsfwcheck':
                    if ((isMedia && !rei.message.videoMessage || isQuotedImage) && args.length == 0) {
                        const encmedia = isQuotedImage ? JSON.parse(JSON.stringify(rei).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo : rei
                        const filePath = await yuu.downloadAndSaveMediaMessage(encmedia, filename = getRandom());
                        const form = new FormData();
                        const stats = fs.statSync(filePath);
                        const fileSizeInBytes = stats.size;
                        const fileStream = fs.createReadStream(filePath);
                        form.append('img', fileStream, { knownLength: fileSizeInBytes });
                        const options = {
                            method: 'POST',
                            credentials: 'include',
                            body: form
                        }
                        anu = await fetchJson(`http://api.lolhuman.xyz/api/nsfwcheck?apikey=${apikey}`, {...options })
                        fs.unlinkSync(filePath)
                        anu = anu.result
                        is_nsfw = "No"
                        if (Number(anu.replace("%", "")) >= 50) is_nsfw = "Yes"
                        reply(`Is NSFW? ${is_nsfw}\nNSFW Score : ${anu}`)
                    } else {
                        reply(`Kirim gambar dengan caption ${prefix + command} atau tag gambar yang sudah dikirim`)
                    }
                    break
                case 'togif':
                    if ((isMedia && !rei.message.videoMessage || isQuotedSticker)) {
                        const encmedia = isQuotedSticker ? JSON.parse(JSON.stringify(rei).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo : rei
                        filePath = await yuu.downloadAndSaveMediaMessage(encmedia, filename = getRandom());
                        file_name = getRandom(".gif")
                        ini_txt = args.join(" ").split("|")
                        request({
                            url: `http://api.lolhuman.xyz/api/convert/togif?apikey=${apikey}`,
                            method: 'POST',
                            formData: {
                                "img": fs.createReadStream(filePath),
                            },
                            encoding: "binary"
                        }, function (error, response, body) {
                            fs.unlinkSync(filePath)
                            fs.writeFileSync(file_name, body, "binary")
                                ini_buff = fs.readFileSync(file_name)
                                yuu.sendMessage(from, ini_buff, video, { quoted: rei, mimetype: "video/gif", filename: file_name.gif })
                            fs.unlinkSync(file_name)
                        });
                    } else {
                        reply(`Kirim gambar dengan caption ${prefix + command} atau tag gambar yang sudah dikirim`)
                    }
                    break
                case 'semoji':
                    if (args.length == 0) return reply(`Usage: ${prefix + command} query\nExample: ${prefix + command} 😭`)
                    emojix = args[0]
                    try {
                        emojix = encodeURI(emojix[0])
                    } catch {
                        emojix = encodeURI(emojix)
                    }
                    ini_buffer = await getBuffer(`http://api.lolhuman.xyz/api/smoji/${emojix}?apikey=${apikey}`)
                    yuu.sendMessage(from, ini_buffer, sticker, { quoted: rei })
                    break
                case 'fakedonald':
                    if (args.length == 0) return reply(`Usage: ${prefix + command} query\nExample: ${prefix + command} yuu Bot`)
                    ini_txt = args.join(" ")
                    ini_buffer = await getBuffer(`http://api.lolhuman.xyz/api/tweettrump?apikey=${apikey}&text=${ini_txt}`)
                    yuu.sendMessage(from, ini_buffer, image, { quoted: rei })
                    break
                case 'spamsms':
                    if (args.length == 0) return reply(`Usage: ${prefix + command} query\nExample: ${prefix + command} 08303030303030`)
                    nomor = args[0]
                    await fetchJson(`http://api.lolhuman.xyz/api/sms/spam1?apikey=${apikey}&nomor=${nomor}`)
                    await fetchJson(`http://api.lolhuman.xyz/api/sms/spam2?apikey=${apikey}&nomor=${nomor}`)
                    await fetchJson(`http://api.lolhuman.xyz/api/sms/spam3?apikey=${apikey}&nomor=${nomor}`)
                    await fetchJson(`http://api.lolhuman.xyz/api/sms/spam4?apikey=${apikey}&nomor=${nomor}`)
                    await fetchJson(`http://api.lolhuman.xyz/api/sms/spam5?apikey=${apikey}&nomor=${nomor}`)
                    await fetchJson(`http://api.lolhuman.xyz/api/sms/spam6?apikey=${apikey}&nomor=${nomor}`)
                    await fetchJson(`http://api.lolhuman.xyz/api/sms/spam7?apikey=${apikey}&nomor=${nomor}`)
                    await fetchJson(`http://api.lolhuman.xyz/api/sms/spam8?apikey=${apikey}&nomor=${nomor}`)
                    reply("Success")
                    break
                case 'faketoko':
                    await faketoko(teks = "Tahu Bacem", url_image = "https://i.ibb.co/JdfQ73m/photo-2021-02-05-10-13-39.jpg", title = "yuu Bot", code = "IDR", price = 1000000)
                    break
                case 'asupan':
                    anu = await fetchJson(`http://api.lolhuman.xyz/api/asupan?apikey=${apikey}`)
                    ini_buffer = await getBuffer(anu.result)
                    yuu.sendMessage(from, ini_buffer, video, { quoted: rei, mimetype: Mimetype.mp4, filename: "asupan.mp4" })
                    break
                case 'nekopoi':
                    if (args.length == 0) return reply(`Usage: ${prefix + command} query\nExample: ${prefix + command} https://nekopoi.care/isekai-harem-monogatari-episode-4-subtitle-indonesia/`)
                    urlnya = args[0]
                    anu = await fetchJson(`http://api.lolhuman.xyz/api/nekopoi?apikey=${apikey}&url=${urlnya}`)
                    anu = anu.result
                    console.log(anu)
                    ini_txt = `Title : ${anu.anime}\n`
                    ini_txt += `Porducers : ${anu.producers}\n`
                    ini_txt += `Duration : ${anu.duration}\n`
                    ini_txt += `Size : ${anu.size}\n`
                    ini_txt += `Sinopsis : ${anu.sinopsis}\n`
                    link = anu.link
                    for (var x in link) {
                        ini_txt += `\n${link[x].name}\n`
                        link_dl = link[x].link
                        for (var y in link_dl) {
                            ini_txt += `${y} - ${link_dl[y]}\n`
                        }
                    }
                    ini_buffer = await getBuffer(anu.thumb)
                    yuu.sendMessage(from, ini_buffer, image, { quoted: rei, caption: ini_txt })
                    break
                case 'nekopoisearch':
                    if (args.length == 0) return reply(`Usage: ${prefix + command} query\nExample: ${prefix + command} Isekai Harem`)
                    query = args.join(" ")
                    anu = await fetchJson(`http://api.lolhuman.xyz/api/nekopoisearch?apikey=${apikey}&query=${query}`)
                    anu = anu.result
                    ini_txt = ""
                    for (var x in anu) {
                        ini_txt += `Title : ${anu[x].title}\n`
                        ini_txt += `Link : ${anu[x].link}\n`
                        ini_txt += `Thumbnail : ${anu[x].thumbnail}\n\n`
                    }
                    reply(ini_txt)
                    break
                case 'spotify':
                    url = args[0]
                    anu = await fetchJson(`http://api.lolhuman.xyz/api/spotify?apikey=${apikey}&url=${url}`)
                    anu = anu.result
                    ini_txt = `Title : ${anu.title}\n`
                    ini_txt += `Artists : ${anu.artists}\n`
                    ini_txt += `Duration : ${anu.duration}\n`
                    ini_txt += `Popularity : ${anu.popularity}\n`
                    ini_txt += `Preview : ${anu.preview_url}\n`
                    thumbnail = await getBuffer(anu.thumbnail)
                    yuu.sendMessage(from, thumbnail, image, { quoted: rei, caption: ini_txt })
                    get_audio = await getBuffer(anu.link[3].link)
                    yuu.sendMessage(from, get_audio, audio, { mimetype: 'audio/mp4', filename: `${anu.title}.mp3`, quoted: rei })
                    break
                case 'spotifysearch':
                    query = args.join(" ")
                    anu = await fetchJson(`http://api.lolhuman.xyz/api/spotifysearch?apikey=${apikey}&query=${query}`)
                    anu = anu.result
                    ini_txt = ""
                    for (var x in anu) {
                        ini_txt += `Title : ${anu[x].title}\n`
                        ini_txt += `Artists : ${anu[x].artists}\n`
                        ini_txt += `Duration : ${anu[x].duration}\n`
                        ini_txt += `Link : ${anu[x].link}\n`
                        ini_txt += `Preview : ${anu[x].preview_url}\n\n\n`
                    }
                    reply(ini_txt)
                    break
                case 'jooxplay':
                case 'joox':
                    query = args.join(" ")
                    anu = await fetchJson(`http://api.lolhuman.xyz/api/jooxplay?apikey=${apikey}&query=${query}`)
                    anu = anu.result
                    ini_txt = `Title : ${anu.info.song}\n`
                    ini_txt += `Artists : ${anu.info.singer}\n`
                    ini_txt += `Duration : ${anu.info.duration}\n`
                    ini_txt += `Album : ${anu.info.album}\n`
                    ini_txt += `Uploaded : ${anu.info.date}\n`
                    ini_txt += `Lirik :\n ${anu.lirik}\n`
                    thumbnail = await getBuffer(anu.image)
                    yuu.sendMessage(from, thumbnail, image, { quoted: rei, caption: ini_txt })
                    get_audio = await getBuffer(anu.audio[0].link)
                    yuu.sendMessage(from, get_audio, audio, { mimetype: 'audio/mp4', filename: `${anu.info.song}.mp3`, quoted: rei })
                    break
                case 'ktpmaker':
                    if (args.length == 0) return reply(`Usage: ${prefix + command} nik|provinsi|kabupaten|nama|tempat, tanggal lahir|jenis kelamin|jalan|rt/rw|kelurahan|kecamatan|agama|status nikah|pekerjaan|warga negara|berlaku sampai|url_image\n\nExample: ${prefix + command} 456127893132123|bumipertiwi|fatamorgana|yuu Bot|mars, 99-99-9999|belum ditemukan|jl wardoyo|999/999|turese|imtuni|alhamdulillah islam|jomblo kack|mikirin dia|indo ori no kw|hari kiamat|https://i.ibb.co/Xb2pZ88/test.jpg`)
                    get_args = args.join(" ").split("|")
                    nik = get_args[0]
                    prov = get_args[1]
                    kabu = get_args[2]
                    name = get_args[3]
                    ttl = get_args[4]
                    jk = get_args[5]
                    jl = get_args[6]
                    rtrw = get_args[7]
                    lurah = get_args[8]
                    camat = get_args[9]
                    agama = get_args[10]
                    nikah = get_args[11]
                    kerja = get_args[12]
                    warga = get_args[13]
                    until = get_args[14]
                    img = get_args[15]
                    ini_buffer = await getBuffer(`http://api.lolhuman.xyz/api/ktpmaker?apikey=${apikey}&nik=${nik}&prov=${prov}&kabu=${kabu}&name=${name}&ttl=${ttl}&jk=${jk}&jl=${jl}&rtrw=${rtrw}&lurah=${lurah}&camat=${camat}&agama=${agama}&nikah=${nikah}&kerja=${kerja}&warga=${warga}&until=${until}&img=${img}`)
                    yuu.sendMessage(from, ini_buffer, image, { quoted: rei })
                    break
                case 'gimage':
                    if (args.length == 0) return reply(`Usage: ${prefix + command} query\nExample: ${prefix + command} loli kawaii`)
                    query = args.join(" ")
                    ini_buffer = await getBuffer(`http://api.lolhuman.xyz/api/gimage?apikey=${apikey}&query=${query}`)
                    yuu.sendMessage(from, ini_buffer, image, { quoted: rei })
                    break
                case 'gimage2':
                    if (args.length == 0) return reply(`Usage: ${prefix + command} query\nExample: ${prefix + command} loli kawaii`)
                    query = args.join(" ")
                    anu = await fetchJson(`http://api.lolhuman.xyz/api/gimage2?apikey=${apikey}&query=${query}`)
                    anu = anu.result
                    for (var x = 0; x <= 5; x++) {
                        var ini_buffer = await getBuffer(anu[x])
                        yuu.sendMessage(from, ini_buffer, image)
                    }
                    break
                case 'attp':
                    //if (!isRegistered) return reply(pesan.unregist)
                    if (args.length == 0) return reply('Textnya mana pak?')
                    query = args.join(" ")
                    const emoji = body.slice(5)
                    const attp = await getBuffer(`https://api.xteam.xyz/attp?file&text=${encodeURIComponent(query)}`)
                    yuu.sendMessage(from, attp, sticker, { quoted: rei })
                    break
                case 'emoji':
                    //if (!isRegistered) return reply(pesan.unregist)
                    if (args.length == 0) return reply('Emotnya mana pak?')
                    query = args.join(" ")
                    const emojii = body.slice(6)
                    const emojiz = await getBuffer(`https://lolhuman.herokuapp.com/api/smoji/${encodeURIComponent(query)}?apikey=${apikey}`)
                    yuu.sendMessage(from, emojiz, sticker, { quoted: rei })
                    break
                case 'test':
                    buff = fs.readFileSync("9946.webp")
                    yuu.sendMessage(from, buff, sticker, { quoted: rei })
                    break
                    // Random Image //
                case 'art':
                case 'bts':
                case 'exo':
                case 'elf':
                case 'loli':
                case 'neko':
                case 'waifu':
                case 'shota':
                case 'husbu':
                case 'sagiri':
                case 'shinobu':
                case 'megumin':
                case 'wallnime':
                    ini_buffer = await getBuffer(`http://api.lolhuman.xyz/api/random/${command}?apikey=${apikey}`)
                    yuu.sendMessage(from, ini_buffer, image, { quoted: rei })
                    break
                case 'chiisaihentai':
                case 'trap':
                case 'blowjob':
                case 'yaoi':
                case 'ecchi':
                case 'hentai':
                case 'ahegao':
                case 'hololewd':
                case 'sideoppai':
                case 'animefeets':
                case 'animebooty':
                case 'animethighss':
                case 'hentaiparadise':
                case 'animearmpits':
                case 'hentaifemdom':
                case 'lewdanimegirls':
                case 'biganimetiddies':
                case 'animebellybutton':
                case 'hentai4everyone':
                    if (isGroup && !isNsfw) return reply(pesan.nonsfw)
                    ini_buffer = await getBuffer(`http://api.lolhuman.xyz/api/random/nsfw/${command}?apikey=${apikey}`)
                    yuu.sendMessage(from, ini_buffer, image, { quoted: rei })
                    break
                case 'bj':
                case 'ero':
                case 'cum':
                case 'feet':
                case 'yuri':
                case 'trap':
                case 'lewd':
                case 'feed':
                case 'eron':
                case 'solo':
                case 'gasm':
                case 'poke':
                case 'anal':
                case 'holo':
                case 'tits':
                case 'kuni':
                case 'kiss':
                case 'erok':
                case 'smug':
                case 'baka':
                case 'solog':
                case 'feetg':
                case 'lewdk':
                case 'waifu':
                case 'pussy':
                case 'femdom':
                case 'cuddle':
                case 'hentai':
                case 'eroyuri':
                case 'cum_jpg':
                case 'blowjob':
                case 'erofeet':
                case 'holoero':
                case 'classic':
                case 'erokemo':
                case 'fox_girl':
                case 'futanari':
                case 'lewdkemo':
                case 'wallpaper':
                case 'pussy_jpg':
                case 'kemonomimi':
                case 'nsfw_avatar':
                    ini_buffer = await getBuffer(`http://api.lolhuman.xyz/api/random2/${command}?apikey=${apikey}`)
                    yuu.sendMessage(from, ini_buffer, image, { quoted: rei })
                    break
                case 'ngif':
                case 'nsfw_neko_gif':
                case 'random_hentai_gif':
                    ranp = getRandom('.gif')
                    rano = getRandom('.webp')
                    ini_buffer = `http://api.lolhuman.xyz/api/random2/${command}?apikey=${apikey}`
                    exec(`wget ${ini_buffer} -O ${ranp} && ffmpeg -i ${ranp} -vcodec libwebp -filter:v fps=fps=15 -lossless 1 -loop 0 -preset default -an -vsync 0 -s 512:512 ${rano}`, (err) => {
                        fs.unlinkSync(ranp)
                        buff = fs.readFileSync(rano)
                        yuu.sendMessage(from, buff, sticker, { quoted: rei })
                        fs.unlinkSync(rano)
                    })
                    break

                    // Textprome //
                case 'blackpink':
                case 'neon':
                case 'greenneon':
                case 'advanceglow':
                case 'futureneon':
                case 'sandwriting':
                case 'sandsummer':
                case 'sandengraved':
                case 'metaldark':
                case 'neonlight':
                case 'holographic':
                case 'text1917':
                case 'minion':
                case 'deluxesilver':
                case 'newyearcard':
                case 'bloodfrosted':
                case 'halloween':
                case 'jokerlogo':
                case 'fireworksparkle':
                case 'natureleaves':
                case 'bokeh':
                case 'toxic':
                case 'strawberry':
                case 'box3d':
                case 'roadwarning':
                case 'breakwall':
                case 'icecold':
                case 'luxury':
                case 'cloud':
                case 'summersand':
                case 'horrorblood':
                case 'thunder':
                    if (args.length == 0) return reply(`Usage: ${prefix + command} text\nExample: ${prefix + command} yuu Bot`)
                    ini_txt = args.join(" ")
                    ini_buffer = await getBuffer(`http://api.lolhuman.xyz/api/textprome/${command}?apikey=${apikey}&text=${ini_txt}`)
                    yuu.sendMessage(from, ini_buffer, image, { quoted: rei })
                    break
                case 'pornhub':
                case 'glitch':
                case 'avenger':
                case 'space':
                case 'ninjalogo':
                case 'marvelstudio':
                case 'lionlogo':
                case 'wolflogo':
                case 'steel3d':
                case 'wallgravity':
                    if (args.length == 0) return reply(`Usage: ${prefix + command} text\nExample: ${prefix + command} yuu Bot`)
                    txt1 = args[0]
                    txt2 = args[1]
                    ini_buffer = await getBuffer(`http://api.lolhuman.xyz/api/textprome2/${command}?apikey=${apikey}&text1=${txt1}&text2=${txt2}`)
                    yuu.sendMessage(from, ini_buffer, image, { quoted: rei })
                    break

                    // Photo Oxy //
                case 'shadow':
                case 'cup':
                case 'cup1':
                case 'romance':
                case 'smoke':
                case 'burnpaper':
                case 'lovemessage':
                case 'undergrass':
                case 'love':
                case 'coffe':
                case 'woodheart':
                case 'woodenboard':
                case 'summer3d':
                case 'wolfmetal':
                case 'nature3d':
                case 'underwater':
                case 'golderrose':
                case 'summernature':
                case 'letterleaves':
                case 'glowingneon':
                case 'fallleaves':
                case 'flamming':
                case 'harrypotter':
                case 'carvedwood':
                    if (args.length == 0) return reply(`Usage: ${prefix + command} text\nExample: ${prefix + command} yuu Bot`)
                    ini_txt = args.join(" ")
                    ini_buffer = await getBuffer(`http://api.lolhuman.xyz/api/photooxy1/${command}?apikey=${apikey}&text=${ini_txt}`)
                    yuu.sendMessage(from, ini_buffer, image, { quoted: rei })
                    break
                case 'tiktok':
                case 'arcade8bit':
                case 'battlefield4':
                case 'pubg':
                    if (args.length == 0) return reply(`Usage: ${prefix + command} text\nExample: ${prefix + command} yuu Bot`)
                    txt1 = args[0]
                    txt2 = args[1]
                    ini_buffer = await getBuffer(`http://api.lolhuman.xyz/api/photooxy2/${command}?apikey=${apikey}&text1=${txt1}&text2=${txt2}`)
                    yuu.sendMessage(from, ini_buffer, image, { quoted: rei })
                    break

                    // Ephoto 360 //
                case 'wetglass':
                case 'multicolor3d':
                case 'watercolor':
                case 'luxurygold':
                case 'galaxywallpaper':
                case 'lighttext':
                case 'beautifulflower':
                case 'puppycute':
                case 'royaltext':
                case 'heartshaped':
                case 'birthdaycake':
                case 'galaxystyle':
                case 'hologram3d':
                case 'greenneon':
                case 'glossychrome':
                case 'greenbush':
                case 'metallogo':
                case 'noeltext':
                case 'glittergold':
                case 'textcake':
                case 'starsnight':
                case 'wooden3d':
                case 'textbyname':
                case 'writegalacy':
                case 'galaxybat':
                case 'snow3d':
                case 'birthdayday':
                case 'goldplaybutton':
                case 'silverplaybutton':
                case 'freefire':
                    if (args.length == 0) return reply(`Usage: ${prefix + command} text\nExample: ${prefix + command} yuu Bot`)
                    ini_txt = args.join(" ")
                    ini_buffer = await getBuffer(`http://api.lolhuman.xyz/api/ephoto1/${command}?apikey=${apikey}&text=${ini_txt}`)
                    yuu.sendMessage(from, ini_buffer, image, { quoted: rei })
                    break
                default:
                    if (isCmd) {
                        reply(`Sorry pak, command *${prefix}${command}* gak ada di list *${prefix}menu*`)
                    }
                    /*if (!isGroup && !isCmd) {
                        await yuu.updatePresence(from, Presence.composing)
                        simi = await fetchJson(`http://api.lolhuman.xyz/api/simi?apikey=${apikey}&text=${budy}`)
                        reply(simi.result)
                    }*/
            }
        } catch (e) {
            e = String(e)
            if (!e.includes("this.isZero")) {
                const time_error = moment.tz('Asia/Jakarta').format('HH:mm:ss')
                console.log(color(time_error, "white"), color("[  ERROR  ]", "aqua"), color(e, 'red'))
            }
        }
    })
}
starts()