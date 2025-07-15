import Time "mo:base/Time";

module {
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

  public func createTransaction(txId: Nat, ticketId: Nat, buyer: Principal, seller: Principal, method: Text, source: Text, price: Nat): Transaction {
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
}
