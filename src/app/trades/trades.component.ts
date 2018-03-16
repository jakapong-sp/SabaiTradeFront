import { Component, OnInit, NgZone } from '@angular/core';
import { ChannelService, ConnectionState, ChannelEvent } from './shared/channel.service';
import * as Chartist from 'chartist';
import { Http, Response } from '@angular/http';
import { TradesService } from './shared/trades.service';
import { debug, isNullOrUndefined } from 'util';
import { Observable } from 'rxjs/Observable';
import { TableData } from '../md/md-table/md-table.component';
import { OrderTotal, OrderTotalHistory } from './shared/trades.model';
import { SlicePipe } from '@angular/common/src/pipes';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { CapitalizePipe } from './shared/trades.pipe';
import { Subject } from 'rxjs/Subject';

declare const $: any;

class ChannelSubject {
  channel: string;
  subject: Subject<ChannelEvent>;
}

@Component({
  selector: 'app-trades',
  templateUrl: './trades.component.html',
  styles: [`
    .order-align {
      text-align:right;
    }
  `],
  providers: [TradesService]
})

export class TradesComponent implements OnInit {

  connectionState$: Observable<string>;
  public feedBid: any = '';
  public feedAsk: any = '';
  public colorBid: String = '';
  public colorAsk: String = '';
  public clsBtnBid: String = '';
  public clsBtnAsk: String = '';

  private channel = 'tasks';
  private eventName: string;
  public tableData: TableData;
  public tableDataHis: TableData;
  public orderTotal: OrderTotal;
  public orderTotalHis: OrderTotalHistory;
  public txtSize = '0.01';
  private subjects = new Array<ChannelSubject>();
  private profile: any;

  private selectedObj: any;
  public orderTypeSelected: boolean;

  showNotification(from: any, align: any, msg: string) {
    // const type = ['', 'info', 'success', 'warning', 'danger', 'rose', 'primary'];
    // const color = Math.floor((Math.random() * 6) + 1);
    $.notify({
      icon: 'notifications', message: msg
    }, {
        type: 'success', timer: 1000, placement: {
          from: from, align: align
        }
      });
  }

  constructor(
    private channelService: ChannelService,
    private _ngZone: NgZone,
    private _signalRService: ChannelService,
    private http: Http,
    private tradeService: TradesService
  ) {
    // const script = document.createElement('script');
    // script.src = 'assets/js/jquery.signalr-2.2.2.min.js';
    // document.body.appendChild(script);

    this.connectionState$ = this.channelService.connectionState$
      .map((state: ConnectionState) => {
        return ConnectionState[state];
      });

    this.channelService.error$.subscribe(
      (error: any) => { console.warn(error); },
      (error: any) => { console.error('errors$ error', error); }
    );

    // Wire up a handler for the starting$ observable to log the
    //  success/fail result
    this.channelService.starting$.subscribe(
      () => { console.log('signalr service has been started'); },
      () => { console.warn('signalr service failed to start!'); }
    );
  }

  ngOnInit() {
    this.tableData = {
      headerRow: ['Time', 'Type', 'Size', 'Symbol', 'Price', 'S/L', 'T/P', 'Price', 'Comm', 'Swap', 'Profit', ''],
      dataRows: []
    };
    this.tableDataHis = {
      headerRow: ['Time', 'Type', 'Size', 'Symbol', 'Price', 'S/L', 'T/P', 'Time', 'Price', 'Swap', 'Profit'],
      dataRows: []
    };

    this.orderTypeSelected = true;
    this.profile = JSON.parse(localStorage.getItem('profile'));
    this.orderTotalHis = new OrderTotalHistory();
    this.orderTotal = new OrderTotal();
    this.channelService.start();

    this.channelService.sub(this.profile.userid).subscribe(
      (x: ChannelEvent) => {
        // debugger;
        switch (x.Name) {
          case this.eventName: {
            console.log(x.Name);
          }
        }
      },
      (error: any) => {
        console.warn('Attempt to join channel failed!', error);
      }
    );

    this.channelService.hubProxy.on('onEvent', (channel: string, ev: ChannelEvent) => {
      // debugger;
      // this.profile = JSON.parse(localStorage.getItem('profile'));
      // console.log(this.profile.userid);


      if (ev.Name === 'Feeds') {
        // debugger;
        console.log(`onEvent - ${channel} channel`, ev);
        this.tableData.dataRows = []; // clear row for new data
        this.tableDataHis.dataRows = []; // clear row for new data

        this.orderTotal.Profit = ev.Folio.ProfitPending; this.orderTotal.Balance = ev.Folio.Balance;
        this.orderTotal.Equity = ev.Folio.Equity; this.orderTotal.Margin = ev.Folio.Margin; this.orderTotal.FreeMargin = ev.Folio.Free;

        this.orderTotalHis.ProfitLoss = ev.Folio.ProfitClose; this.orderTotalHis.Credit = 0;
        this.orderTotalHis.Deposit = ev.Folio.Deposit; this.orderTotalHis.Withdrawal = 0;
        this.orderTotalHis.Balance = ev.Folio.Balance;

        ev.Order.forEach(item => {
          if (item.Status === 'Close') {
            this.tableDataHis.dataRows.push([
              item.OrderRef, item.CreateDate, item.Type, item.Size.toFixed(2), item.Symbol, item.Price.toFixed(2), item.SL.toFixed(2),
              item.TP.toFixed(2), item.CloseDate, item.PriceNow.toFixed(2), item.Swap.toFixed(2),
              item.Profit.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
            ]);
            // this.orderTotalHis.Profit += item.Profit;
          }
          if (item.Status === 'Deposit') {
            this.tableDataHis.dataRows.push([
              item.OrderRef, item.CreateDate, item.Type, '', '', '', '',
              '', '', '', item.Status, item.Profit.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
            ]);
            // this.orderTotalHis.Profit += item.Profit;
          }
          if (item.Type === 'Buy') { // set price now for calculate
            item.PriceNow = ev.Data.Bid;
          } else {
            item.PriceNow = ev.Data.Ask;
          }
          if (item.Status === 'Pending') {
            this.tableData.dataRows.push([
              item.OrderRef, item.CreateDate, item.Type, item.Size.toFixed(2), item.Symbol, item.Price.toFixed(2), item.SL.toFixed(2),
              item.TP.toFixed(2), item.PriceNow.toFixed(2), item.Commission.toFixed(2), item.Swap.toFixed(2),
              item.Profit.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
            ]);
          }
        });

        this.orderTotal.ProfitText = this.orderTotal.Profit.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
        this.orderTotal.TotalText = `
          Balance :   ${this.orderTotal.Balance.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
          | USD  Equity:   ${this.orderTotal.Equity.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
          | Margin:   ${this.orderTotal.Margin.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
          | Free margin:   ${this.orderTotal.FreeMargin.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
          `;

        this.orderTotalHis.BalanceText = this.orderTotalHis.Balance.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
        this.orderTotalHis.TotalText = `
          Profit/Loss:    ${this.orderTotalHis.ProfitLoss.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
          |  Credit:    ${this.orderTotalHis.Credit.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
          |  Deposit:    ${this.orderTotalHis.Deposit.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
          |  Withdrawal:    ${this.orderTotalHis.Withdrawal.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
          `;
        this._ngZone.run(() => {
          if (this.feedBid >= ev.Data.Bid) {
            // red
            this.colorBid = 'red';
            this.clsBtnBid = 'btn btn-danger btn-lg';
          } else {
            // blue
            this.colorAsk = 'darkgreen';
            this.clsBtnBid = 'btn btn-success btn-lg';
          }
          if (this.feedAsk >= ev.Data.Ask) {
            // red
            this.colorAsk = 'red';
            this.clsBtnAsk = 'btn btn-danger btn-lg';
          } else {
            // blue
            // this.colorAsk = '#0277BD';
            this.colorAsk = 'success';
            this.clsBtnAsk = 'btn btn-success btn-lg';
          }
          if (this.feedBid === '') {
            this.feedBid = parseFloat(ev.Data.Bid).toFixed(2);
            this.feedAsk = parseFloat(ev.Data.Ask).toFixed(2);
          } else {
            this.feedBid = parseFloat(ev.Data.Bid).toFixed(2);
            this.feedAsk = parseFloat(ev.Data.Ask).toFixed(2);
          }
        });
      }
    });
  }

  onAdd(orderType: string, size: number, price: number) {
    const memberRef = JSON.parse(localStorage.getItem('profile')).userid; // get from session
    // debugger;
    const OrderSymbol = 'xauusd';
    this.tradeService.postOrder(orderType, price, memberRef, size, OrderSymbol)
      .subscribe(data => {
        this.showNotification('top', 'center', 'Send order success');
      });
  }

  onClose(orderRef: string, priceNow: number) {
    // debugger;
    this.tradeService.closeOrder(orderRef, priceNow)
      .subscribe(data => {
        this.showNotification('top', 'center', 'Close order success');
      });
  }

  onBlur(val: number) {
    if (val < 0.1 || val > 8) {
      this.txtSize = '0.01';
    }
  }

  onSelectedOrderType(id: any) {
    // alert(id.target.value);
    if (id.target.value === 'Instant') {
      this.orderTypeSelected = true;
    }else {
      this.orderTypeSelected = false;
    }
}

}
