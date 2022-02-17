const today = dayjs().format('YYYY-MM-DD');

const input1 = document.querySelector('.input1')
const input2 = document.querySelector('.input2')
const select = document.querySelector('select')

let week = document.querySelector('.week')
let month = document.querySelector('.month')
let quarter = document.querySelector('.quarter')
let year = document.querySelector('.year')

week.addEventListener('click', () => period(-1, `week`))
month.addEventListener('click', () => period(-1, `month`))
quarter.addEventListener('click', () => period(-3, `month`))
year.addEventListener('click', () => period(-1, `year`))
select.addEventListener('change', deleteTr)

input1.addEventListener('change', input)
input2.addEventListener('change', input)


function input() {
    if(input1.value&&input2.value) {
        worker2(select.value, input1.value, input2.value)
    }
}

function period(n, m) {
    let before = dayjs().add(n, m).format('YYYY-MM-DD')
    worker2(select.value, before, today)
}

const worker = new Worker('/js/worker.js')

const mapping = {
    currentRate: (payload) => {
        result = payload.map(
            ({
                Cur_ID,
                Cur_Name,
                Cur_DateStart,
                Cur_DateEnd,
                Cur_QuotName
            }) => {
                return {
                    Cur_ID,
                    Cur_Name,
                    Cur_DateStart,
                    Cur_DateEnd,
                    Cur_QuotName
                };
            });
        result.forEach(el => {
            if(parseInt(el.Cur_DateEnd) > today.slice(0,4)){
        let option = document.createElement('option')
        option.innerText = el.Cur_Name;
        option.value = el.Cur_ID;
        select.append(option);}
        })
        select.addEventListener('change', () => {
            deleteTr()
            getCur(result);
        })
    }
}

function getCur(result) {
    deleteTr()
    let firstCur = result.filter((el) => {
        return el.Cur_ID == select.value
    })[0];
    input1.min = firstCur.Cur_DateStart.slice(0,10)
    input1.max = firstCur.Cur_DateEnd.slice(0,10)
    input2.min = firstCur.Cur_DateStart.slice(0,10)
    input2.max = firstCur.Cur_DateEnd.slice(0,10)
    count = firstCur.Cur_QuotName
    worker2(firstCur.Cur_ID, firstCur.Cur_DateStart, firstCur.Cur_DateEnd)
}


worker.addEventListener('message', ({data}) => {
    mapping[data.msg](data.payload);
});

function worker2(idCur, start, end) {
deleteTr()
const worker2 = new Worker('/js/worker2.js')
worker2.postMessage({
    id: idCur,
    dataStart: start,
    dataEnd: end
});
worker2.addEventListener('message', ({data}) => {
    let rateArr = {data}.data;
    rateArr.forEach((json) => {
        createTr(`${json.Date.slice(0,10)}`, ` ${count} ` + ` ${json.Cur_OfficialRate} ` + `BYN`)
        })
    })
}

function createTr (el1, el2) {
    const div = document.querySelector('.tb');
    const table = document.createElement('table');
    const tr = document.createElement('tr');
    const td1 = document.createElement('td');
    const td2 = document.createElement('td');
    td1.innerText = el1;
    td2.innerText = el2;
    tr.appendChild(td1);
    tr.appendChild(td2);
    table.appendChild(tr);
    div.appendChild(table);
}

function deleteTr() {
    let tr = document.querySelectorAll('td');
    tr.forEach( e => e.remove('tr'))
}