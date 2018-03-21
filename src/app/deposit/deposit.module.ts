import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../app.module';

import { DepositComponent } from './deposit.component';
import { DepositRoutes } from './deposit.routing';
import { FormsModule } from '@angular/forms';
import { environment } from 'environments/environment';

@NgModule({
    imports: [
        RouterModule.forChild(DepositRoutes),
        CommonModule,
        MaterialModule,
        FormsModule
    ],
    declarations: [DepositComponent ]
})

export class DepositModule {}
