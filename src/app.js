const cheerio = require('cheerio');
const request = require('request')

let id = 1;
let URL=`http://www.dxcontent.com/SDB_SpellBlock.asp?SDBID=${id}`

let page;

request(URL, function (error, response, html) {
  if (!error && response.statusCode == 200) {
    page = html;

    let $ = cheerio.load(page);
    let spell = {
        name: $('.SpellDiv .heading').text(),
        is_wizard: is_wizard_spell($('.SpellDiv .SPDet').children()['1'].next.data),
        level: get_level($('.SpellDiv .SPDet').children()['1'].next.data),
        resistance: get_resistance($('.SpellDiv .SPDet').children()['8'].next.data),
        components: get_components($('.SpellDiv .SPDet').children()['3'].next.data),
        description: $('.SPDesc').text()
    }

    console.log(spell);
  }
});

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
    return str_res === ' no' ? false : true;
}

function is_wizard_spell(str_spell){
    return /sorcerer\/wizard/.test(str_spell);
}

function get_components(str_compo) {
    const regex_compo = /([A-Z]+\/[A-Z]+|[A-Z]+)/;
    let raw_components = str_compo.split(',');
    let components = [];
    raw_components.forEach(function(item){
        components.push(item.match(regex_compo)[0]);
    });
    return components;
}
