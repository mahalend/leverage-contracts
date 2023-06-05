import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";

export const formatToBN = (
    value: number | string,
    decimals?: number
): BigNumber => {
    try {
        const [beforeDecimals, afterDecimal] = `${value}`.split(".");

        const beforeDecimalsPrecisionText = beforeDecimals?.slice(0, 18) || "0";
        const afterDecimalsPrecisionText = afterDecimal?.slice(0, decimals) || "0";
        const fixedPrecisionValue = `${beforeDecimalsPrecisionText}.${afterDecimalsPrecisionText}`;

        return BigNumber.from(parseUnits(`${fixedPrecisionValue}`, decimals));
    } catch (error) {
        return BigNumber.from("0");
    }
};