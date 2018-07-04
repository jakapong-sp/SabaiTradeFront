import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ServerService } from '../server.service';
import { Asset } from '../models/asset.model';
import { isNumeric } from 'rxjs/util/isNumeric';
import { HubConnection } from '@aspnet/signalr';
import { environment } from 'environments/environment';

import {
  ChannelService,
  ConnectionState,
  ChannelEvent
} from '../trades/shared/channel.service';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { NgZone } from '@angular/core';

declare const $: any;
declare var swal: any;

class WithdrawChannelSubject {
  channel: string;
  subject: Subject<ChannelEvent>;
}

@Component({
  selector: 'app-withdraw',
  templateUrl: 'withdraw.component.html'
})
export class WithdrawComponent implements OnInit {
  asset: Asset;
  connectionState$: Observable<string>;
  public feedBid: any = '';
  public feedAsk: any = '';
  public colorBid: String = '';
  public colorAsk: String = '';
  public clsBtnBid: String = '';
  public clsBtnAsk: String = '';

  private channel = 'tasks';
  private eventName: string;
  private subjects = new Array<WithdrawChannelSubject>();
  private profile: any;
  public txtSize = '0.01';
  public txtStop = '0.00';
  public txtTake = '0.00';
  public txtPlace = '0.00';

  private selectedObj: any;
  public placeTypeSelected: boolean;
  public placeInvalid = false;
  public freeMargin: any = '';
  public amtReqVal: number; // for disable check
  public freeVal: number; // for disable check

  showNotification(from: any, align: any, msg: string) {
    $.notify(
      {
        icon: 'notifications',
        message: msg
      },
      {
        type: 'success',
        timer: 1000,
        placement: {
          from: from,
          align: align
        }
      }
    );
  }

  constructor(
    private server: ServerService,
    private channelService: ChannelService,
    private _ngZone: NgZone,
    private http: Http
  ) {
    this.connectionState$ = this.channelService.connectionState$.map(
      (state: ConnectionState) => {
        return ConnectionState[state];
      }
    );

    this.channelService.error$.subscribe(
      (error: any) => {
        console.warn(error);
      },
      (error: any) => {
        console.error('errors$ error', error);
      }
    );

    this.channelService.starting$.subscribe(
      () => {
        console.log('signalr service has been started');
      },
      () => {
        console.warn('signalr service failed to start!');
      }
    );
  }

  ngOnInit() {
    this.profile = JSON.parse(localStorage.getItem('profile'));
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

    this.channelService.hubProxy.on(
      'onEvent',
      (channel: string, ev: ChannelEvent) => {
        if (ev.Name === 'Feeds') {
          console.log(ev);
          this._ngZone.run(() => {
            this.freeVal = ev.Folio.Free;
            this.freeMargin = parseFloat(ev.Folio.Free)
              .toFixed(2)
              .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
          });
        }
      }
    );

    this.asset = {
      Amount: '',
      AmountRequest: '',
      MemberRef: '',
      AssetRef: '',
      AssetType: '',
      Status: '',
      CreateBy: '',
      CreateDate: null,
      Approve1By: '',
      Approve1Date: null,
      Approve2By: '',
      Approve2Date: null
    };
    this.resetForm();
  }

  resetForm(form?: NgForm) {
    if (form != null) {
      form.reset();
    }
  }

  OnSubmit(form: NgForm) {
    console.log(form.valid);
    this.server.postWithdraw(form.value).subscribe((data: any) => {
      form.reset();
      this.showNotification('top', 'center', 'Withdraw success');
    });
  }

  // OnSubmit(form: NgForm) {
  //   swal({
  //     title: 'Are you sure?',
  //     text: '',
  //     type: '',
  //     showCancelButton: true,
  //     confirmButtonClass: 'btn btn-success',
  //     cancelButtonClass: 'btn btn-danger',
  //     confirmButtonText: 'OK',
  //     buttonsStyling: false
  //   }).then(result => {
  //     this.server.postWithdraw(form.value).subscribe((data: any) => {
  //       form.reset();
  //       this.showNotification('top', 'center', 'Withdraw success');
  //     });
  //   });
  // }

  setFormatCurrency(amt: string) {
    amt = amt.replace(/[^\d\.\-\ ]/g, '');
    this.amtReqVal = parseFloat(amt);
    if (isNumeric(amt) === false) {
      return '';
    }
    if (amt.length > 3) {
      const numVal = parseInt(amt, 10);
      // tslint:disable-next-line:no-shadowed-variable
      amt = numVal
        .toString()
        .split('')
        .reverse()
        .reduce(function(acc, amt, i, orig) {
          return amt + (i && !(i % 3) ? ',' : '') + acc;
        }, '');
    }
    return amt;
  }
}
