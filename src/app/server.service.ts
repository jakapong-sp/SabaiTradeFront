import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { User } from './models/user';
import { environment } from '../environments/environment';
import { HttpClientModule } from '@angular/common/http';

@Injectable()
export class ServerService {
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  // private baseUrl = `http://203.151.27.223:3000/`;  // don't use local in case of cross domain or ip address
  private baseUrl = environment.node_static_url;
  private loginUrl = `${this.baseUrl}/api/login`;
  private logoutUrl = `${this.baseUrl}/api/logout`;
  private productUrl = `${this.baseUrl}/api/product`;
  private transactionUrl = `${this.baseUrl}/api/transaction`;
  private reportUrl = `${this.baseUrl}/api/report`;

  constructor(private http: HttpClient) { }

  feedProducts(): Observable<Photo[]> {
    return this.http.get<Photo[]>('https://jsonplaceholder.typicode.com/photos');
  }

  login(username: string, password: string): Observable<User> {

    const user = { 'username': username, 'password': password };
    return this.http.post<User>(this.loginUrl, JSON.stringify(user), { headers: this.headers });
  }

  logout(): Observable<any> {
    return this.http.get(this.logoutUrl);
  }

  getProduct(id: number): Observable < Product > {
    const url = `${this.productUrl}/id/${id}`;
    return this.http.get<Product>(url);
  }

  getProductWithKeyword(keyword: string): Observable < Product[] > {
    const url = `${this.productUrl}/name/${keyword}`;
    return this.http.get<Product[]>(url);
  }

  getProducts(): Observable < Product[] > {
    return this.http.get<Product[]>(this.productUrl);
  }


  addProduct(product: Product): Promise<Product> {
     product._id = `${Math.floor(Math.random() * 67000)}`;
    return this.http
      .post<Product>(this.productUrl, JSON.stringify(product), {headers: this.headers})
      .toPromise();
  }


  deleteProduct(id: number): Observable<void> {
    const url = `${this.productUrl}/${id}`;
    return this.http.delete<void>(url, {headers: this.headers});
  }

  updateProduct(product: Product): Observable<Product> {
    return this.http
    .put<Product>(this.productUrl, JSON.stringify(product), {headers: this.headers});
  }

  getUploadFile(form): Observable<any> {
    console.log(this.baseUrl);
    return this.http
    .post(`${this.baseUrl}/api/fileUpload/`, form, {
      withCredentials: true,
      headers: undefined});
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


