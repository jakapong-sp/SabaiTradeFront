import { Inject, Injectable } from '@angular/core';
import { HubConnection } from '@aspnet/signalr';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Asset } from '../models/asset.model';

@Injectable()
export class WithdrawSignalRService {
    private withdrawMessageHub: HubConnection;

    private addObservable: ReplaySubject<Asset>;
    private updateObservable: ReplaySubject<Asset>;
    private removeObservable: ReplaySubject<number>;

    public withdrawAddedEvent = () => this.addObservable.asObservable();
    public withdrawUpdatedEvent = () => this.updateObservable.asObservable();
    public withdrawDeletedEvent = () => this.removeObservable.asObservable();

    constructor( @Inject('203.0.0.1') private baseUrl: string) {
        console.log(baseUrl);

        let url = baseUrl + 'WithdrawMessageHub';

        this.withdrawMessageHub = new HubConnection(url);
        this.addObservable = new ReplaySubject<Asset>();
        this.updateObservable = new ReplaySubject<Asset>();
        this.removeObservable = new ReplaySubject<number>();
    }

    public startConnection(): void {
        if (typeof window !== 'undefined') {
            this.start();
        }
    }

    private start() {
        this.withdrawMessageHub.start().then(
            () => {
                console.log('SignalR connected was established.');

                this.withdrawMessageHub.on('WithdrawAdded',
                    data => {
                        const asset = new Asset();
                        asset.AssetRef = data.AssetRef;
                        asset.AmountRequest = data.AmountRequest;

                        this.withdrawAdded(asset);
                    });
            }
        );
    }

    public addWithdraw(asset: Asset) {
        this.withdrawMessageHub.invoke('addWithdraw', asset);
    }

    private withdrawAdded(asset: Asset): void {
        this.addObservable.next(asset);
    }

}