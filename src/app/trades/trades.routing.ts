import { Routes } from '@angular/router';
import { TradesComponent } from './trades.component';
import { SecuredRouteGuard } from '../secured-route.guard';

export const TradesRoutes: Routes = [
    {

      path: '',
      children: [ {
        path: '',
        component: TradesComponent,
        canActivate: [SecuredRouteGuard]
    }]
}
];
