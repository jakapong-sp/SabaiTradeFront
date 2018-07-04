import { Injectable } from '@angular/core';
import {Http, Response, Headers, RequestOptions, RequestMethod } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
// import 'rxjs/add/operator/toPromise';
import 'rxjs/add/observable/throw';
import { environment } from 'environments/environment';

import { Router } from '@angular/router';
import { Member } from '../models/member';
declare var swal: any;

@Injectable()
export class PagesService {

    constructor(private http: Http, private router: Router) { }

    getMember(id: string) {
        const headerOptions = new Headers({ 'Content-Type': 'application/json' });
        const requestOptions = new RequestOptions({method: RequestMethod.Get, headers: headerOptions });
        return this.http.get(environment.url_static_api + '/api/members/' + id, requestOptions).map(x => x.json());
    }

    putMemberVerify(memberRef: string) {
        const body = {
            MemberRef: memberRef
        };
        const headerOptions = new Headers({ 'Content-Type': 'application/json' });
        const requestOptions = new RequestOptions({method: RequestMethod.Get, headers: headerOptions });
        return this.http.put(environment.url_static_api + '/api/members/' + 'verify', body, requestOptions).map(x => x.json());
    }

      putMemberUploadImage(member: Member) {
        console.log('putMemberUploadImage');
        console.log(member);
        const body = {
            MemberRef: member.memberRef,
            ImagePassport: member.imagePassport,
            ImageBookBank: member.imageBookBank
        };
        const headerOptions = new Headers({ 'Content-Type': 'application/json' });
        const requestOptions = new RequestOptions({method: RequestMethod.Get, headers: headerOptions });
        return this.http.put(environment.url_static_api + '/api/members/' + 'uploadImage', body, requestOptions).map(x => x.json());
    }

    postMember(firstname: string, lastname: string, address: string, email: string, telephone: string, password: string) {
        const body = {
            Firstname: firstname,
            Lastname: lastname,
            Address: address,
            Email: email,
            Telephone: telephone,
            Password: password
        };
        const headerOptions = new Headers({ 'Content-Type': 'application/json' });
        const requestOptions = new RequestOptions({
            method: RequestMethod.Post,
            headers: headerOptions
        });
        return this.http
            .post(environment.url_static_api + '/api/members', body, requestOptions)
            .map(x => x.json());
    }

    showError(err: string) {
        swal({
            type: 'warning',
            title: 'Register Fail!',
            text: err,
            buttonsStyling: false,
            confirmButtonClass: 'btn btn-warning'
        }).then((result) => {
            // debugger;
            // this.router.navigate(['/pages/register']);
        }
        );
    }

    postAsset(
        memberRef: string, assetType: string, amount: number, createBy: string) {
        const body = {
            MemberRef: memberRef,
            AssetType: assetType,
            Amount: amount,
            CreateBy: createBy
        };
        const headerOptions = new Headers({ 'Content-Type': 'application/json' });
        const requestOptions = new RequestOptions({
            method: RequestMethod.Post, headers: headerOptions
        });
        return this.http
            .post(environment.url_static_api + '/api/assets', body, requestOptions)
            .map(x => x.json());
    }

    getLogin(email: string, password: string) {
        const headerOptions = new Headers({ 'Content-Type': 'application/json' });
        const requestOptions = new RequestOptions({method: RequestMethod.Get, headers: headerOptions });
        return this.http
        .get(environment.url_static_api + '/api/members/login|' + email + '|' + password, requestOptions)
        .map(x => x.json()).catch(this.handleError);
    }

    getMember2(id: string) {
        const headerOptions = new Headers({ 'Content-Type': 'application/json' });
        const requestOptions = new RequestOptions({method: RequestMethod.Get, headers: headerOptions });
        return this.http.get(environment.url_static_api + '/api/members/' + id, requestOptions).map(x => x.json());
    }

    private handleError(error: any) {
        // return Observable.throw(error.json() || 'Server Error');
        return Observable.throw('Server Error');
    }

  // new api (nodejs)
    registerMember(firstname: string, lastname: string, address: string, email: string, telephone: string, password: string) {
    const body = {
        FirstName: firstname,
        LastName: lastname,
        Address: address,
        Email: email,
        Telephone: telephone,
        Password: password
    };
    const headerOptions = new Headers({ 'Content-Type': 'application/json' });
    const requestOptions = new RequestOptions({
      method: RequestMethod.Post,
      headers: headerOptions
    });
    return this.http
      .post(environment.node_static_url + '/api/member', body, requestOptions)
      .map(x => x.json())
      .catch(this.handleError);
  }

}
