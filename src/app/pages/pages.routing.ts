import { Routes } from '@angular/router';

import { RegisterComponent } from './register/register.component';
import { PricingComponent } from './pricing/pricing.component';
import { LockComponent } from './lock/lock.component';
import { LoginComponent } from './login/login.component';
import { MemberReviewComponent } from './member-review/member-review.component';
import { RegisterVerifyComponent } from './register-verify/register-verify.component';

export const PagesRoutes: Routes = [

    {
        path: '',
        children: [ {
            path: 'login',
            component: LoginComponent
        }, {
            path: 'lock',
            component: LockComponent
        }, {
            path: 'register',
            component: RegisterComponent
        }, {
            path: 'pricing',
            component: PricingComponent
        }, {
            path: 'member-review/:id',
            component: MemberReviewComponent
        }, {
            path: 'register-verify',
            component: RegisterVerifyComponent
        }
    ]
    }
];
