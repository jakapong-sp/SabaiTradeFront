import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../app.module';

import { TradesComponent } from './trades.component';
import { TradesRoutes } from './trades.routing';
import { ChannelService,  ChannelConfig,  SignalrWindow } from './shared/channel.service';
import { CapitalizePipe } from './shared/trades.pipe';
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
        RouterModule.forChild(TradesRoutes),
        CommonModule,
        MaterialModule,
        FormsModule
    ],
    declarations: [TradesComponent, CapitalizePipe ],
    providers: [
      ChannelService,
      { provide: SignalrWindow, useValue: window },
      { provide: 'channel.config', useFactory: createChannelConfig }
    ]
})

export class TradesModule {}
