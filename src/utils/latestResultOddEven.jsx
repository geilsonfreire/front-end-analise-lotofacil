// 
export const calculateOddEven = (dezenas) => {
    if (!dezenas || dezenas.length === 0) return { even: 0, odd: 0 };

    const result = dezenas.reduce(
        (acc, dezena) => {
            if (parseInt(dezena, 10) % 2 === 0) {
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