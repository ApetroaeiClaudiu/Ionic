import React, {useCallback, useContext, useEffect, useReducer, useState} from 'react';
import PropTypes from 'prop-types';
import {getLogger} from '../core';
import {MovieProps} from './MovieProps';
import {createMovie, deleteMovie, getMovies, newWebSocket, syncData, updateMovie} from './MovieApi';
import {AuthContext} from "../auth";
import {Plugins, Storage} from "@capacitor/core";

const log = getLogger('MovieProvider');

type SaveMovieFn = (movie: MovieProps) => Promise<any>;
type DeleteMovieFn = (movie: MovieProps) => Promise<any>;
type FetchMoviesFn = (offset: number, size: number, isGood: boolean | undefined, searchName: string) => Promise<any>;
type ReloadMoviesFn = (offset: number, size: number, isGood: boolean | undefined, searchName: string) => Promise<any>;





export interface MoviesState {
    movies?: MovieProps[],
    fetching: boolean,
    fetchingError?: Error | null,
    saving: boolean,
    savingError?: Error | null,
    saveMovie?: SaveMovieFn,
    deleting: boolean,
    deletingError?: Error | null,
    _deleteMovie?: DeleteMovieFn
    fetchMovies?: FetchMoviesFn,
    reloadMovies?: ReloadMoviesFn,
    conflictMovies?:MovieProps[],
    setConflictMovies?:Function
    connectedNetworkStatus?: boolean,
    setSavedOffline?:Function,
    savedOffline?:boolean,

}

interface ActionProps {
    type: string,
    payload?: any,
}

const initialState: MoviesState = {
    fetching: false,
    saving: false,
    deleting: false,
};

const FETCH_MOVIES_STARTED = 'FETCH_MOVIES_STARTED';
const RELOAD_MOVIES_SUCCEEDED = 'RELOAD_MOVIES_SUCCEEDED';
const FETCH_MOVIES_SUCCEEDED = 'FETCH_MOVIES_SUCCEEDED';
const FETCH_MOVIES_FAILED = 'FETCH_MOVIES_FAILED';
const SAVE_MOVIE_STARTED = 'SAVE_MOVIE_STARTED';
const DELETE_MOVIE_STARTED = 'DELETE_MOVIE_STARTED';
const DELETE_MOVIE_FAILED = 'DELETE_MOVIE_FAILED';
const DELETE_MOVIE_SUCCEEDED = 'DELETE_MOVIE_SUCCEEDED';
const SAVE_MOVIE_SUCCEEDED = 'SAVE_MOVIE_SUCCEEDED';
const SAVE_MOVIE_FAILED = 'SAVE_MOVIE_FAILED';

const reducer: (state: MoviesState, action: ActionProps) => MoviesState =
    (state, {type, payload}) => {
        switch (type) {
            case FETCH_MOVIES_STARTED:
                return {...state, fetching: true, fetchingError: null};
            case FETCH_MOVIES_SUCCEEDED: {
                const movies = [...(state.movies || [])];
                return {...state, movies: movies.concat(payload.movies), fetching: false};
            }
            case RELOAD_MOVIES_SUCCEEDED: {
                return {...state, movies: payload.movies, fetching: false};
            }
            case FETCH_MOVIES_FAILED:
                return {...state, fetchingError: payload.error, fetching: false};
            case SAVE_MOVIE_STARTED:
                return {...state, savingError: null, saving: true};
            case SAVE_MOVIE_SUCCEEDED:
                const movies = [...(state.movies || [])];
                const item = payload.item;
                const index = movies.findIndex(it => it._id === item._id);
                if (index === -1) {
                    movies.splice(0, 0, item);
                } else {
                    movies[index] = item;
                }
                return {...state, movies, saving: false};
            case SAVE_MOVIE_FAILED:
                return {...state, savingError: payload.error, saving: false};
            case DELETE_MOVIE_STARTED:
                return {...state, deletingError: null, deleting:true};
            case DELETE_MOVIE_SUCCEEDED: {
                const movies = [...(state.movies || [])];
                const item = payload.item;
                const index = movies.findIndex(it => it._id === item._id);
                if (index !== -1) {
                    movies.splice(index, 1);
                }
                return {...state, movies, deleting: false};
            }
            default:
                return state;
        }
    };

export const MovieContext = React.createContext<MoviesState>(initialState);

interface MovieProviderProps {
    children: PropTypes.ReactNodeLike,
}

const {Network} = Plugins;

export const MovieProvider: React.FC<MovieProviderProps> = ({children}) => {
    const [connectedNetworkStatus, setConnectedNetworkStatus] = useState<boolean>(false);
    Network.getStatus().then(status => setConnectedNetworkStatus(status.connected));
    const [savedOffline, setSavedOffline] = useState<boolean>(false);
    const [conflictMovies, setConflictMovies] = useState<MovieProps[]>([]);

    const {token, _id} = useContext(AuthContext);
    const [state, dispatch] = useReducer(reducer, initialState);
    const {movies, fetching, fetchingError, saving, savingError, deleting, deletingError} = state;
    useEffect(getMoviesEffect, [token]);
    useEffect(wsEffect, [token]);
    useEffect(networkEffect, [token, setConflictMovies, setConnectedNetworkStatus]);

    const saveMovie = useCallback<SaveMovieFn>(saveMovieCallback, [token,connectedNetworkStatus,setSavedOffline]);
    const _deleteMovie = useCallback<DeleteMovieFn>(deleteMovieCallback, [token,connectedNetworkStatus,setSavedOffline]);
    const value = {movies,
         fetching,
         fetchingError, 
         saving, 
         savingError, 
         saveMovie, 
         deleting, 
         deletingError, 
         _deleteMovie, 
         fetchMovies, 
         reloadMovies,
         connectedNetworkStatus,
         savedOffline,
         setSavedOffline,
         conflictMovies,};
    //log('returns');
    return (
        <MovieContext.Provider value={value}>
            {children}
        </MovieContext.Provider>
    );

    function networkEffect(){
        console.log("network effect");
        let canceled = false;
        Network.addListener('networkStatusChange',async(status)=>{
            if(canceled){
                return;
            }
            const connected:boolean = status.connected;
            if(connected){
                console.log("syncing"); 
                const conflicts = await syncData(token,_id);
                setConflictMovies(conflicts);
            }
            console.log(status.connected);
            setConnectedNetworkStatus(status.connected);
        });
        return () =>{
            canceled = true;
        }
    }


    async function fetchMovies(offset: number, size: number, isGood: boolean | undefined, searchName: string) {
        if(!token?.trim()){
            return;
        }
        try {
            //log('fetchMovies started');
            dispatch({type: FETCH_MOVIES_STARTED});
            const movies = await getMovies(token, offset, size, isGood, searchName);
            console.log(movies);
            //log('fetchMovies succeeded');
            dispatch({type: FETCH_MOVIES_SUCCEEDED, payload: {movies}});
        } catch (error) {
            //log('fetchMovies failed');
            alert("OFFLINE!");
            const storageMovies: any[] = [];
            await Storage.keys().then(function (allKeys) {
                allKeys.keys.forEach((key) => {
                    Storage.get({key}).then(function (it) {
                        try {
                            const object = JSON.parse(it.value);
                            console.log(object);
                            let isGoodFilter = true;
                            if(isGood !== undefined){
                                isGoodFilter = object.isGood === isGood;
                            }
                            let nameFilter = true;
                            if(searchName !== ''){
                                nameFilter = new RegExp(`^${searchName}`).test(object.title);
                            }
                            if (String(object.userId) === String(_id) && isGoodFilter && nameFilter)
                                storageMovies.push(object);
                        } catch (e) {
                        }
                    });
                })
            });
            dispatch({type: RELOAD_MOVIES_SUCCEEDED, payload: {movies: storageMovies}});
        }
    }

    async function reloadMovies(offset: number, size: number, isGood: boolean | undefined, searchName: string) {
        if(!token?.trim()){
            return;
        }
        try {
            //log(`reloadMovies started with searchName = ${searchName}`);
            dispatch({type: FETCH_MOVIES_STARTED});
            const movies = await getMovies(token, 0, offset + size, isGood, searchName);
            //log('reloadMovies succeeded');
            dispatch({type: RELOAD_MOVIES_SUCCEEDED, payload: {movies}});
        } catch (error) {
            //log('reloadMovies failed');
            alert("OFFLINE!");
            const storageMovies: any[] = [];
            await Storage.keys().then(function (allKeys) {
                allKeys.keys.forEach((key) => {
                    Storage.get({key}).then(function (it) {
                        try {
                            const object = JSON.parse(it.value);
                            let isGoodFilter = true;
                            if(isGood !== undefined){
                                isGoodFilter = object.isGood === isGood;
                            }
                            let nameFilter = true;
                            if(searchName !== ''){
                                nameFilter = new RegExp(`^${searchName}`).test(object.title);
                            }
                            if (String(object.userId) === String(_id) && isGoodFilter && nameFilter)
                                storageMovies.push(object);
                        } catch (e) {
                        }
                    });
                })
            });
            dispatch({type: RELOAD_MOVIES_SUCCEEDED, payload: {movies: storageMovies}});
        }
    }

    function getMoviesEffect() {
        let canceled = false;
        // fetchMovies(0, 100000);
        return () => {
            canceled = true;
        }

    }

    async function saveMovieCallback(item: MovieProps) {
        try {
            // log('saveMovie started');
            if(connectedNetworkStatus===true){
                console.log(item.version);
                dispatch({type: SAVE_MOVIE_STARTED});
                console.log("UPDATE " + item.webViewPath);
                const savedMovie:MovieProps = await (item._id ? updateMovie(token, item) : createMovie(token, item));
                if(savedMovie.hasConflicts){
                    console.log(savedMovie.version);
                    console.log("AM GASIT CONFLICTE");
                    item.version = savedMovie.version;
                    const res = [];
                    res.push(item,savedMovie);
                    setConflictMovies(res);
                    return;
                }
                //setConflictMovies([item,item]);
                dispatch({type: SAVE_MOVIE_SUCCEEDED, payload: {item: savedMovie}}); 
                console.log("adaugam in server");   
            }
            else{
                //alert("You are offline! The item is saved locally!");
                if(!item._id){
                    item._id = String(Date.now());
                    item.version = -1;
                }
                //item._id = item._id ? item._id : String(Date.now())
                item.userId = _id;
                item.hasConflicts = false;
                await Storage.set({
                    key: String(item._id),
                    value: JSON.stringify(item)
                });
                dispatch({type: SAVE_MOVIE_SUCCEEDED, payload: {item}});
                setSavedOffline(true);
            }
        } catch (error) {
            //log('saveMovie failed');
            alert("OFFLINE!");
            item._id = item._id ? item._id : String(Date.now())
            item.userId = _id;
            console.log("adaugam in local storage");
            await Storage.set({
                key: String(item._id),
                value: JSON.stringify(item)
            });
            dispatch({type: SAVE_MOVIE_SUCCEEDED, payload: {item}});
        }
    }

    async function deleteMovieCallback(item: MovieProps) {
      try {
        // log('deleteMovie started');
        if(connectedNetworkStatus===true){
            dispatch({type: DELETE_MOVIE_STARTED});
            const deletedMovie = await deleteMovie(token, item._id as string);
            //log('deleteMovie succeeded');
            dispatch({type: DELETE_MOVIE_SUCCEEDED, payload: {item: item}});    
        }
        else{
            await Storage.remove({
                key: String(item._id)
            });
            dispatch({type: DELETE_MOVIE_SUCCEEDED, payload: {item}});
            setSavedOffline(true);        
        }
      } catch (error) {
        //log('deleteMovie failed');
          alert("OFFLINE!");
          await Storage.remove({
              key: String(item._id)
          });
        dispatch({type: DELETE_MOVIE_SUCCEEDED, payload: {item}});
      }
    }

    function wsEffect() {
        let canceled = false;
       // log('wsEffect - connecting');
        let closeWebSocket: () => void;
        if (token?.trim()) {
            closeWebSocket = newWebSocket(token, message => {
                if (canceled) {
                    return;
                }
                const {type, payload: item} = message;
                console.log('Message', JSON.stringify(message))
                //log(`ws message, item ${type}`);
                if (type === 'created' || type === 'updated') {
                    dispatch({type: SAVE_MOVIE_SUCCEEDED, payload: {item}});
                } else if (type === 'deleted') {
                    dispatch({type: DELETE_MOVIE_SUCCEEDED, payload: {item}});
                }
            });
        }
        return () => {
            //log('wsEffect - disconnecting');
            canceled = true;
            closeWebSocket?.();
        }
    }
};