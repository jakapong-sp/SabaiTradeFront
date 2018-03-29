// import { Component, OnInit } from '@angular/core';

// @Component({
//   selector: 'app-history',
//   templateUrl: './history.component.html'
// })
// export class HistoryComponent implements OnInit {

//   constructor() { }

//   ngOnInit() {
//   }

// }
import { Component, OnInit, NgZone } from '@angular/core';
import { ChannelService, ConnectionState, ChannelEvent } from '../trades/shared/channel.service';
import * as Chartist from 'chartist';
import { Http, Response } from '@angular/http';
import { TradesService } from '../trades/shared/trades.service';
import { debug, isNullOrUndefined } from 'util';
import { Observable } from 'rxjs/Observable';
import { TableData } from '../md/md-table/md-table.component';
import { OrderTotal, OrderTotalHistory } from '../trades/shared/trades.model';
import { SlicePipe } from '@angular/common/src/pipes';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { Subject } from 'rxjs/Subject';

declare const $: any;

class ChannelSubject {
  channel: string;
  subject: Subject<ChannelEvent>;
}

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styles: [`
    .order-align {
      text-align:right;
    }
    .cls-price-up{
      color:blue;
    }
    .cls-price-down{
      color:red;
    }
  `],
  providers: [TradesService]
})

export class HistoryComponent implements OnInit {

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

      if (ev.Name === 'Feeds') {
        // console.log(`onEvent - ${channel} channel`, ev);
        this.tableDataHis.dataRows = []; // clear row for new data
        this.orderTotalHis.ProfitLoss = ev.Folio.ProfitClose; this.orderTotalHis.Credit = 0;
        this.orderTotalHis.Deposit = ev.Folio.Deposit; this.orderTotalHis.Withdrawal = ev.Folio.Withdraw;
        this.orderTotalHis.Balance = ev.Folio.Balance;
        ev.Order.forEach(item => {
          if (item.Status === 'Close') {
            this.tableDataHis.dataRows.push([
              item.OrderRef, item.CreateDate, item.Type, item.Size.toFixed(2), item.Symbol, item.Price.toFixed(2), item.SL.toFixed(2),
              item.TP.toFixed(2), item.CloseDate, item.PriceNow.toFixed(2), item.Swap.toFixed(2),
              item.Profit.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
            ]);
          }
        });

        this.orderTotalHis.BalanceText = this.orderTotalHis.Balance.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
        this.orderTotalHis.TotalText = `
          Profit/Loss:    ${this.orderTotalHis.ProfitLoss.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
          |  Credit:    ${this.orderTotalHis.Credit.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
          |  Deposit:    ${this.orderTotalHis.Deposit.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
          |  Withdrawal:    ${this.orderTotalHis.Withdrawal.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
          `;
        this._ngZone.run(() => { });
      }
    });
  }


}
