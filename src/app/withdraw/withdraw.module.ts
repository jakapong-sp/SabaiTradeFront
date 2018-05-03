import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../app.module';

import { WithdrawComponent } from './withdraw.component';
import { WithdrawRoutes } from './withdraw.routing';
import { FormsModule } from '@angular/forms';
import { environment } from 'environments/environment';
import { ChannelService,  ChannelConfig,  SignalrWindow } from '../trades/shared/channel.service';

export function createChannelConfig() {
    const channelConfig = new ChannelConfig();
    channelConfig.url = environment.url_feed;
    channelConfig.hubName = 'EventHub';
    return channelConfig;
  }

@NgModule({
    imports: [
        RouterModule.forChild(WithdrawRoutes),
        CommonModule,
        MaterialModule,
        FormsModule
    ],
    declarations: [WithdrawComponent ],
    providers: [
      ChannelService,
      { provide: SignalrWindow, useValue: window },
      { provide: 'channel.config', useFactory: createChannelConfig }
    ]
})

export class WithdrawModule {}
