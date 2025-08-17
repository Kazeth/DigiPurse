import Time "mo:base/Time";
import Principal "mo:base/Principal";

persistent actor class TransactionActor() {
  public type Transaction = {
    txId: Nat;
    ticketId: Nat;
    buyer: Principal;
    seller: Principal;
    method: Text;
    paymentSource: Text;
    price: Nat;
    timestamp: Time.Time;
  };

  public func createTransaction(txId: Nat, ticketId: Nat, buyer: Principal, seller: Principal, method: Text, source: Text, price: Nat): async Transaction {
    {
      txId = txId;
      ticketId = ticketId;
      buyer = buyer;
      seller = seller;
      method = method;
      paymentSource = source;
      price = price;
      timestamp = Time.now();
    }
  };
};