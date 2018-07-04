import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PagesService } from '../pages.service';

declare const $: any;
declare var swal: any;

@Component({
  selector: 'app-register-verify',
  templateUrl: './register-verify.component.html'
})
export class RegisterVerifyComponent implements OnInit {

  public verifyPage: boolean;
  showNotification(from: any, align: any, msg: string) {
    $.notify({
      icon: 'notifications', message: msg
    }, {
        type: 'success', timer: 1000, placement: {
          from: from, align: align
        }
      });
  }
  constructor(private route: ActivatedRoute, private router: Router, private pages: PagesService) { }
  ngOnInit() {
    this.verifyPage = false;
    this.route.queryParams.subscribe(params => {
      const id = params['regKey'];
      this.pages.putMemberVerify(id).subscribe(data => {
        debugger;
        if (data === null) {
          this.verifyPage = false;
        }else {
          this.verifyPage = true;
        }
        // swal({
        //   type: 'success',
        //   title: 'Verify Success!',
        //   text: 'Please login to do next step',
        //   buttonsStyling: false,
        //   confirmButtonClass: 'btn btn-success'
        // }).then((result) => {
        //   this.router.navigate(['/pages/member-review/' + id]);
        // }
        // );
      });
    });
  }

}
