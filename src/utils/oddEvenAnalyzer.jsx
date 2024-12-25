// Função para calcular pares e ímpares de uma lista de dezenas
export const calculateOddEven = (numbers) => {
    if (!numbers || numbers.length === 0) return { even: 0, odd: 0 };

    const result = numbers.reduce(
        (acc, number) => {
            if (parseInt(number, 10) % 2 === 0) {
                acc.even += 1; // Incrementa pares
            } else {
                acc.odd += 1; // Incrementa ímpares
            }
            return acc;
        },
        { even: 0, odd: 0 } // Inicializa o acumulador
    );

    return result;
};

// Função para gerar a contagem acumulada de pares e ímpares por configuração
export const generateOddEvenCounts = (results) => {
    const configurationCounts = {
        "8 Par - 7 Ímpar": 0,
        "7 Par - 8 Ímpar": 0,
        "6 Par - 9 Ímpar": 0,
        "9 Par - 6 Ímpar": 0,
        "5 Par - 10 Ímpar": 0,
        "10 Par - 5 Ímpar": 0,
        "4 Par - 11 Ímpar": 0,
        "11 Par - 4 Ímpar": 0,
        "3 Par - 12 Ímpar": 0,
        "12 Par - 3 Ímpar": 0,
        "2 Par - 13 Ímpar": 0,
        "13 Par - 2 Ímpar": 0,
        "1 Par - 14 Ímpar": 0,
        "14 Par - 1 Ímpar": 0,
    };

    results.forEach(({ dezenas }) => {
        const { even, odd } = calculateOddEven(dezenas); // Usa a função centralizada
        const key = `${even} Par - ${odd} Ímpar`;

        if (configurationCounts[key] !== undefined) {
            configurationCounts[key]++;
        }
    });

    return configurationCounts;
};