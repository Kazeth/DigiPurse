import Principal "mo:base/Principal";
import Blob "mo:base/Blob";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Nat8 "mo:base/Nat8";
import Nat64 "mo:base/Nat64";
import Error "mo:base/Error";
import Result "mo:base/Result";
import Types "./types";

// Management canister interface for cycle operations
type ManagementCanister = actor {
    deposit_cycles : shared { canister_id : Principal } -> async ();
};

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
    public shared ({caller}) func topUpCanister(targetCanisterId: Principal, icpAmount: Nat) : async Result.Result<Text, Text> {
        // The ICMC principal (aaaaa-aa is the management canister ID)
        let icmc_principal : Principal = Principal.fromText("aaaaa-aa");
        // The ICP ledger canister ID (replace with the actual ICP ledger canister ID for your network)
        let icp_ledger_canister_id : Text = "ryjl3-tyaaa-aaaaa-aaaba-cai"; // Mainnet ICP ledger canister ID

        try {
            // Step 1: Transfer ICP to the ICMC subaccount for the target canister
            let ledger_canister : ICRC1_Ledger = actor(icp_ledger_canister_id);
            
            // Generate subaccount blob for the target canister (ICMC uses the canister ID as subaccount)
            let subaccount_blob : [Nat8] = Blob.toArray(Principal.toBlob(targetCanisterId));
            
            let transfer_args = {
                to = { owner = icmc_principal; subaccount = ?subaccount_blob };
                amount = icpAmount; // Amount in e8s (1 ICP = 10^8 e8s)
                fee = ?10_000; // Standard ICP transfer fee (10,000 e8s)
                memo = null;
                from_subaccount = null;
                created_at_time = null;
            };

            let transfer_result = await ledger_canister.icrc1_transfer(transfer_args);
            switch (transfer_result) {
                case (#ok(block_index)) {
                    // Step 2: Notify ICMC to convert ICP to cycles and deposit to target canister
                    // Original line:
                    let management_canister : ManagementCanister = actor(Principal.toText(icmc_principal));
                    // Workaround if error persists:
                    // let management_canister = actor(Principal.toText(icmc_principal)) : actor {
                    //     deposit_cycles : shared { canister_id : Principal } -> async ();
                    // };
                    await management_canister.deposit_cycles({ canister_id = targetCanisterId });
                    return #ok("Successfully topped up canister with cycles");
                };
                case (#err(error)) {
                    return #err("ICP transfer failed: " # error);
                };
            };
        } catch (e) {
            return #err("Top-up failed: " # Error.message(e));
        };
    };
};