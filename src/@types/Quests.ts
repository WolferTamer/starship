interface Objective {
    name: string,
    type: string,
    amount: number
    weapon?: string,
    item?: string,
    place?: string,
    grade?: number,
    pet?: number
}

interface Quest {
    title: string,
    objectives: Objective[],
    reward: { [key: string]: number }
}

export {Quest,Objective}