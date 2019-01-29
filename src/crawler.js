const cheerio = require('cheerio');
const request = require('request-promise')
const fs = require('fs')

let spells = [];
const URLS = [];

console.log('\t\t\x1b[34m%s\x1b[0m','+---------------------------+');
console.log('\t\t\x1b[35m%s\x1b[0m','| Welcome to PROLOCRAWL 3.0 |');
console.log('\t\t\x1b[34m%s\x1b[0m','+---------------------------+\n');
crawl_all();


async function crawl_all(){
    console.log('\n\x1b[5m%s\x1b[0m', 'Starting to scrap the spells...');

    for(let id=1; id<=1975; id++) {
        let url = `http://www.dxcontent.com/SDB_SpellBlock.asp?SDBID=${id}`;
        await proceedRequest(url,id);
    }

    console.log('\n\x1b[32m%s\x1b[0m', 'Success !');
    console.log('\n\x1b[5m%s\x1b[0m', `Writing ${spells.length} spells to spells/spells.json...`);
    if(!fs.existsSync('../spells')){
        fs.mkdirSync('../spells');
    }

    await fs.writeFile('../spells/spells.json', JSON.stringify(spells), function(err) {
        if (err) {
            console.log('\n\x1b[31m%s\x1b[0m', err);
        } else {
            console.log('\n\x1b[32m%s\x1b[0m', 'Done ! HF with spark !');
        }
    });
    
}

// console.log('\x1b[5m%s\x1b[0m','Mapping all the urls...');

// for(let id=1; id<100; id++) {
//     let url = `http://www.dxcontent.com/SDB_SpellBlock.asp?SDBID=${id}`;
//     URLS.push(url)
// }


// let promises = URLS.map(url => proceedRequest(url));

// console.log('\n\x1b[5m%s\x1b[0m', 'Starting to scrap the spells...');

// Promise.all(promises).then(function(data){
//     console.log('\n\x1b[32m%s\x1b[0m', 'Success !');
//     console.log('\n\x1b[5m%s\x1b[0m', 'Writing spells to spells/spells.json...');
//     if(!fs.existsSync('../spells')){
//         fs.mkdirSync('../spells');
//     }
//     fs.writeFileSync('../spells/spells.json', JSON.stringify(spells));
//     console.log('\n\x1b[32m%s\x1b[0m', 'Done ! HF with spark !');
// }, function(error){
//     console.log('\n\x1b[31m%s\x1b[0m', error);
// });

async function proceedRequest(url,i) {
    return request(url).then(function(html){
        return new Promise(function (resolve,reject) {
            let $ = cheerio.load(html);
            if($('.SpellDiv .heading').text() === "") {
                console.log('\n\x1b[33m%s\x1b[0m', `INFO SGBD ${i}: Empty URL ` + url);
                resolve();
            }

            let spell = {
                name: $('.SpellDiv .heading').children()['0'].children[0].data,
                is_wizard: is_wizard_spell($('.SpellDiv .SPDet').children()['1'].next.data),
                level: parseInt(get_level($('.SpellDiv .SPDet').children()['1'].next.data)),
                resistance: get_resistance($('.SpellDiv .SPDet').text()),
                components: get_components($('.SpellDiv .SPDet').children()['3'].next.data),
                description: $('.SPDesc').text()
            }
            let color = (i % 2 == 0) ? '\n\x1b[94m%s\x1b[0m' : '\n\x1b[1m%s\x1b[0m';
            console.log(color, `Name: ${(spell.name+" ".repeat(30)).substr(0, 30)} | Wizard: ${(spell.is_wizard+" ".repeat(10)).substr(0, 7)}| level: ${spell.level} | resistance: ${(spell.resistance+" ".repeat(10)).substr(0, 7)}| Components: ${(spell.components+" ".repeat(20)).substr(0, 10)} |`);
            resolve(spells.push(spell));
        }, function(){
            console.log('\n\x1b[31m%s\x1b[0m', "Error for url " + url);
        });
    });
    
}

function get_level(str_level) {
    const regex_wizard = /sorcerer\/wizard [0-9]/gm;
    const regex_others = /[0-9]+/gm;
    
    if(regex_wizard.test(str_level)) {
        const chunk = str_level.match(regex_wizard)[0]; 
        return chunk[chunk.length - 1];
    } else {
        return Math.min.apply(null, str_level.match(regex_others));
    }
}

function get_resistance(str_res) {
    const regex_spell = /Spell Resistance yes/gm;
    return regex_spell.test(str_res) ? true : false;
}

function is_wizard_spell(str_spell){
    return /sorcerer\/wizard/.test(str_spell);
}

function get_components(str_compo) {
    const regex_compo = /([A-Z]+\/[A-Z]+|[A-Z]+)/;
    let raw_components = str_compo.split(',');
    let components = [];
    raw_components.forEach(function(item){
        let matchs = item.match(regex_compo);
        if(matchs !== null){
            components.push(matchs[0]);
        }
    });
    return components;
}
