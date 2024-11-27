"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const priceFetcher_1 = require("./priceFetcher");
const rsiCalculator_1 = require("./rsiCalculator");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // Fetch the current Solana price
        const solanaPrice = yield (0, priceFetcher_1.fetchSolanaPrice)();
        console.log("Current Solana Price:", solanaPrice);
        // Simulate fetching historical data (you would replace this with actual data)
        const historicalPrices = [100, 102, 104, 103, 101, 100, 102, 104, 106, 108, 107, 106, 105, 104, 103];
        // Calculate RSI based on historical prices
        const rsiValue = (0, rsiCalculator_1.calculateRSI)(historicalPrices);
        console.log("RSI Value:", rsiValue);
    });
}
// Run the main function
main();
