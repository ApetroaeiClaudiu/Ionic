import React, {useContext, useState} from 'react';
import {Redirect, RouteComponentProps} from 'react-router';
import {
    IonButton, IonCheckbox,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon, IonInfiniteScroll, IonInfiniteScrollContent,
    IonList,
    IonLoading,
    IonPage, IonRow, IonSearchbar, IonSelect, IonSelectOption,
    IonTitle,
    IonToolbar, useIonViewDidEnter, useIonViewWillEnter
} from '@ionic/react';
import {add} from 'ionicons/icons';
import {getLogger} from '../core';
import {AuthContext} from "../auth";
import { MovieContext } from './MovieProvider';
import Movie from './Movie';

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
    const {token, logout} = useContext(AuthContext);
    const [filter, setFilter] = useState<string | undefined>(undefined);

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
    log('render');
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>My App</IonTitle>
                    <IonButton class="ion-margin-end" onClick={handleLogout}>Logout</IonButton>
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
                            movies.map(({_id,title,director,year,treiD,price}) =>
                                <Movie key={_id} _id={_id} title={title} director={director} year={year} treiD={treiD} price={price}
                                      onEdit={_id => history.push(`/movie/${_id}`)} onDelete={_id => {
                                    _deleteMovie && _deleteMovie({_id: _id, title: title, director: director,year:year, treiD: treiD, price:price});
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
            </IonContent>
        </IonPage>
    );
};

export default MoviesList;