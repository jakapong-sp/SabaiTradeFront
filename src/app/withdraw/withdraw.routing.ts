import { Routes } from '@angular/router';
import { WithdrawComponent } from './withdraw.component';
import { SecuredRouteGuard } from '../secured-route.guard';

export const WithdrawRoutes: Routes = [
    {

      path: '',
      children: [ {
        path: '',
        component: WithdrawComponent,
        canActivate: [SecuredRouteGuard]
    }]
}
];
