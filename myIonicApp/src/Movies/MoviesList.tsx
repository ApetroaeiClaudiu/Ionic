import React, {useContext, useEffect, useState} from 'react';
import {Redirect, RouteComponentProps} from 'react-router';
import {
    IonButton, IonCheckbox,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon, IonInfiniteScroll, IonInfiniteScrollContent,
    IonLabel,
    IonList,
    IonLoading,
    IonPage, IonRow, IonSearchbar, IonSelect, IonSelectOption,
    IonTitle,
    IonToast,
    IonToolbar, useIonViewDidEnter, useIonViewWillEnter
} from '@ionic/react';
import {add} from 'ionicons/icons';
import {getLogger} from '../core';
import {AuthContext} from "../auth";
import { MovieContext } from './MovieProvider';
import Movie from './Movie';
import { Network } from '@capacitor/core';

const log = getLogger('ItemList');
// Here starts the magic.
const size = 20;
let offset = 0;
let remaining = 5;
let currentVal: boolean | undefined = undefined;
let searchName: string = '';
// Here ends the magic.

const MoviesList: React.FC<RouteComponentProps> = ({history}) => {
    const [disableInfiniteScroll, setDisableInfiniteScroll] = useState<boolean>(false);
    const {movies, fetching, fetchingError, _deleteMovie, fetchMovies, reloadMovies} = useContext(MovieContext);
    const [status,setStatus] = useState<boolean>(true);
    Network.getStatus().then(status => setStatus(status.connected));
    
    const {connectedNetworkStatus, savedOffline, setSavedOffline} = useContext(MovieContext);
    const {conflictMovies} = useContext(MovieContext);
    useEffect(conflictMoviesEffect,[conflictMovies]);

    const {token, logout} = useContext(AuthContext);
    const [filter, setFilter] = useState<string | undefined>(undefined);

    Network.addListener('networkStatusChange',async(status)=>{
        setStatus(status.connected);
    });

    function conflictMoviesEffect(){
        console.log("IN CONFLICT EFFECT");
        if(conflictMovies && conflictMovies.length>0){
            console.log("REDIRECTIONAM CATRE CONFLICT");
            history.push('/movies/conflict');
        }
    }

    useIonViewDidEnter(async () => {
        //console.log('[useIon] calling fetch');
        remaining--;
        if(remaining === 0)
            await fetchMovies?.(offset, size, undefined, searchName);
    });

    async function searchNext($event: CustomEvent<void>) {
        offset = offset + size;
        //console.log('[SearchNext] calling fetch with offset=', offset);
        await fetchMovies?.(offset, size, currentVal, searchName);
        ($event.target as HTMLIonInfiniteScrollElement).complete();
    }
    async function selectVal(val: string){
        setFilter(val);
        if(val === 'any')
            currentVal = undefined;
        else
            currentVal = val === "yes";
        await reloadMovies?.(offset, size, currentVal, searchName);
    }

    async function typeSearchName(val: string){
        searchName = val;
        await reloadMovies?.(offset, size, currentVal, searchName);
    }

    const handleLogout = () => {
        logout?.();
        return <Redirect to={{pathname: "/login"}}/>;
    };

    const ceva = () =>{

    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>My App</IonTitle>
                    <IonButton class="ion-margin-end" onClick={handleLogout}>Logout</IonButton>
                    <IonLabel>
                        Connection is : {status?"connected":"disconnected"}
                    </IonLabel>
                    <IonSelect value={filter} placeholder={"Select a filter"} onIonChange={e => selectVal(e.detail.value)}>
                        <IonSelectOption value="any">Any</IonSelectOption>
                        <IonSelectOption value="yes">Yes</IonSelectOption>
                        <IonSelectOption value="no">No</IonSelectOption>
                    </IonSelect>
                    <IonSearchbar
                        value={searchName}
                        debounce={1000}
                        onIonChange={e => typeSearchName(e.detail.value!)}>
                    </IonSearchbar>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonLoading isOpen={fetching} message="Fetching movies"/>
                {movies && (
                    <IonList>
                        {
                            movies.map(({_id,title,director,year,treiD,price,userId,version,webViewPath,lat,lng}) =>
                                <Movie key={_id} _id={_id} title={title} director={director} year={year} treiD={treiD} price={price} userId={userId} version={version} webViewPath={webViewPath} lat={lat} lng={lng}
                                      onEdit={_id => history.push(`/movie/${_id}`)} onDelete={_id => {
                                    _deleteMovie && _deleteMovie({_id: _id, title: title, director: director,year:year, treiD: treiD, price:price,userId:userId,version:version,webViewPath:webViewPath,lat:lat,lng:lng});
                                }}/>
                            )
                        }
                        <IonInfiniteScroll threshold="10px" disabled={disableInfiniteScroll}
                                           onIonInfinite={(e: CustomEvent<void>) => searchNext(e)}>
                            <IonInfiniteScrollContent
                                loadingText="Loading more items...">
                            </IonInfiniteScrollContent>
                        </IonInfiniteScroll>

                    </IonList>
                )}
                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={() => history.push('/movie')}>
                        <IonIcon icon={add}/>
                    </IonFabButton>
                </IonFab>
                <IonToast
                    isOpen={savedOffline ? savedOffline : false}
                    onDidDismiss={() => setSavedOffline ? setSavedOffline(false) : ceva()}
                    message="Your settings have been saved locally since you're not connected to internet"
                    duration={2000}
                />
                <IonToast
                    isOpen={!connectedNetworkStatus || false}
                    position="top"
                    message="You are using this app in offline mode"
                />
                <IonToast
                    cssClass={'first-time-toast'}
                    isOpen={true}
                    message="Welcome back"
                    duration={10}
                />
            </IonContent>
        </IonPage>
    );
};

export default MoviesList;