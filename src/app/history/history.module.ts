import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../app.module';

import { HistoryComponent } from './history.component';
import { HistoryRoutes } from './history.routing';
import { FormsModule } from '@angular/forms';
import { environment } from 'environments/environment';



@NgModule({
    imports: [
        RouterModule.forChild(HistoryRoutes),
        CommonModule,
        MaterialModule,
        FormsModule
    ],
    declarations: [HistoryComponent ]
})

export class HistoryModule {}
