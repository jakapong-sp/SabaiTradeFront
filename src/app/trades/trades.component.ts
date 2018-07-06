import { Component, OnInit, AfterViewInit, NgZone } from '@angular/core';
import { ChannelService, ConnectionState, ChannelEvent } from './shared/channel.service';
import * as Chartist from 'chartist';
import { Http, Response } from '@angular/http';
import { TradesService } from './shared/trades.service';
import { debug, isNullOrUndefined } from 'util';
import { Observable } from 'rxjs/Observable';
import { TableData } from '../md/md-table/md-table.component';
import { OrderTotal, OrderTotalHistory, Order } from './shared/trades.model';
import { SlicePipe } from '@angular/common/src/pipes';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { CapitalizePipe } from './shared/trades.pipe';
import { Subject } from 'rxjs/Subject';
import { NgForm } from '@angular/forms';
import { Chart } from 'chart.js';
import {ElementRef} from '@angular/core';
import 'rxjs/add/operator/map';

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
    .cls-price-up{
      color:blue;
      border-width: 1cm;
      border-color: #8064A2;
    },
    .cls-price-up:hover,
    .cls-price-up:active,
    .cls-price-up:visited,
    .cls-price-up:focus {
        background-color: #8064A2;
        border-color: #8064A2;
        border-style: solid
    }
    .cls-price-down{
      color:red;
    }
  `],
  providers: [TradesService]
})

export class TradesComponent implements OnInit, AfterViewInit {

  connectionState$: Observable<string>;
  public feedBid: any = '';
  public feedAsk: any = '';
  public colorBid: String = '';
  public colorAsk: String = '';
  public clsBtnBid: String = '';
  public clsBtnAsk: String = '';

  // private channel = 'tasks';
  private eventName: string;
  public tableData: TableData;
  public tableDataHis: TableData;
  public orderTotal: OrderTotal;
  public orderTotalHis: OrderTotalHistory;
  private subjects = new Array<ChannelSubject>();
  private profile: any;
  public txtSize = '0.01';
  public txtStop = '0.00';
  public txtTake = '0.00';
  public txtPlace = '0.00';

  private selectedObj: any;
  public placeTypeSelected: boolean;
  public placeInvalid = false;
  public closeOrder: TableData[];

  chart = [];
  chartBid = [];
  chartAsk = [];

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
  showNotificationError(from: any, align: any, msg: string) {
    $.notify({
      icon: 'notifications', message: msg
    }, {
        type: 'warning', timer: 1000, placement: {
          from: from, align: align
        }
      });
  }
  startAnimationForLineChart(chart: any) {
    let seq: any, delays: any, durations: any;
    seq = 0;
    delays = 80;
    durations = 500;
    chart.on('draw', function(data: any) {

      if (data.type === 'line' || data.type === 'area') {
        data.element.animate({
          d: {
            begin: 600,
            dur: 700,
            from: data.path.clone().scale(1, 0).translate(0, data.chartRect.height()).stringify(),
            to: data.path.clone().stringify(),
            easing: Chartist.Svg.Easing.easeOutQuint
          }
        });
      } else if (data.type === 'point') {
            seq++;
            data.element.animate({
              opacity: {
                begin: seq * delays,
                dur: durations,
                from: 0,
                to: 1,
                easing: 'ease'
              }
            });
        }
    });
    seq = 0;
}

  constructor(
    private channelService: ChannelService,
    private _ngZone: NgZone,
    // private _signalRService: ChannelService,
    private http: Http,
    private tradeService: TradesService,
    private elementRef: ElementRef
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

  ngAfterViewInit() {
    // this.chart = new Chart('canvas', {
    //   type: 'line',
    //   data: {
    //     labels: [1485717216, 1485747216, 1485787216],
    //     datasets: [
    //       {
    //         data: [272.946, 275.946, 279.946],
    //         borderColor: "#3cba9f",
    //         fill: false
    //       },
    //       { 
    //         data: [273.946, 276.946, 280.946],
    //         borderColor: "#ffcc00",
    //         fill: false
    //       },
    //     ]
    //   },
    //   options: {
    //     legend: {
    //       display: false
    //     },
    //     scales: {
    //       xAxes: [{
    //         display: true
    //       }],
    //       yAxes: [{
    //         display: true
    //       }],
    //     }
    //   }
    // });
  }
  ngOnInit() {
    // this.tradeService.dailyForecast().subscribe(res => {
    //   console.log(res);
    // });

    this.tableData = {
      headerRow: ['Time', 'Type', 'Size', 'Symbol', 'Price', 'S/L', 'T/P', 'Price', 'Comm', 'Swap', 'Profit', ''],
      dataRows: []
    };
    this.tableDataHis = {
      headerRow: ['Time', 'Type', 'Size', 'Symbol', 'Price', 'S/L', 'T/P', 'Time', 'Price', 'Swap', 'Profit'],
      dataRows: []
    };

    this.placeTypeSelected = true;
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
    let dataDailySalesChart = {
        labels: [], series: [[]]
    };
    let optionsDailySalesChart = {
        lineSmooth: Chartist.Interpolation.cardinal({
            tension: 20
        }),
        low: 0,
        high: 0,
        chartPadding: { top: 0, right: 0, bottom: 0, left: 0},
    };
    let dailySalesChart = new Chartist.Line('#dailySalesChart', dataDailySalesChart, optionsDailySalesChart);
    this.startAnimationForLineChart(dailySalesChart);

    this.channelService.hubProxy.on('onEvent', (channel: string, ev: ChannelEvent) => {
      // debugger;
      // this.profile = JSON.parse(localStorage.getItem('profile'));
      // console.log(this.profile.userid);

      if (ev.Name === 'Feeds') {
        // debugger;
        // console.log(`onEvent - ${channel} channel`, ev);

        // Chartis
        this.chartBid.push(ev.Data.Bid);
        this.chartAsk.push(ev.Data.Ask);
        if (this.chartBid.length > 6 && this.chartAsk.length > 6) {
           this.chartBid.splice(0, 1);
           this.chartAsk.splice(0, 1);
        }

        dataDailySalesChart = {
          labels: ['', '', '', '', '', ''],
          series: [
            this.chartBid, this.chartAsk
          ]
        };
        optionsDailySalesChart = {
          lineSmooth: Chartist.Interpolation.cardinal({
              tension: 20
          }),
          low: ev.Data.Bid - 1,
          high: ev.Data.Ask + 1,
          chartPadding: { top: 0, right: 0, bottom: 0, left: 0},
      };
        dailySalesChart = new Chartist.Line('#dailySalesChart', dataDailySalesChart, optionsDailySalesChart);
        // this.startAnimationForLineChart(dailySalesChart);
        const optionsColouredBarsChart: any = {
          lineSmooth: Chartist.Interpolation.cardinal({
              tension: 10
          }),
          axisY: {
              showGrid: true,
              offset: 40
          },
          axisX: {
              showGrid: false,
          },
          low: 0,
          high: 1000,
          showPoint: true,
          height: '300px'
        };


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
          }
          if (item.Status === 'Pending') {
            if (item.Type === 'Buy') { // set price now for calculate
              item.PriceNow = ev.Data.Bid;
            } else {
              item.PriceNow = ev.Data.Ask;
            }
            this.tableData.dataRows.push([
              item.OrderRef, item.CreateDate, item.Type, item.Size.toFixed(2), item.Symbol, item.Price.toFixed(2), item.SL.toFixed(2),
              item.TP.toFixed(2), item.PriceNow.toFixed(2), item.Commission.toFixed(2), item.Swap.toFixed(2),
              item.Profit.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
            ]);
          }
          if (item.Status === 'Place') {
            if (item.Type === 'Buy') {
              item.PriceNow = ev.Data.Ask;
            } else {
              item.PriceNow = ev.Data.Bid;
            }
            this.tableData.dataRows.push([
              item.OrderRef, item.CreateDate, item.Type === 'Buy' ? 'Buy Limit' : 'Sell Limit', item.Size.toFixed(2), item.Symbol,
              item.Price.toFixed(2), item.SL.toFixed(2), item.TP.toFixed(2), item.PriceNow.toFixed(2), '', '', ''
            ]);
          }
        });

        this.orderTotal.ProfitText = this.orderTotal.Profit.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
        this.orderTotal.TotalText = `
          Balance :   ${this.orderTotal.Balance.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
          USD | Equity:   ${this.orderTotal.Equity.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
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
            // this.clsBtnBid = 'btn btn-danger btn-lg';
            this.clsBtnBid = 'cls-price-down';
          } else {
            // blue
            this.colorAsk = 'darkgreen';
            // this.clsBtnBid = 'btn btn-success btn-lg';
            this.clsBtnBid = 'cls-price-up';
          }
          if (this.feedAsk >= ev.Data.Ask) {
            // red
            this.colorAsk = 'red';
            // this.clsBtnAsk = 'btn btn-danger btn-lg';
            this.clsBtnAsk = 'cls-price-down';
          } else {
            // blue
            this.colorAsk = 'success';
            // this.clsBtnAsk = 'btn btn-success btn-lg';
            this.clsBtnAsk = 'cls-price-up';
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

  onAdd(orderType: string, place: boolean, size: number, price: number, stop: number, take: number) {
    // check equity zero
    if (this.orderTotal.Equity === 0) {
      this.showNotificationError('top', 'right', 'Quity Zero!!');
      return false;
    }

    // validate diabled and validate again
    if (place) {
      if (orderType === 'Buy') {
        if (price > (parseFloat(this.feedAsk) - 2) && price < parseFloat(this.feedAsk)) {
          this.placeInvalid = true;
          this.showNotificationError('top', 'right', 'Invalid Price. Please verify operation parameters and try again later.');
          return false;
        }
      } else if (orderType === 'Sell') {
        if (price < (parseFloat(this.feedBid) + 2) && price > parseFloat(this.feedBid)) {
          this.placeInvalid = true;
          this.showNotificationError('top', 'right', 'Invalid Price. Please verify operation parameters and try again later.');
          return false;
        }
      }
    }
    const memberRef = JSON.parse(localStorage.getItem('profile')).userid; // get from session
    const OrderSymbol = 'xauusd';
    this.tradeService.postOrder(orderType, place, price, memberRef, size, OrderSymbol, stop, take)
      .subscribe(data => {
        const msg = '#' + data.orderRef + ' ' + data.type + ' ' + size + ' ' + data.symbol + ' at ' + data.price + ' Successful';
        this.showNotification('top', 'center', msg);
        if (place) {
          $('#noticeModalOrder').modal('hide');
        }
      });
  }

  onClose(closeOrder: TableData, priceNow: number) {
    this.tradeService.closeOrder(closeOrder[0], priceNow)
      .subscribe(data => {
        const msg = 'Close #' + closeOrder[0] + ' ' + closeOrder[2] + ' ' + closeOrder[3] + ' ' + closeOrder[4] +
          ' at ' + priceNow + ' Successful';
        this.showNotification('top', 'center', msg);
      });
  }

  onDelete(closeOrder: TableData, priceNow: number) {
    this.tradeService.deleteOrder(closeOrder[0], priceNow)
      .subscribe(data => {
        const msg = 'Delete #' + closeOrder[0] + ' ' + closeOrder[2] + ' ' + closeOrder[3] + ' ' + closeOrder[4] +
          ' at ' + priceNow + ' Successful';
        this.showNotification('top', 'center', msg);
      });
  }
  onSizeBlur(val: number) {
    // if (val < 0.1 || val > 8) {
    //   this.txtSize = '0.01';
    // }
  }

  // onSelectedOrderType(id: any) {
  //   // alert(id.target.value);
  //   if (id.target.value === 'Instant') {
  //     this.orderTypeSelected = true;
  //   } else {
  //     this.orderTypeSelected = false;
  //   }
  // }

  onSelectedPlaceOrderType(id: any) {
    // alert(id.target.value);
    if (id.target.value === 'Buy') {
      this.placeTypeSelected = true;
    } else {
      this.placeTypeSelected = false;
    }
  }

  onPlaceOrderChange(event, selectPlaceOrderType) {
    if (event.target.value === '0.01') {
      if (selectPlaceOrderType === 'Buy') {
        this.txtPlace = (parseFloat(this.feedAsk) - 2).toString();
      } else {
        this.txtPlace = (parseFloat(this.feedBid) + 2).toString();
      }
    }
    // debugger;
    if (selectPlaceOrderType === 'Buy') {
      if (this.txtPlace > this.feedBid) {
        this.placeInvalid = true;
      } else {
        this.placeInvalid = false;
      }
    } else {
      if (this.txtPlace < this.feedAsk) {
        this.placeInvalid = true;
      } else {
        this.placeInvalid = false;
      }
    }
  }

  onPlaceOrderBlur(event, pricePending) {
  }

  onTradeInvalid() {
    return false;
  }

}
