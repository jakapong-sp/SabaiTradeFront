import { Component, OnInit, NgZone, AfterViewInit } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { TableData } from '../md/md-table/md-table.component';
import {
  OrderTotal,
  OrderTotalHistory,
  Order
} from '../trades/shared/trades.model';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
  AbstractControl
} from '@angular/forms';
import { ServerService } from '../server.service';
import { Asset } from '../models/asset.model';
declare const $: any;

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styles: [
    `
    .order-align {
      text-align:right;
    }
    .cls-price-up{
      color:blue;
    }
    .cls-price-down{
      color:red;
    }
  `
  ]
})
export class HistoryComponent implements OnInit, AfterViewInit {
  public tableData: TableData;
  public tableDataHis: TableData;
  public orderTotal: OrderTotal;
  public orderTotalHis: OrderTotalHistory;
  private profile: any;
  public listOrder: Order[];
  public listAsset: Asset[];
  public listAssetObs: Observable<Asset[]>;
  public order: Order[];

  private selectedObj: any;
  public orderTypeSelected: boolean;

  showNotification(from: any, align: any, msg: string) {
    $.notify({icon: 'notifications', message: msg }, { type: 'success', timer: 1000, placement: { from: from, align: align }});
  }

  constructor(private http: Http, private server: ServerService) {}

  ngOnInit() {
    this.tableDataHis = {
      headerRow: [
        'Time',
        'Type',
        'Size',
        'Symbol',
        'Price',
        'S/L',
        'T/P',
        'Time',
        'Price',
        'Comm',
        'Swap',
        'Profit'
      ],
      dataRows: []
    };
    this.loadHistory();
    this.orderTotalHis.Credit = 0;
  }
  ngAfterViewInit() {}

  loadHistory() {
    // this.orderList = this.server.getHistory();
    this.profile = JSON.parse(localStorage.getItem('profile'));
    this.orderTotalHis = new OrderTotalHistory();

    // this.listAssetObs = this.server.getHistoryAssets();
    // this.listAssetObs.forEach(result => {
    //   if (result[0].AssetType === 'Deposit') {
    //     this.tableDataHis.dataRows.push([
    //       result[0].AssetRef, result[0].CreateDate, 'Balance', '', '', '', '',
    //       '', '', '', result[0].AssetType, result[0].AmountRequest
    //     ]);
    //     this.orderTotalHis.Deposit += parseFloat(result[0].Amount);
    //   }
    // });

    this.server.getHistoryAssets().subscribe(res => {
      res.forEach(asset => {
        if (asset.AssetType === 'Deposit') {
          this.tableDataHis.dataRows.push([
            asset.AssetRef,
            asset.CreateDate,
            'Balance',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            asset.AssetType,
            parseFloat(asset.Amount)
              .toFixed(2)
              .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
          ]);
          this.orderTotalHis.Deposit += parseFloat(asset.Amount);
        }
        if (asset.AssetType === 'Withdraw') {
          this.tableDataHis.dataRows.push([
            asset.AssetRef,
            asset.CreateDate,
            'Balance',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            asset.AssetType,
            parseFloat(asset.AmountRequest)
              .toFixed(2)
              .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
          ]);
          this.orderTotalHis.Withdrawal += parseFloat(asset.AmountRequest);
        }
      });
      this.listAsset = res;

      this.orderTotalHis.Balance =
        this.orderTotalHis.ProfitLoss +
        (this.orderTotalHis.Deposit - this.orderTotalHis.Withdrawal);
      this.orderTotalHis.BalanceText = parseFloat(
        this.orderTotalHis.Balance.toString()
      )
        .toFixed(2)
        .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
      this.orderTotalHis.TotalText = `
   Profit/Loss: ${parseFloat(this.orderTotalHis.ProfitLoss.toString())
     .toFixed(2)
     .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
   |  Credit: ${parseFloat(this.orderTotalHis.Credit.toString())
     .toFixed(2)
     .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
   |  Deposit: ${parseFloat(this.orderTotalHis.Deposit.toString())
     .toFixed(2)
     .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
   |  Withdrawal: ${parseFloat(this.orderTotalHis.Withdrawal.toString())
     .toFixed(2)
     .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
   `;
    });
    this.server.getHistoryOrders().subscribe(result => {
      result.forEach(item => {
        if (item.Status === 'Close') {
          this.tableDataHis.dataRows.push([
            item.OrderRef,
            item.CreateDate,
            item.Type,
            parseFloat(item.Size.toString()).toFixed(2),
            item['Symbol'],
            parseFloat(item.Price.toString()).toFixed(2),
            parseFloat(item.SL.toString()).toFixed(2),
            parseFloat(item.TP.toString()).toFixed(2),
            item.CloseDate,
            parseFloat(item.PriceNow.toString()).toFixed(2),
            parseFloat(item.Commission.toString()).toFixed(2),
            parseFloat(item.Swap.toString()).toFixed(2),
            parseFloat(item.Profit.toString())
              .toFixed(2)
              .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
          ]);
          this.orderTotalHis.ProfitLoss += parseFloat(item.Profit.toString());
        }
      });
      this.listOrder = result;
      this.orderTotalHis.BalanceText = parseFloat(
        this.orderTotalHis.Balance.toString()
      )
        .toFixed(2)
        .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
      this.orderTotalHis.TotalText = `
   Profit/Loss: ${parseFloat(this.orderTotalHis.ProfitLoss.toString())
     .toFixed(2)
     .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
   |  Credit: ${parseFloat(this.orderTotalHis.Credit.toString())
     .toFixed(2)
     .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
   |  Deposit: ${parseFloat(this.orderTotalHis.Deposit.toString())
     .toFixed(2)
     .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
   |  Withdrawal: ${parseFloat(this.orderTotalHis.Withdrawal.toString())
     .toFixed(2)
     .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
   `;
    });
  }
}
