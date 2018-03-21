import { Routes } from '@angular/router';
import { DepositComponent } from './deposit.component';
import { SecuredRouteGuard } from '../secured-route.guard';

export const DepositRoutes: Routes = [
    {

      path: '',
      children: [ {
        path: '',
        component: DepositComponent,
        canActivate: [SecuredRouteGuard]
    }]
}
];
