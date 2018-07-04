import { Injectable, Inject } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

export class SignalrWindow extends Window {
    $: any;
}

export enum ConnectionState {
    Connecting = 1,
    Connected = 2,
    Reconnecting = 3,
    Disconnected = 4
}

export class ChannelConfig {
    url: string;
    hubName: string;
    channel: string;

    constructor() {
    }
}

export class ChannelEvent {
    Name: string;
    ChannelName: string;
    Timestamp: Date;
    Data: any;
    Order: any;
    Json: string;
    Folio: any;

    constructor() {
        this.Timestamp = new Date();
    }
}

class ChannelSubject {
    channel: string;
    subject: Subject<ChannelEvent>;
}

export class SpotData {
    bid: string;
    ask: string;
}

@Injectable()
export class ChannelService {

    starting$: Observable<any>;

    connectionState$: Observable<ConnectionState>;

    error$: Observable<string>;

    private connectionStateSubject = new Subject<ConnectionState>();
    private startingSubject = new Subject<any>();
    private errorSubject = new Subject<any>();

    private hubConnection: any;
    public hubProxy: any;

    private subjects = new Array<ChannelSubject>();
    private profile: any;

    constructor(
        @Inject(SignalrWindow) private window: SignalrWindow,
        @Inject('channel.config') private channelConfig: ChannelConfig
    ) {
        if (this.window.$ === undefined || this.window.$.hubConnection === undefined) {
            throw new Error(`
            The variable '$' or the .hubConnection() function are not defined...please check the SignalR scripts have been loaded properly
            `);
        }
        this.connectionState$ = this.connectionStateSubject.asObservable();
        this.error$ = this.errorSubject.asObservable();
        this.starting$ = this.startingSubject.asObservable();

        this.hubConnection = this.window.$.hubConnection();
        this.hubConnection.url = channelConfig.url;
        this.hubProxy = this.hubConnection.createHubProxy(channelConfig.hubName);

        this.hubConnection.stateChanged((state: any) => {
            let newState = ConnectionState.Connecting;
            switch (state.newState) {
                case this.window.$.signalR.connectionState.connecting:
                    newState = ConnectionState.Connecting;
                    break;
                case this.window.$.signalR.connectionState.connected:
                    newState = ConnectionState.Connected;
                    break;
                case this.window.$.signalR.connectionState.reconnecting:
                    newState = ConnectionState.Reconnecting;
                    break;
                case this.window.$.signalR.connectionState.disconnected:
                    newState = ConnectionState.Disconnected;
                    break;
            }
            this.connectionStateSubject.next(newState);
        });
        this.hubConnection.error((error: any) => {
            this.errorSubject.next(error);
        });
        this.hubProxy.on('onEvent', (channel: string, ev: ChannelEvent) => {
            const channelSub = this.subjects.find((x: ChannelSubject) => {
                return x.channel === channel;
            }) as ChannelSubject;

            if (channelSub !== undefined) {
                return channelSub.subject.next(ev);
            }
        });
    }

    start(): void {
        this.hubConnection.start()
            .done(() => {
                this.startingSubject.next();
            })
            .fail((error: any) => {
                this.startingSubject.error(error);
            });
    }

    sub(channel: string): Observable<ChannelEvent> {

        let channelSub = this.subjects.find((x: ChannelSubject) => {
            return x.channel === channel;
        }) as ChannelSubject;

        if (channelSub !== undefined) {
            console.log(`Found existing observable for ${channel} channel`);
            return channelSub.subject.asObservable();
        }

        channelSub = new ChannelSubject();
        channelSub.channel = channel;
        channelSub.subject = new Subject<ChannelEvent>();
        this.subjects.push(channelSub);

        this.starting$.subscribe(() => {
            this.profile = JSON.parse(localStorage.getItem('profile'));
            console.log(this.profile);

            this.hubProxy.invoke('SubscribeMember', channel, this.profile.userid)
                .done(() => {
                    console.log(`Successfully subscribed to ${channel} channel`);
                })
                .fail((error: any) => {
                    channelSub.subject.error(error);
                });
        },
            (error: any) => {
                channelSub.subject.error(error);
            });

        return channelSub.subject.asObservable();
    }

    publish(ev: ChannelEvent): void {
        this.hubProxy.invoke('Publish', ev);
    }

}