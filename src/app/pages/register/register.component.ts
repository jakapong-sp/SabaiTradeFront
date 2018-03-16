import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth.service';
import { ReactiveFormsModule, FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { PagesService } from '../pages.service';
import { Router } from '@angular/router';
declare const $: any;
declare var swal: any;

@Component({
    selector: 'app-register-cmp',
    templateUrl: './register.component.html'
})

export class RegisterComponent implements OnInit {
    date: Date = new Date();
    userForm: FormGroup;
    emailSignup: string;
    passwordSignup: string;
    address: string;
    emailPattern = '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$';

    showNotification(from: any, align: any, msg: string) {
        $.notify({
            icon: 'notifications', message: msg
        }, {
                type: 'success', timer: 30000, placement: {
                    from: from, align: align
                }
            });
    }

    constructor(private fb: FormBuilder, private auth: AuthService, private router: Router, private ps: PagesService) { }
    ngOnInit() {
        this.buildForm();
    }
    buildForm(): void {
        this.userForm = new FormGroup({
            emailSignup: new FormControl('', [
                Validators.required,
                Validators.email // ,  Validators.pattern(this.emailPattern)
            ]),
            passwordSignup: new FormControl('', [
                Validators.required,
                Validators.pattern('^[A-Za-z ][A-Za-z0-9!@#$%^&* ]*$'),
                Validators.minLength(6),
                Validators.maxLength(25)
            ]),
            address: new FormControl('', [
                Validators.required
            ]),
            firstname: new FormControl('', [
                Validators.required
            ]),
            lastname: new FormControl('', [
                Validators.required
            ]),
            telephone: new FormControl('', [
                Validators.required
            ])
        });
    }
    // signup(): void {
    //     const memberRef = this.auth.emailSignUp(
    //         this.userForm.value.emailSignup,
    //         this.userForm.value.passwordSignup,
    //         this.userForm.value.address,
    //         this.userForm.value.firstname,
    //         this.userForm.value.lastname,
    //         this.userForm.value.telephone
    //     );
    //     if (memberRef !== '') {
    //         debugger;
    //         this.ps.postMember(memberRef, '', this.userForm.value.firstname, this.userForm.value.lastname,
    //             this.userForm.value.address, this.userForm.value.emailSignup, this.userForm.value.telephone, memberRef
    //         ).subscribe(data => {
    //             // for test
    //             this.ps.postAsset(memberRef, 'Deposit', 10000, 'U0001').subscribe();
    //             swal({
    //                 type: 'success',
    //                 title: 'Register Success!',
    //                 text: 'Please verify email address and login again',
    //                 buttonsStyling: false,
    //                 confirmButtonClass: 'btn btn-success'
    //             }).then((result) => {
    //                      this.auth.signOut();
    //                     // this.router.navigate(['/pages/login']);
    //             }
    //             );
    //         });
    //     }else {
    //         // swal({
    //         //     type: 'warning',
    //         //     title: 'Register Fail!',
    //         //     text: 'Please contact admin sabai trade',
    //         //     buttonsStyling: false,
    //         //     confirmButtonClass: 'btn btn-warning'
    //         // }).then((result) => {
    //         //         this.router.navigate(['/pages/register']);
    //         // }
    //         // );
    //     }
    // }
    signup(): void {
        this.ps.postMember(
            this.userForm.value.firstname, this.userForm.value.lastname, this.userForm.value.address,
            this.userForm.value.emailSignup, this.userForm.value.telephone, this.userForm.value.passwordSignup
        )
        .subscribe(data => {
            // for test asset
            this.ps.postAsset(data.memberRef, 'Deposit', 10000, 'U0001').subscribe();
                swal({
                    type: 'success',
                    title: 'Register Success!',
                    text: 'Please verify email address and login again',
                    buttonsStyling: false,
                    confirmButtonClass: 'btn btn-success'
                }).then((result) => {
                         this.auth.signOut();
                        // this.router.navigate(['/pages/login']);
                }
                );
            });
    }
    signup2(): void {
        this.ps.postMember( this.userForm.value.firstname, this.userForm.value.firstname,
            this.userForm.value.address, this.userForm.value.email, this.userForm.value.telephone, ''
        ).subscribe(data => {
            this.showNotification('top', 'center', 'Send order success');
        });
    }
}
