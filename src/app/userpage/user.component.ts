import { Component, OnInit } from '@angular/core';
import { ServerService } from '../server.service';

import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Member } from './../models/member';
import { PagesService } from '../pages/pages.service';
import { ActivatedRoute, Router } from '@angular/router';

declare const $: any;
declare var swal: any;
@Component({
    selector: 'app-user-cmp',
    templateUrl: 'user.component.html'
})

export class UserComponent implements OnInit {


    node_static_url = environment.node_static_url + '/images/'; // must set in ts file
    public member: Member;
    memberRef: string;
    public hasImageBB: boolean;
    public hasImagePS: boolean;


    constructor(private server: ServerService, private pages: PagesService, private route: ActivatedRoute, router: Router) {
        this.member = new Member();
    }

    ngOnInit() {
        // this.route.params.subscribe(params => {
        //     this.memberRef = params['id'];

        // });
        this.memberRef = JSON.parse(localStorage.getItem('profile')).userid;
        debugger;
        this.pages.getMember(this.memberRef).subscribe(data => {
            if (data.imagePassport === null || data.imagePassport === '') {
                this.hasImagePS = false;
            } else {
                this.hasImagePS = true;
            }
            if (data.imageBookBank === null || data.imageBookBank === '') {
                this.hasImageBB = false;
            } else {
                this.hasImageBB = true;
            }
            this.member = data;
            console.log(this.member);
        });
    }

    onSubmit() {
        this.pages.putMemberUploadImage(this.member).subscribe(data => {
            swal({
                type: 'success',
                title: 'Success!',
                text: 'Upload Files Success!',
                buttonsStyling: false,
                confirmButtonClass: 'btn btn-success'
            }).then((result) => {
                // this.router.navigate(['/pages/login']);
            }
            );
        });
    }


    getUploadFileBB(event) {
        const formData = new FormData();
        formData.append('filetoupload', event.target.files[0]);
        this.server.getUploadFile(formData).subscribe(result => {
            console.log(result[0].name);
            this.member.imageBookBank = result[0].name;
        });
    }
    getUploadFilePS(event) {
        const formData = new FormData();
        formData.append('filetoupload', event.target.files[0]);
        this.server.getUploadFile(formData).subscribe(result => {
            console.log(result[0].name);
            this.member.imagePassport = result[0].name;
        });
    }
}

