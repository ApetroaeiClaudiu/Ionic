import React, { useContext } from 'react';
import { RouteComponentProps } from 'react-router';
import {
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonList, IonLoading,
  IonPage,
  IonTitle,
  IonToolbar
} from '@ionic/react';
import { add} from 'ionicons/icons';
import Movie from './Movie';
import { getLogger } from '../core';
import { MovieContext } from './MovieProvider';

const log = getLogger('MoviesList');

const MoviesList: React.FC<RouteComponentProps> = ({ history }) => {
  const { movies, fetching, fetchingError } = useContext(MovieContext);
  log('render');
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Movie Management</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonLoading isOpen={fetching} message="Fetching movies" />
        {movies && (
          <IonList>
            {movies.map(({ id, director,title,year,treiD,price}) =>
            <Movie key={id} id={id} title={title} director={director} year={year} treiD={treiD} price={price} onEdit={id => history.push(`/movie/${id}`)} />)}
                {/* <IonFab vertical="center" horizontal="end" slot="fixed">
                    <IonFabButton onClick={() => history.push(`/movie/${id}`)}>
                        <IonIcon icon={remove} />
                    </IonFabButton>
                </IonFab> */}
          </IonList>
        )}
        {fetchingError && (
          <div>{fetchingError.message || 'Failed to fetch movies'}</div>
        )}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => history.push('/movie')}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default MoviesList;
