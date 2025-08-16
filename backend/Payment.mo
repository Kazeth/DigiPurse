import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Error "mo:base/Error";
import Result "mo:base/Result";
import Types "./types";

// Define the ICRC1_Ledger interface
type ICRC1_Ledger = actor {
    icrc1_transfer : shared (args : {
        to : { owner : Principal; subaccount : ?[Nat8] };
        fee : ?Nat;
        memo : ?[Nat8];
        from_subaccount : ?[Nat8];
        created_at_time : ?Nat64;
        amount : Nat
    }) -> async Result.Result<Nat, Text>;
    icrc1_balance_of : shared query (account : { owner : Principal; subaccount : ?[Nat8] }) -> async Nat;
};

persistent actor class PaymentManager() {
    // --- STATE ---
    stable var transaction_history : [Types.Transaction] = [];

    // --- CORE WALLET FUNCTIONS ---

    /*
    * GET USER ADDRESS
    * Returns the Principal ID of the caller
    */
    public shared query ({caller}) func getMyPrincipal() : async Principal {
        return caller;
    };

    /*
    * SEND TOKENS
    * Transfer ICRC-1 compliant tokens to another principal
    */
    public shared ({caller}) func sendTokens(
        canisterIdText: Text,
        to_principal: Principal,
        amount: Nat
    ) : async Result.Result<Nat, Text> {
        try {
            let ledger_canister : ICRC1_Ledger = actor(canisterIdText);
            let args = {
                to = { owner = to_principal; subaccount = null };
                amount = amount;
                fee = null;
                memo = null;
                from_subaccount = null;
                created_at_time = null;
            };

            let result = await ledger_canister.icrc1_transfer(args);
            return result;
        } catch (e) {
            return #err("Transfer failed: " # Error.message(e));
        };
    };

    /*
    * GET TOKEN BALANCE
    * Check the balance of a specific token for the user
    */
    public shared ({caller}) func getMyBalance(canisterIdText: Text) : async Nat {
        try {
            let ledger_canister : ICRC1_Ledger = actor(canisterIdText);
            let account = { owner = caller; subaccount = null };
            await ledger_canister.icrc1_balance_of(account);
        } catch (e) {
            throw Error.reject("Balance query failed: " # Error.message(e));
        };
    };

    /*
    * TOP UP CANISTER CYCLES
    * Placeholder for cycles top-up functionality
    */
    public shared func topUpCanister(targetCanisterId: Principal, icpAmount: Nat) : async Text {
        return "Cycles top-up functionality not yet implemented.";
    };
};