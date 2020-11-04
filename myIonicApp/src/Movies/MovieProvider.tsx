import React, { useCallback, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../core';
import { MovieProps } from './MovieProps';
import { createMovie,getMovies,updateMovie,removeMovie,newWebSocket } from './MovieApi';
import { JsxEmit } from 'typescript';

const log = getLogger('MovieProvider');

type SaveMovieFn = (movie: MovieProps) => Promise<any>;
type DeleteMovieFn = (movie: MovieProps) => Promise<any>;

export interface MoviesState {
  movies?: MovieProps[],
  fetching: boolean,
  fetchingError?: Error | null,
  saving: boolean,
  deleted:boolean,
  savingError?: Error | null,
  deleteError?:Error | null,
  saveMovie?: SaveMovieFn,
  deleteMovie?: DeleteMovieFn,
}

interface ActionProps {
  type: string,
  payload?: any,
}

const initialState: MoviesState = {
  fetching: false,
  saving: false,
  deleted:false,
};

const FETCH_MOVIES_STARTED = 'FETCH_MOVIES_STARTED';
const FETCH_MOVIES_SUCCEEDED = 'FETCH_MOVIES_SUCCEEDED';
const FETCH_MOVIES_FAILED = 'FETCH_MOVIES_FAILED';

const SAVE_MOVIE_STARTED = 'SAVE_MOVIE_STARTED';
const SAVE_MOVIE_SUCCEEDED = 'SAVE_MOVIE_SUCCEEDED';
const SAVE_MOVIE_FAILED = 'SAVE_MOVIE_FAILED';

const DELETE_MOVIE_STARTED = 'DELETE_MOVIE_STARTED';
const DELETE_MOVIE_SUCCEEDED = 'DELETE_MOVIE_SUCCEEDED';
const DELETE_MOVIE_FAILED = 'DELETE_MOVIE_FAILED';

const reducer: (state: MoviesState, action: ActionProps) => MoviesState =
  (state, { type, payload }) => {
    switch (type) {
      case FETCH_MOVIES_STARTED:
        return { ...state, fetching: true, fetchingError: null };
      case FETCH_MOVIES_SUCCEEDED:
        return { ...state, movies: payload.movies, fetching: false };
      case FETCH_MOVIES_FAILED:
        return { ...state, fetchingError: payload.error, fetching: false };
      case SAVE_MOVIE_STARTED:
        return { ...state, savingError: null, saving: true };
      case SAVE_MOVIE_SUCCEEDED:
        //console.log(JSON.stringify(payload));
        const moviesx = [...(state.movies || [])];
        const movie = payload.movie;
        const index = moviesx.findIndex(mov => mov.id === movie.id);
        if (index === -1) {
          //movies.splice(0, 0, item);
          moviesx.unshift(movie);
        } else {
          moviesx[index] = movie;
        }
        return { ...state, movies:moviesx, saving: false };
      case SAVE_MOVIE_FAILED:
        return { ...state, savingError: payload.error, saving: false };
      case DELETE_MOVIE_FAILED:
        return {...state,deleteError:payload.error,deleted:false};
      case DELETE_MOVIE_STARTED:
        return { ...state, deleteError: null, deleted: true };
      case DELETE_MOVIE_SUCCEEDED:
        const allMovies = [...(state.movies || [])];
        const theMovie = payload.movie;
        if(allMovies.find(bg => bg.id === theMovie.id)) {
          const foundIndex = allMovies.findIndex(bg => bg.id === theMovie.id);
          allMovies.splice(foundIndex, 1);
        }
        return { ...state, movies:allMovies, deleted: false };
      case DELETE_MOVIE_FAILED:
        return { ...state, deleteError: payload.error, deleted: false };
      default:
        return state;
    }
  };

export const MovieContext = React.createContext<MoviesState>(initialState);

interface MovieProviderProps {
  children: PropTypes.ReactNodeLike,
}

export const MovieProvider: React.FC<MovieProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { movies, fetching, fetchingError, saving,deleted, savingError,deleteError } = state;
  useEffect(getMoviesEffect, []);
  useEffect(wsEffect, []);
  const saveMovie = useCallback<SaveMovieFn>(saveMovieCallback, []);
  const deleteMovie = useCallback<DeleteMovieFn>(deleteMovieCallback,[]);
  const value = { movies, fetching, fetchingError, saving,deleted, savingError,deleteError, saveMovie,deleteMovie };
  log('returns');
  return (
    <MovieContext.Provider value={value}>
      {children}
    </MovieContext.Provider>
  );

  function getMoviesEffect() {
    let canceled = false;
    fetchMovies();
    return () => {
      canceled = true;
    }

    async function fetchMovies() {
      try {
        log('fetchMovies started');
        dispatch({ type: FETCH_MOVIES_STARTED });
        console.log("before movies")
        const movies = await getMovies();
        console.log(movies);
        log('fetchMovies succeeded');
        if (!canceled) {
          dispatch({ type: FETCH_MOVIES_SUCCEEDED, payload: { movies } });
        }
      } catch (error) {
        log('fetchMovies failed');
        dispatch({ type: FETCH_MOVIES_FAILED, payload: { error } });
      }
    }
  }

  async function saveMovieCallback(movie: MovieProps) {
    try {
      log('saveMovie started');
      dispatch({ type: SAVE_MOVIE_STARTED });
      const savedMovie = await (movie.id ? updateMovie(movie) : createMovie(movie));
      log('saveMovie succeeded');
      dispatch({ type: SAVE_MOVIE_SUCCEEDED, payload: { movie: savedMovie } });
    } catch (error) {
      log('saveMovie failed');
      dispatch({ type: SAVE_MOVIE_FAILED, payload: { error } });
    }
  }

  async function deleteMovieCallback(movie: MovieProps) {
    try {
      log('deleteMovie started');
      dispatch({ type: DELETE_MOVIE_STARTED });
      await removeMovie(movie);
      log('deleteMovie succeeded');
      dispatch({ type: DELETE_MOVIE_SUCCEEDED, payload : {movie} });
    } catch (error) {
      log('deleteMovie failed');
      dispatch({ type: DELETE_MOVIE_FAILED, payload: { error } });
    }
  }

  function wsEffect() {
    let canceled = false;
    log('wsEffect - connecting');
    const closeWebSocket = newWebSocket(message => {
      if (canceled) {
        return;
      }
      const { event, payload: { movie }} = message;
      log(`ws message, Movie ${event}`);
      if (event === 'created' || event === 'updated') {
        dispatch({ type: SAVE_MOVIE_SUCCEEDED, payload: { movie } });
      }
      if(event === 'deleted'){
          dispatch({type:DELETE_MOVIE_SUCCEEDED , payload: {movie} } );
      }
    });
    return () => {
      log('wsEffect - disconnecting');
      canceled = true;
      closeWebSocket();
    }
  }
};
