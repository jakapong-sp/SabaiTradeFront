import { Component, OnInit } from '@angular/core';
import { ServerService } from '../../server.service';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Member } from '../../models/member';
import { PagesService } from '../pages.service';
import { ActivatedRoute, Router } from '@angular/router';

declare const $: any;
declare var swal: any;
@Component({
    selector: 'app-member-review',
    templateUrl: './member-review.component.html'
})
export class MemberReviewComponent implements OnInit {

    node_static_url = environment.node_static_url + '/images/'; // must set in ts file
    public member: Member;
    memberRef: string;
    public hasImageBB: boolean;
    public hasImagePS: boolean;

    showNotification(from: any, align: any, msg: string) {
        $.notify({
            icon: 'notifications', message: msg
        }, {
                type: 'success', timer: 1000, placement: {
                    from: from, align: align
                }
            });
    }

    constructor(private server: ServerService, private pages: PagesService, private route: ActivatedRoute, private router: Router) {
        this.member = new Member();
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.memberRef = params['id'];
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
                this.router.navigate(['/pages/login']);
            }
            );
        });
    }

    getUploadFileBB(event) {
        const formData = new FormData();
        formData.append('filetoupload', event.target.files[0]);
        this.server.getUploadFile(formData).subscribe(result => {
            this.member.imageBookBank = result.statusText;
        });
    }
    getUploadFilePS(event) {
        const formData = new FormData();
        formData.append('filetoupload', event.target.files[0]);
        this.server.getUploadFile(formData).subscribe(result => {
            this.member.imagePassport = result.statusText;
        });
    }
}
