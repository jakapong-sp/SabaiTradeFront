import { Injectable } from '@angular/core';
import {
  Http,
  Response,
  Headers,
  RequestOptions,
  RequestMethod
} from '@angular/http';

// import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { User } from './models/user';
import { environment } from '../environments/environment';
import { HttpClientModule } from '@angular/common/http';
import { Order } from './trades/shared/trades.model';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { Asset } from './models/asset.model';

@Injectable()
export class ServerService {
  // private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  private headers = new Headers({ 'Content-Type': 'application/json' });
  // private baseUrl = `http://203.151.27.223:3000/`;  // don't use local in case of cross domain or ip address
  private baseUrl = environment.node_static_url;
  private loginUrl = `${this.baseUrl}/api/login`;
  private logoutUrl = `${this.baseUrl}/api/logout`;
  private productUrl = `${this.baseUrl}/api/product`;
  private transactionUrl = `${this.baseUrl}/api/transaction`;
  private reportUrl = `${this.baseUrl}/api/report`;

  constructor(private http: Http) {}

  private handleError(error: any) {
    // return Observable.throw(error.json() || 'Server Error');
    return Observable.throw('Server Error');
  }

  // feedProducts(): Observable<Photo[]> {
  //   return this.http.get<Photo[]>('https://jsonplaceholder.typicode.com/photos');
  // }

  // login(username: string, password: string): Observable<User> {

  //   const user = { 'username': username, 'password': password };
  //   return this.http.post<User>(this.loginUrl, JSON.stringify(user), { headers: this.headers });
  // }

  // logout(): Observable<any> {
  //   return this.http.get(this.logoutUrl);
  // }

  // getProduct(id: number): Observable < Product > {
  //   const url = `${this.productUrl}/id/${id}`;
  //   return this.http.get<Product>(url);
  // }

  // getProductWithKeyword(keyword: string): Observable < Product[] > {
  //   const url = `${this.productUrl}/name/${keyword}`;
  //   return this.http.get<Product[]>(url);
  // }

  // getProducts(): Observable < Product[] > {
  //   return this.http.get<Product[]>(this.productUrl);
  // }

  // addProduct(product: Product): Promise<Product> {
  //    product._id = `${Math.floor(Math.random() * 67000)}`;
  //   return this.http
  //     .post<Product>(this.productUrl, JSON.stringify(product), {headers: this.headers})
  //     .toPromise();
  // }

  // deleteProduct(id: number): Observable<void> {
  //   const url = `${this.productUrl}/${id}`;
  //   return this.http.delete<void>(url, {headers: this.headers});
  // }

  // updateProduct(product: Product): Observable<Product> {
  //   return this.http
  //   .put<Product>(this.productUrl, JSON.stringify(product), {headers: this.headers});
  // }

  getUploadFile(form): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/fileUpload/`, form, {
      withCredentials: true,
      headers: undefined
    });
  }

  getHistoryOrders(): Observable<Order[]> {
    debugger;
    const memberref = JSON.parse(localStorage.getItem('profile')).memberref;
    const headerOptions = new Headers({ 'Content-Type': 'application/json' });
    const requestOptions = new RequestOptions({
      method: RequestMethod.Get,
      headers: headerOptions
    });
    return this.http
      .get(this.baseUrl + '/api/order/id/' + memberref, requestOptions)
      .map(res => res.json());
  }

  getHistoryAssets(): Observable<Asset[]> {
    const memberref = JSON.parse(localStorage.getItem('profile')).memberref;
    const headerOptions = new Headers({ 'Content-Type': 'application/json' });
    const requestOptions = new RequestOptions({
      method: RequestMethod.Get,
      headers: headerOptions
    });
    return this.http
      .get(this.baseUrl + '/api/asset/id/' + memberref, requestOptions)
      .map(res => res.json());
  }

  postDeposit(asset: Asset) {
    const memberref = JSON.parse(localStorage.getItem('profile')).memberref;
    const amt = asset.AmountRequest.replace(/[, ]+/g, '').trim();
    const body = {
      MemberRef: memberref,
      AssetType: 'Deposit',
      AmountRequest: amt,
      CreateBy: memberref
    };
    const headerOptions = new Headers({ 'Content-Type': 'application/json' });
    const requestOptions = new RequestOptions({
      method: RequestMethod.Post,
      headers: headerOptions
    });
    return this.http
      .post(environment.node_static_url + '/api/asset', body, requestOptions)
      .map(x => x.json())
      .catch(this.handleError);
  }

  postWithdraw(asset: Asset) {
    const memberref = JSON.parse(localStorage.getItem('profile')).memberref;
    const amt = asset.AmountRequest.replace(/[, ]+/g, '').trim();
    const body = {
      MemberRef: memberref,
      AssetType: 'Withdraw',
      AmountRequest: amt,
      CreateBy: memberref
    };
    const headerOptions = new Headers({ 'Content-Type': 'application/json' });
    const requestOptions = new RequestOptions({
      method: RequestMethod.Post,
      headers: headerOptions
    });
    return this.http
      .post(environment.node_static_url + '/api/asset', body, requestOptions)
      .map(x => x.json())
      .catch(this.handleError);
  }
}

export interface Photo {
  albumId: number;
  id: number;
  title: string;
  url: string;
  thumbnailUrl: string;
}

export class Product {
  _id: string;
  name: string;
  image: string;
  category: number;
  price: number;
  qty: number;
  stock: number;
}
