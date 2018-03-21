import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../app.module';

import { WithdrawComponent } from './withdraw.component';
import { WithdrawRoutes } from './withdraw.routing';
import { FormsModule } from '@angular/forms';
import { environment } from 'environments/environment';

@NgModule({
    imports: [
        RouterModule.forChild(WithdrawRoutes),
        CommonModule,
        MaterialModule,
        FormsModule
    ],
    declarations: [WithdrawComponent ]
})

export class WithdrawModule {}
