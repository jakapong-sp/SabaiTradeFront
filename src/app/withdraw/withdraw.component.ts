import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AppService } from '../app.service';
import { Asset } from '../models/asset.model';

declare const $: any;
declare var swal: any;

@Component({
  selector: 'app-withdraw',
  templateUrl: './withdraw.component.html',
  styleUrls: ['./withdraw.component.scss']
})
export class WithdrawComponent implements OnInit {

  asset: Asset;

  showNotification(from: any, align: any, msg: string) {
    $.notify({
      icon: 'notifications', message: msg
    }, {
        type: 'success', timer: 1000, placement: {
          from: from, align: align
        }
      });
  }

  constructor(private app: AppService) { }

  ngOnInit() {
    this.asset = {
      amount: '',
      amountRequest: '',
      memberRef: '',
      assetRef: '',
      assetType: '',
      status: '',
      createBy: '',
      createDate: null,
      approve1By: '',
      approve1Date: null,
      approve2By: '',
      approve2Date: null
    };
    this.resetForm();
  }
  resetForm(form?: NgForm) {
    if (form != null) {
      form.reset();
    }
  }
  OnSubmit(form: NgForm) {
    this.app.postWithdraw(form.value)
      .subscribe((data: any) => {
          form.reset();
          this.showNotification('top', 'center', 'Withdraw success');
      });
  }
}
