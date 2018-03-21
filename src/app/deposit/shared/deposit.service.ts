import { Injectable } from '@angular/core';
import {
  Http,
  Response,
  Headers,
  RequestOptions,
  RequestMethod
} from '@angular/http';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { environment } from 'environments/environment';
import { Asset } from '../../models/asset.model';

@Injectable()
export class DepositService {

  constructor(private http: Http) {}

  // postDeposit(memberRef: string, amount: number) {
  //   const body = {
  //     MemberRef: memberRef,
  //     Amount: amount
  //   };

  //   const headerOptions = new Headers({ 'Content-Type': 'application/json' });
  //   const requestOptions = new RequestOptions({ method: RequestMethod.Post, headers: headerOptions});
  //   return this.http.post(environment.url_static_api + '/api/assets', body, requestOptions).map(x => x.json());
  // }

  postDeposit(asset: Asset) {
    const memberref = JSON.parse(localStorage.getItem('profile')).memberref;
    debugger;
    const body = {
        MemberRef: memberref,
        AssetType: 'Deposit',
        amountRequest: asset.amountRequest,
        createBy: memberref
    };
    const headerOptions = new Headers({ 'Content-Type': 'application/json' });
    const requestOptions = new RequestOptions({
        method: RequestMethod.Post, headers: headerOptions
    });
    return this.http
        .post(environment.url_static_api + '/api/assets', body, requestOptions)
        .map(x => x.json());
}

//   postAsset(
//     memberRef: string, assetType: string, amount: number, createBy: string) {
//     const body = {
//         MemberRef: memberRef,
//         AssetType: assetType,
//         Amount: amount,
//         CreateBy: createBy
//     };
//     const headerOptions = new Headers({ 'Content-Type': 'application/json' });
//     const requestOptions = new RequestOptions({
//         method: RequestMethod.Post, headers: headerOptions
//     });
//     return this.http
//         .post(environment.url_static_api + '/api/assets', body, requestOptions)
//         .map(x => x.json());
// }

}
