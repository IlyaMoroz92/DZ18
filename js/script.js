const today = dayjs().format('YYYY-MM-DD');

const input1 = document.querySelector('.input1')
const input2 = document.querySelector('.input2')
const select = document.querySelector('select')

const week = document.querySelector('.week')
const month = document.querySelector('.month')
const quarter = document.querySelector('.quarter')
const year = document.querySelector('.year')

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
    const before = dayjs().add(n, m).format('YYYY-MM-DD')
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
    const el = result.filter((el) => {
        return el.Cur_ID == select.value
    })[0];
    input1.min = el.Cur_DateStart.slice(0,10)
    input1.max = el.Cur_DateEnd.slice(0,10)
    input2.min = el.Cur_DateStart.slice(0,10)
    input2.max = el.Cur_DateEnd.slice(0,10)
    count = el.Cur_QuotName
    worker2(el.Cur_ID, el.Cur_DateStart, el.Cur_DateEnd)
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
    const rateArr = {data}.data;
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
    const tr = document.querySelectorAll('td');
    tr.forEach( e => e.remove('tr'))
}