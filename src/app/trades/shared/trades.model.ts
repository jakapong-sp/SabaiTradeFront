export class Order {
    MemberRef: string;
    OrderRef: string;
    Type: string;
    Symbol: string;
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
    CreateDate: string;
  }
  export class OrderTotalHistory {
    TotalText: string;
    ProfitLoss: number;
    Credit: number;
    Deposit: number;
    Withdrawal: number;
    Balance: number;
    BalanceText: string;
    constructor() {
      this.ProfitLoss = 0;
      this.Credit = 0;
      this.Deposit = 0;
      this.Withdrawal = 0;
      this.Balance = 0;
      this.BalanceText = '';
    }
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
  // tslint:disable-next-line:eofline
  }