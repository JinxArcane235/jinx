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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchSolanaPrice = fetchSolanaPrice;
const axios_1 = __importDefault(require("axios"));
// Fetch Solana price
function fetchSolanaPrice() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
            return response.data.solana.usd;
        }
        catch (error) {
            console.error("Error fetching Solana price:", error);
            return null;
        }
    });
}
