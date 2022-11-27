export const sleep = async (time) =>
    new Promise((resolve) => setTimeout(resolve, time));

export const genHexString = (len) => {
    let output = '';
    for (let i = 0; i < len; ++i) {
        output += (Math.floor(Math.random() * 16)).toString(16);
    }
    return output;
}

export const PRE_GENERATED_IDS = [
    "93da2114",
    "f0941c0a",
    "9e6c9620",
    "9df04d58",
    "3fcff1e4",
    "d339ab87",
    "dd32c47a",
    "7766f11e",
    "fc416934",
    "d5ab0c41",
    "750a44c7",
    "cccf136c",
    "ccbe84bf",
    "21f64fee",
    "ae4333ca",
    "4895f149",
    "17bbd775",
    "a68e455b",
    "0c079590",
    "281e4aec",
    "dc566603",
    "2a6ce852",
    "dee1b110",
    "a8def1a5",
    "41710922",
    "fe5f5e4b",
    "cf1fe596",
    "52efc99e",
    "709bb51e",
    "09ed9df1",
    "826defe8",
    "184e89ff",
    "951cec15",
    "06a0c409",
    "e8985884",
    "e7dd734f",
    "ea1d7c6a",
    "0b4cdc3d",
    "fa920441",
    "abf09fb0"
]
