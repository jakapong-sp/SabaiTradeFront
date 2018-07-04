import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AppService } from '../app.service';
import { ServerService } from '../server.service';
import { Asset } from '../models/asset.model';
import { isNumeric } from 'rxjs/util/isNumeric';

declare const $: any;
declare var swal: any;

@Component({
  selector: 'app-deposit',
  templateUrl: './deposit.component.html'
})
export class DepositComponent implements OnInit {
  asset: Asset;
  errorMsg: string;
  showNotification(from: any, align: any, msg: string) {
    $.notify({
      icon: 'notifications', message: msg
    }, {
        type: 'success', timer: 1000, placement: {
          from: from, align: align
        }
      });
  }

  constructor(private server: ServerService) { }

  ngOnInit() {
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
    debugger;
    if (form != null) {
      form.reset();
    }
  }

  OnSubmit(form: NgForm) {
      debugger;
    this.server.postDeposit(form.value).subscribe((data: any) => {
      form.reset();
      this.showNotification('top', 'center', 'Deposit success');
    }, error => {
      this.errorMsg = <any>error;
    }
  );
    // swal({
    //   title: 'Are you sure?',
    //   text: '',
    //   type: '',
    //   showCancelButton: true,
    //   confirmButtonClass: 'btn btn-success',
    //   cancelButtonClass: 'btn btn-danger',
    //   confirmButtonText: 'OK',
    //   buttonsStyling: false
    // }).then((result) => {
    // }
    // );
  }

  setFormatCurrency(amt: string) {
    debugger;
    amt = amt.replace(/[^\d\.\-\ ]/g, '');
    if (isNumeric(amt) === false) { return ''; };
    if (amt.length > 3) {
      const numVal = parseInt(amt, 10);
      amt = numVal.toString().split('').reverse().reduce(function (acc, amt, i, orig) {
        return amt + (i && !(i % 3) ? ',' : '') + acc;
      }, '');
    }
    return amt;
  }

  onKeyup(event) {
  }
}
