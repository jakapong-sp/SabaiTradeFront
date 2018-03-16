import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';

import { AngularFireAuth } from 'angularfire2/auth';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';

@Injectable()
export class SecuredRouteGuard implements CanActivate {

  constructor(private router: Router, private afAuth: AngularFireAuth) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    const isLoggedin = localStorage.getItem('logined');
    if (isLoggedin === 'true') {
      return true;
    } else {
      this.router.navigate(['/pages/login']);
      // return false;
    }

    // return this.afAuth.authState
    //   .take(1)
    //   .map(user => !!user)
    //   .do(loggedIn => {
    //     if (!loggedIn) {
    //       this.router.navigate(['/pages/login']);
    //     }
    //   });

  }
}
