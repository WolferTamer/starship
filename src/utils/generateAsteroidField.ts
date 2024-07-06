module.exports = (width: number = 10, height: number = 10) : boolean[][] => {
    let field: boolean[][] = new Array()
    for(let i = 0; i < width; i++) {
        field.push(new Array<boolean>())
        for(let j = 0; j < height; j++) {
            const rand = Math.random()
            if(rand < .15) {
                field[i].push(true)
            } else {
                field[i].push(false)
            }
        }
    }
    field[0][0] = false;
    field[width-1][height-1] = false
    return field;
}