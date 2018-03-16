export class Order {
    MemberRef: string;
    OrderRef: string;
    Type: string;
    OrderSymbol: string;
    Price: number;
    PriceNow: number;
    Size: number;
    Balance: number;
    Equity: number;
    Margin: number;
    FreeMargin: number;
    Commission: number;
    Swap: number;
    Profit: number;
    SL: number;
    TP: number;
    Status: string;
    Time: string;
    CloseDate: string;
  }
  export class OrderTotalHistory {
    TotalText: string;
    ProfitLoss: number;
    Credit: number;
    Deposit: number;
    Withdrawal: number;
    Balance: number;
    BalanceText: string;
  }
  export class OrderTotal {
    TotalText: string;
    ProfitText: string;
    Profit: number;
    Balance: number;
    Equity: number;
    Margin: number;
    FreeMargin: number;
    MarginLevle: number;
  }