// Função para calcular o fatorial
export const factorial = (num) => {
    if (num === 0 || num === 1) return 1; // 0! e 1! = 1
    let result = 1;
    for (let i = 2; i <= num; i++) {
        result *= i;
    }
    return result;
};

// Função para calcular combinações C(n, k)
export const calculateCombinations = (n, k) => {
    return factorial(n) / (factorial(k) * factorial(n - k));
};