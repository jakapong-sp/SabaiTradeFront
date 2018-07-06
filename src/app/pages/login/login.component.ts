import { Component, OnInit, ElementRef } from '@angular/core';
import { AuthService } from '../../auth.service';
import {
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  FormControl,
  Validators
} from '@angular/forms';
import { PagesService } from '../pages.service';
import { Router } from '@angular/router';

declare var $: any;

@Component({
  selector: 'app-login-cmp',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  date: Date = new Date();
  private toggleButton: any;
  private sidebarVisible: boolean;
  private nativeElement: Node;
  loginForm: FormGroup;

  // add myself
  loginFeedback: any;
  profile: any;
  isLogin: boolean;
  isError: boolean;
  errorMsg: string;

  constructor(
    private element: ElementRef,
    private fb: FormBuilder,
    private auth: AuthService,
    private ps: PagesService,
    private router: Router
  ) {
    this.nativeElement = element.nativeElement;
    this.sidebarVisible = false;
    // auth.getCurrentLoggedIn();
  }

  ngOnInit() {
    const navbar: HTMLElement = this.element.nativeElement;
    this.toggleButton = navbar.getElementsByClassName('navbar-toggle')[0];
    this.isError = false;
    setTimeout(function() {
      // after 1000 ms we add the class animated to the login/register card
      $('.card').removeClass('card-hidden');
    }, 700);
    this.buildForm();

    const profile = localStorage.getItem('profile');
    if (profile) {
      this.isLogin = true;
      this.profile = JSON.parse(profile);
    }
  }
  sidebarToggle() {
    const toggleButton = this.toggleButton;
    const body = document.getElementsByTagName('body')[0];
    const sidebar = document.getElementsByClassName('navbar-collapse')[0];
    if (this.sidebarVisible === false) {
      setTimeout(function() {
        toggleButton.classList.add('toggled');
      }, 500);
      body.classList.add('nav-open');
      this.sidebarVisible = true;
    } else {
      this.toggleButton.classList.remove('toggled');
      this.sidebarVisible = false;
      body.classList.remove('nav-open');
    }
  }

  buildForm(): void {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.pattern('^(?=.*[0–9])(?=.*[a-zA-Z])([a-zA-Z0–9]+)$'),
        Validators.minLength(6),
        Validators.maxLength(25)
      ])
    });
  }
  login(): void {
    // this.ps
    //   .getLogin(this.loginForm.value.email, this.loginForm.value.password)
    //   .subscribe(member => {
    //     debugger;
    //     if (member === null) {
    //       this.errorMsg = 'email or password is not correct';
    //       this.isError = true;
    //     } else {
    //       if (member.verify === false) {
    //         this.errorMsg = 'email or password is not correct';
    //         this.isError = true;
    //       } else if (member.active === false) {
    //         this.router.navigate(['/pages/member-review/' + member.memberRef]);
    //       } else {
    //         const data = {
    //           userid: member.memberRef,
    //           memberref: member.memberRef,
    //           email: member.email,
    //           firstname: member.firstName,
    //           lastname: member.lastName,
    //           role: 'Admin'
    //         };
    //         localStorage.setItem('profile', JSON.stringify(data));
    //         localStorage.setItem('logined', 'true');
    //         this.router.navigate(['/trades']);
    //       }
    //     }
    //   }, error => (this.errorMsg = <any>error));
    this.ps
    .loginMember(this.loginForm.value.email, this.loginForm.value.password)
    .subscribe(member => {
      if (member === null) {
        this.errorMsg = 'email or password is not correct';
        this.isError = true;
      } else {
        if (member.Verify === false) {
          this.errorMsg = 'email or password is not correct';
          this.isError = true;
        } else if (member.Active === false) {
          this.router.navigate(['/pages/member-review/' + member.MemberRef]);
        } else {
          const data = {
            userid: member.MemberRef,
            memberref: member.MemberRef,
            email: member.Email,
            firstname: member.FirstName,
            lastname: member.LastName,
            role: 'Admin'
          };
          localStorage.setItem('profile', JSON.stringify(data));
          localStorage.setItem('logined', 'true');
          this.router.navigate(['/trades']);
        }
      }
    }, error => (this.errorMsg = <any>error));   
  }
}
