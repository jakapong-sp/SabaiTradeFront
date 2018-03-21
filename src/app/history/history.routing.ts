import { Routes } from '@angular/router';
import { HistoryComponent } from './history.component';
import { SecuredRouteGuard } from '../secured-route.guard';

export const HistoryRoutes: Routes = [
    {

      path: '',
      children: [ {
        path: '',
        component: HistoryComponent,
        canActivate: [SecuredRouteGuard]
    }]
}
];
