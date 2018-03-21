import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../app.module';

import { HistoryComponent } from './history.component';
import { HistoryRoutes } from './history.routing';
import { ChannelService,  ChannelConfig,  SignalrWindow } from '../trades/shared/channel.service';
import { FormsModule } from '@angular/forms';
import { environment } from 'environments/environment';

export function createChannelConfig() {
    const channelConfig = new ChannelConfig();
    channelConfig.url = environment.url_feed;
    channelConfig.hubName = 'EventHub';
    return channelConfig;
  }

@NgModule({
    imports: [
        RouterModule.forChild(HistoryRoutes),
        CommonModule,
        MaterialModule,
        FormsModule
    ],
    declarations: [HistoryComponent ],
    providers: [
      ChannelService,
      { provide: SignalrWindow, useValue: window },
      { provide: 'channel.config', useFactory: createChannelConfig }
    ]
})

export class HistoryModule {}
