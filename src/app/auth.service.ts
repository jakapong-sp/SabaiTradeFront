import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AngularFireDatabase, AngularFireObject } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { AngularFireList } from 'angularfire2/database/interfaces';
import { PagesService } from './pages/pages.service';

@Injectable()
export class AuthService {
  authState: any = null;
  userRef: AngularFireObject<any>;
  constructor(private afAuth: AngularFireAuth,
    private db: AngularFireDatabase,
    private router: Router,
    private pages: PagesService) {
    this.afAuth.authState.subscribe((auth) => {
      this.authState = auth;
    });
  }
  get authenticated(): boolean {
    return this.authState !== null;
  }
  get currentUser(): any {
    return this.authenticated ? this.authState : null;
  }
  get currentUserObservable(): any {
    return this.afAuth.authState;
  }
  get currentUserId(): string {
    return this.authenticated ? this.authState.uid : '';
  }
  get currentUserAnonymous(): boolean {
    return this.authenticated ? this.authState.isAnonymous : false;
  }
  get currentUserDisplayName(): string {
    if (!this.authState) {
      return 'Guest';
    } else if (this.currentUserAnonymous) {
      return 'Anonymous';
    } else {
      return this.authState['displayName'] || 'User without a Name';
    }
  }
  githubLogin() {
    const provider = new firebase.auth.GithubAuthProvider();
    return this.socialSignIn(provider);
  }
  googleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();
    return this.socialSignIn(provider);
  }
  facebookLogin() {
    const provider = new firebase.auth.FacebookAuthProvider();
    return this.socialSignIn(provider);
  }
  twitterLogin() {
    const provider = new firebase.auth.TwitterAuthProvider();
    return this.socialSignIn(provider);
  }
  private socialSignIn(provider) {
    return this.afAuth.auth.signInWithPopup(provider)
      .then((credential) => {
        console.log(credential.user);
        this.authState = credential.user;
        this.updateUserData();
        this.router.navigate(['/']);
      })
      .catch(error => console.log(error));
  }
  anonymousLogin() {
    return this.afAuth.auth.signInAnonymously()
      .then((user) => {
        this.authState = user;
        this.router.navigate(['/']);
      })
      .catch(error => console.log(error));
  }
  emailSignUp(email: string, password: string, address: string, firstname: string, lastname: string, telephone: string) {
    this.afAuth.auth.createUserWithEmailAndPassword(email, password)
      .then((user) => {
        user.address = address;
        user.firstname = firstname;
        user.lastname = lastname;
        user.telephone = telephone;
        user.name = '';
        this.authState = user;
      })
      .catch(error => {
        // console.log(error);
        // catch work after show dialog so then show error after
        this.pages.showError(error.message);
      });
    debugger;
    return this.currentUserId;
  }

  emailSignUp2(email: string, password: string, address: string, firstname: string, lastname: string, telephone: string) {
    this.afAuth.auth.createUserWithEmailAndPassword(email, password)
      .then((user) => {
        user.address = address;
        user.firstname = firstname;
        user.lastname = lastname;
        user.telephone = telephone;
        user.name = '';
        this.authState = user;
      })
      .catch(error => {
        console.log(error);
        return error;
      });
    return this.currentUserId;
  }


  emailLogin(email: string, password: string) {
    return this.afAuth.auth.signInWithEmailAndPassword(email, password)
      .then((user) => {
        this.authState = user;
        this.updateUserData();
        console.log('login**************');
      })
      .catch(error => console.log(error));

  }
  resetPassword(email: string) {
    const fbAuth = firebase.auth();
    return fbAuth.sendPasswordResetEmail(email)
      .then(() => console.log('email sent'))
      .catch((error) => console.log(error));
  }
  getCurrentLoggedIn() {
    this.afAuth.authState.subscribe(auth => {
      if (auth) {
        this.router.navigate(['/trades']);
      }
    });
  }
  signOut(): void {
    localStorage.removeItem('profile');
    localStorage.removeItem('logined');
    // this.afAuth.auth.signOut();
    this.router.navigate(['/pages/login']);
  }
  private updateUserData(): void {
    const path = `users/${this.currentUserId}`; // Endpoint on firebase
    const userRef: AngularFireObject<any> = this.db.object(path);
    const data = {
      userid: this.currentUserId,
      email: this.authState.email,
      name: this.authState.displayName,
      address: this.authState.address,
      firstname: this.authState.firstname,
      telephone: this.authState.telephone
    };

    localStorage.setItem('profile', JSON.stringify(data));
    console.log(data);

    this.pages.getMember(data.userid).subscribe((member) => {
      console.log(member);
      if (member.verify === true) {
        this.router.navigate(['/trades']);
      }else {
        this.router.navigate(['/pages/member-review']);
      }
    });

    userRef.update(data)
      .catch(error => console.log(error));
  }


}
