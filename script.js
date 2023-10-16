var relics = [];
var relics_save = [];
var planars_save = [];
var trials_run = 0;

for (var i = 0; i < piece_options.length; i++) {
    var opt = piece_options[i];
    var el = document.createElement("option");
    el.textContent = opt;
    el.value = opt;
    document.getElementById("piece-names").appendChild(el);
}

function populateRelicMainStat(chosen_piece) {
    document.getElementById("main-stat-names").innerHTML = "";
    for (var i = 0; i < main_stat_options[piece_options.indexOf(chosen_piece)][0].length; i++) {
        var opt = main_stat_options[piece_options.indexOf(chosen_piece)][0][i];
        var el = document.createElement("option");
        el.textContent = opt;
        el.value = opt;
        document.getElementById("main-stat-names").appendChild(el);
    }
}

function showAdvanceMode() {
    if (document.getElementById("advanced-mode").style.display === 'none') {
        document.getElementById("advanced-mode").style.display = 'block';
    } else {
        document.getElementById("advanced-mode").style.display = 'none';
    }
}

function buildUI() {
    document.getElementById("relic_output").innerHTML = "";
    for (const element of relics) {
        const tbl = document.createElement('table');
        const title_header = tbl.insertRow();
        title_header.innerHTML = "<b>" + element.name + " of Set " + element.set + "</b>"
        const level_tr = tbl.insertRow();
        const level_td1 = level_tr.insertCell();
        const level_td2 = level_tr.insertCell();
        level_td1.innerHTML = "Level:";
        level_td2.innerHTML = element.level;
        const main_tr = tbl.insertRow();
        const main_td1 = main_tr.insertCell();
        const main_td2 = main_tr.insertCell();
        main_td1.innerHTML = element.main_stat;

        for (const substat of Object.keys(element.sub_stats)) {
            if (element.hidden != substat) {
                const tr = tbl.insertRow();
                const td1 = tr.insertCell();
                const td2 = tr.insertCell();

                td1.innerHTML = substat;
                td2.innerHTML = element.sub_stats[substat].value;
            }
        }
        const btn = document.createElement('button');
        btn.textContent = "Level Relic";
        btn.onclick = function () { levelRelics(element); }
        document.getElementById("relic_output").appendChild(btn);
        document.getElementById("relic_output").appendChild(tbl);
    }
}

function refreshUI() {
    document.getElementById("relic_results").innerHTML = JSON.stringify(relics, undefined, 2);
}

function rollRelics(equip_type) {
    relics.length = 0;
    generateRelic(false, equip_type);
    buildUI();
}

function simRelics() {
    const start = Date.now();
    const gen_relic = [...Array(sim_trials)].map((_, i) => generateRelic(true, "relic"));
    const gen_planar = [...Array(sim_trials)].map((_, i) => generateRelic(true, "planar"));
    const end = Date.now();
    console.log(`done in ${end - start} ms`);
    trials_run += sim_trials;
    document.getElementById("saved_relics").innerHTML = "You have run " + trials_run + " trials and have " + relics_save.length + " relics saved and " + planars_save.length + " planars saved.";
}

function levelRelics(element, sim) {
    if (element.level >= 15) {
        return;
    }
    if (element.hidden) {
        element.hidden = null;
    } else {
        let sub_index = Object.keys(element.sub_stats)[Math.floor(Math.random() * 4)];
        let level_increment = sub_stat_values[element.sub_stats[sub_index].index][Math.floor(Math.random() * 3)];
        element.sub_stats[sub_index].value += level_increment;
    }
    element.level += 3;
    if (!sim) {
        buildUI();
    }
}

function generateRelic(sim, equip_type) {
    let num_pieces = Math.random() < 0.108 ? 3 : 2;

    for (let i = 0; i < num_pieces; i++) {
        var item = {};
        item.set = Math.random() < .5 ? "1" : "2";
        if (sim && item.set === "2"){
            continue;
        }

        let piece = equip_type === "planar" ? getRandomInt(4, 5) : getRandomInt(0, 3);
        item.name = piece_options[piece];
        item.main_stat = wsample(main_stat_options[piece][0], main_stat_options[piece][1], 1)[1][0];
        item.sub_stats = [];
        item.level = 0;

        let main_index = main_stat_options[piece][0].indexOf(item.main_stat);
        let sub = [];
        if (Math.random() < .8) {
            first_three_sub = wsample(sub_stat_options, sub_stat_weights[piece][main_index], 3);
            fourth_weight = [...base_sub_stat_weight];
            exclude_index = [sub_stat_options.indexOf(item.main_stat)].concat(first_three_sub[0]);
            for (const index of exclude_index) {
                if (index >= 0) {
                    fourth_weight[index] = 0;
                }
            }
            fourth_sub = wsample(sub_stat_options, fourth_weight, 1);
            sub = [first_three_sub[0].concat(fourth_sub[0]), first_three_sub[1].concat(fourth_sub[1])]
            if (!sim) {
                item.hidden = sub[1][3];
            } else {
                item.level = 3;
            }
        } else {
            sub = wsample(sub_stat_options, sub_stat_weights[piece][main_index], 4);
        }

        for (let i = 0; i < sub[0].length; i++) {
            var subs = {};
            var stat = sub[1][i];
            subs.index = sub[0][i];
            subs.value = sub_stat_values[sub[0][i]][Math.floor(Math.random() * 3)];
            item.sub_stats[stat] = subs;
        }

        if (!sim) {
            relics.push(item);
        } else {
            const res = [...Array(5)].map((_, i) => levelRelics(item, sim));
            if (equip_type === "planar") {
                planars_save.push(item);
            } else {
                relics_save.push(item);
            }
        }
    }
}

function filterRelics(piece, mainstat) {
    console.log(mainstat);
    let piece_save = piece_options.indexOf(piece) > 3 ? planars_save : relics_save;
    let piece_output = []

    piece_output = piece_save.filter(relic => (relic.name == piece) && (relic.set === "1"));
    if (mainstat) {
        piece_output = piece_output.filter(relic => (relic.main_stat === mainstat));
    }
    if (document.getElementById("relic-spd-minimum").value > 0) {
        piece_output = piece_output.filter(relic => {
            return relic.sub_stats["Spd"] && relic.sub_stats["Spd"] > document.getElementById("relic-spd-minimum").value;
        });
    }
    if (document.getElementById("relic-cr-minimum").value > 0) {
        piece_output = piece_output.filter(relic => {
            return relic.sub_stats["CR"] && relic.sub_stats["CR"] > document.getElementById("relic-cr-minimum").value;
        });
    }
    console.log(piece_output);
    return piece_output;
}

function scoreRelics(relic_list, threshold) {
    effective_score = [];
    for (let i = 0; i < relic_list.length; i++) {
        let score = relic_list[i].sub_stats;
        let i_relic = [];
        i_relic.push([score["Hp"] ? score["Hp"].value : 0]);
        i_relic.push([score["Atk"] ? score["Atk"].value : 0]);
        i_relic.push([score["Def"] ? score["Def"].value : 0]);
        i_relic.push([score["Hp%"] ? score["Hp%"].value : 0]);
        i_relic.push([score["Atk%"] ? score["Atk%"].value : 0]);
        i_relic.push([score["Def%"] ? score["Def%"].value : 0]);
        i_relic.push([score["Spd"] ? score["Spd"].value : 0]);
        i_relic.push([score["CR"] ? score["CR"].value : 0]);
        i_relic.push([score["CD"] ? score["CD"].value : 0]);
        i_relic.push([score["EHR"] ? score["EHR"].value : 0]);
        i_relic.push([score["ER"] ? score["ER"].value : 0]);
        i_relic.push([score["BE"] ? score["BE"].value : 0]);
        effective_score.push(weightRelic(i_relic));
    }
    return effective_score.filter(s => s >= threshold);
}

function weightRelic(relic) {
    let weight =
        relic[0] * document.getElementById("relic-hp-flat-weight").value +
        relic[1] * document.getElementById("relic-atk-flat-weight").value +
        relic[2] * document.getElementById("relic-def-flat-weight").value +
        relic[3] * document.getElementById("relic-hp-perc-weight").value +
        relic[4] * document.getElementById("relic-atk-perc-weight").value +
        relic[5] * document.getElementById("relic-def-perc-weight").value +
        relic[6] * document.getElementById("relic-spd-weight").value +
        relic[7] * document.getElementById("relic-cr-weight").value +
        relic[8] * document.getElementById("relic-cd-weight").value +
        relic[9] * document.getElementById("relic-ehr-weight").value +
        relic[10] * document.getElementById("relic-er-weight").value +
        relic[11] * document.getElementById("relic-be-weight").value;
    return weight;
}

function estimateTBPower() {
    var relic = [];
    relic.push(document.getElementById("relic-hp-flat").value);
    relic.push(document.getElementById("relic-atk-flat").value);
    relic.push(document.getElementById("relic-def-flat").value);
    relic.push(document.getElementById("relic-hp-perc").value);
    relic.push(document.getElementById("relic-atk-perc").value);
    relic.push(document.getElementById("relic-def-perc").value);
    relic.push(document.getElementById("relic-spd").value);
    relic.push(document.getElementById("relic-cr").value);
    relic.push(document.getElementById("relic-cd").value);
    relic.push(document.getElementById("relic-ehr").value);
    relic.push(document.getElementById("relic-er").value);
    relic.push(document.getElementById("relic-be").value);
    var calculated_weight = weightRelic(relic);
    var scores = scoreRelics(filterRelics(document.getElementById("piece-names").value, document.getElementById("main-stat-names").value), calculated_weight);
    // console.log(getStandardDeviation(scoreRelics(filterRelics(document.getElementById("piece-names").value, document.getElementById("main-stat-names").value), 0)));
    document.getElementById("estimated-tb-power").innerHTML = "Average TB Power: " + Math.ceil(trials_run / scores.length * 40) + " or Days: " + Math.ceil(trials_run / scores.length * 40 / (240 + 40 * document.getElementById("daily-refreshes").value));
    document.getElementById("estimated-craft").innerHTML = "Average Crafts Required: " + Math.ceil(filterRelics(document.getElementById("piece-names").value).length / scores.length);
    document.getElementById("estimated-resin-craft").innerHTML = "Average Self Modeling Resin Crafts required: " + Math.ceil(filterRelics(document.getElementById("piece-names").value, document.getElementById("main-stat-names").value).length / scores.length);
}