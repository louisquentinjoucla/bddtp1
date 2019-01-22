const cheerio = require('cheerio');
const request = require('request-promise')
const fs = require('fs')

let spells = [];
const URLS = [];

console.log('\x1b[34m%s\x1b[0m','+---------------------------+');
console.log('\x1b[35m%s\x1b[0m','| Welcome to PROLOCRAWL 3.0 |');
console.log('\x1b[34m%s\x1b[0m','+---------------------------+\n');

console.log('\x1b[5m%s\x1b[0m','Mapping all the urls...');

for(let id=1; id<1500; id++) {
    let url = `http://www.dxcontent.com/SDB_SpellBlock.asp?SDBID=${id}`;
    URLS.push(url)
}
let promises = URLS.map(url => proceedRequest(url));

console.log('\n\x1b[5m%s\x1b[0m', 'Starting to scrap the spells...');

Promise.all(promises).then(function(data){
    console.log('\n\x1b[32m%s\x1b[0m', 'Success !');
    console.log('\n\x1b[5m%s\x1b[0m', 'Writing spells to spells/spells.json...');
    if(!fs.existsSync('../spells')){
        fs.mkdirSync('../spells');
    }
    fs.writeFileSync('../spells/spells.json', JSON.stringify(spells));
    console.log('\n\x1b[32m%s\x1b[0m', 'Done ! HF with spark !');
}, function(error){
    console.log('\n\x1b[31m%s\x1b[0m', error);
});

//proceedRequest('http://www.dxcontent.com/SDB_SpellBlock.asp?SDBID=49');

async function proceedRequest(url) {
    return request(url).then(function(html){
        return new Promise(function (resolve,reject) {
            let $ = cheerio.load(html);
            
            let spell = {
                name: $('.SpellDiv .heading').text(),
                is_wizard: is_wizard_spell($('.SpellDiv .SPDet').children()['1'].next.data),
                level: get_level($('.SpellDiv .SPDet').children()['1'].next.data),
                resistance: get_resistance($('.SpellDiv .SPDet').text()),
                components: get_components($('.SpellDiv .SPDet').children()['3'].next.data),
                description: $('.SPDesc').text()
            }
            resolve(spells.push(spell));
        });
    });

}

function get_level(str_level) {
    const regex_wizard = /sorcerer\/wizard [1-9]/gm;
    const regex_others = /[1-9]+/gm;
    
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
