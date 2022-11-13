export const sleep = async (time) =>
    new Promise((resolve) => setTimeout(resolve, time));

export const genHexString = (len) => {
    let output = '';
    for (let i = 0; i < len; ++i) {
        output += (Math.floor(Math.random() * 16)).toString(16);
    }
    return output;
}
