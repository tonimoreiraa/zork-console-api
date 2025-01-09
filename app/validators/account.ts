import vine from '@vinejs/vine'

export const createAccountSchema = vine.compile(
    vine.object({
        name: vine.string(),
        cnpj: vine.string().regex(/\d{2}\.?\d{3}\.?\d{3}\/?\d{4}\-?\d{2}/)
    })
)

export const accountIdValidator = vine.number().exists((db, value) => {
    return db.query()
        .select().from('accounts').where('id', value).firstOrFail()
})

export function isValidCNPJ(cnpj: string): boolean {
    // Remove caracteres não numéricos
    cnpj = cnpj.replace(/[^\d]+/g, '');

    // Verifica se o CNPJ possui 14 dígitos
    if (cnpj.length !== 14) return false;

    // Verifica se todos os dígitos são iguais (ex.: 00000000000000)
    if (/^(\d)\1+$/.test(cnpj)) return false;

    const calculateDigit = (cnpjPartial: string, weights: number[]): number => {
        const sum = cnpjPartial
            .split('')
            .reduce((acc, digit, index) => acc + parseInt(digit, 10) * weights[index], 0);
        const remainder = sum % 11;
        return remainder < 2 ? 0 : 11 - remainder;
    };

    // Pesos para o primeiro e segundo dígito verificador
    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    // Calcula os dígitos verificadores
    const digit1 = calculateDigit(cnpj.substring(0, 12), weights1);
    const digit2 = calculateDigit(cnpj.substring(0, 12) + digit1, weights2);

    // Verifica se os dígitos calculados são iguais aos fornecidos
    return cnpj.endsWith(`${digit1}${digit2}`);
}