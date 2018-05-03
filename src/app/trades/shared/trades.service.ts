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
// import { Order } from './trades.model';
import { environment } from 'environments/environment';

@Injectable()
export class TradesService {

  constructor(private http: Http) {}

  postOrder(orderType: string, place: boolean, price: number, memberRef: string,
      size: number, orderSymbol: string, stop: number, take: number) {
    const body = {
      MemberRef: memberRef,
      Type: orderType,
      Place: place,
      price: price,
      Size: size,
      Symbol: orderSymbol,
      SL: stop,
      TP: take
    };
    const headerOptions = new Headers({ 'Content-Type': 'application/json' });
    const requestOptions = new RequestOptions({ method: RequestMethod.Post, headers: headerOptions});
    return this.http.post(environment.url_static_api + '/api/orders', body, requestOptions).map(x => x.json());
  }

  closeOrder(orderRef: string, priceNow: number) {
    const body = {
      OrderRef: orderRef,
      PriceNow: priceNow,
      Type: 'close'
    };

    const headerOptions = new Headers({ 'Content-Type': 'application/json' });
    const requestOptions = new RequestOptions({method: RequestMethod.Put, headers: headerOptions});
    return this.http
      .put(environment.url_static_api + '/api/orders/' + orderRef, body, requestOptions)
      .map(res => res.json());
  }

  deleteOrder(orderRef: string, priceNow: number) {
    const body = {
      OrderRef: orderRef,
      PriceNow: priceNow,
      Type: 'delete'
    };

    const headerOptions = new Headers({ 'Content-Type': 'application/json' });
    const requestOptions = new RequestOptions({method: RequestMethod.Put, headers: headerOptions});
    return this.http
      .put(environment.url_static_api + '/api/orders/' + orderRef, body, requestOptions)
      .map(res => res.json());
  }

}
