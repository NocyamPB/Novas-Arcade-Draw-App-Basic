

async function raffle(containerId) {
    let result
    const { awards } = data.containers
        .filter(container => container.id === containerId)[0]

    let { total } = awards

    if (awards.guaranteed.count) {
        const { category, count } = awards.guaranteed
        const itens = data.itens.filter(item => item.category === category)
        const numbers = await getRandomNumbers(count, 0, itens.length - 1)

        total -= count
        result = numbers.map(index => itens[index].name)
    }

    if (total) {
        const reducer = (accumulator, currentValue) => accumulator + currentValue.count;
        const countItens = awards.random.reduce(reducer, 0)
        const numbers = await getRandomNumbers(countItens, 1, 100)

        awards.random.forEach(element => {
            element.factors = element.factors.sort((a, b) => {
                if (a.opportunity_factor > b.opportunity_factor) {
                    return 1;
                }
                if (a.opportunity_factor < b.opportunity_factor) {
                    return -1;
                }
                return 0;
            });


            for (let min = 1, max = 0, i = 0; i < element.count; i++) {
                const lastNumber = numbers.pop()
                element.factors.forEach(element2 => {
                    max += element2.opportunity_factor * 100

                    if (lastNumber <= max && lastNumber >= min) {
                        const categoryItens = data.itens
                            .filter(item => item.category === element2.name)
                        result.push(categoryItens[lastNumber % categoryItens.length].name)
                    }

                    min = max + 1
                });
                max = 0
                min = 1
            }
        });
    }


    return result
}

async function getRandomNumbers(count, min, max) {
    const dataBody = {
        jsonrpc: '2.0',
        id: 1,
        method: 'generateIntegers',
        params: {
            apiKey: '9733aad0-693b-4492-998d-3116c43f29a1',
            n: count,
            min,
            max
        }
    }

    const response = await fetch('https://api.random.org/json-rpc/2/invoke', {
        method: 'POST',
        mode: 'cors',
        headers: new Headers({
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify(dataBody)
    })
    return (await response.json()).result.random.data
}

function printItens(id) {
    const container = document.getElementById('box')
    container.innerHTML = '<p>Itens:</p><br><p>Aguarde!</p>'
    raffle(id)
    .then(itens => {
        container.innerHTML = '<p>Itens:</p><br>'
        itens.forEach(item => {
            container.innerHTML += `<p>${item}</p>`
        })
    })
}
