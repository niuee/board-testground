
export function parseParenthese(text: string): string[]{
    const stack: string[] = [];
    const res = [];
    const prev = [];
    let current = "";
    for (let i = 0; i < text.length; i++){
        const char = text[i];
        if (char === "("){
            if (current.length > 0){
                console.log("current", current);
                prev.push(current);
                current = "";
            }
            stack.push(char);
        } else if (char === ")"){
            if(stack.length === 0){
                throw new Error("Invalid parentheses");
            }
            stack.pop();
            res.push(current);
            current = "";
        } else {
            current += char;
        }
    }
    return res;
}

export function validParenthese(text: string): boolean {
    const stack: string[] = [];
    for (let i = 0; i < text.length; i++){
        const char = text[i];
        if (char === "("){
            stack.push(char);
        } else if (char === ")"){
            if (stack.length === 0){
                return false;
            }
            stack.pop();
        }
    }
    return stack.length === 0;
}

export function parseGeoCoordinate(text: string): {lat: number, longi: number}[] {
    const res: {lat: number, longi: number}[] = [];

    const pairs = text.split(",");
    pairs.forEach((pair)=>{
        const [longi, lat] = pair.split(" ");
        res.push({lat: parseFloat(lat), longi: parseFloat(longi)});
    });

    return res;
}