module.exports = (slot:number) => {
    switch(slot) {
        case 1: return "Defense"; 
        case 2: return "Speed"; 
        case 3: return "Attack";
        case 4: return "Health";
    }
    return "Unassigned";
}